import { useEffect, useRef, useState } from 'react'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { InlineMessage } from '@/bbl/inline-message'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import {
  IMPORT_COPY,
  IMPORT_FAIL_SENTINEL,
  UPLOAD_MS,
  isJsonl,
  parseTemplates,
  presetFile,
  sizeProblem,
  type FileCheck,
  type ImportPreset,
} from '@/data/import-spec'
import type { Template } from '@/data/templates'
import { UploadZone } from '@/components/upload/UploadZone'
import { UploadedFile } from '@/components/upload/UploadedFile'

type Problem = Extract<FileCheck, { ok: false }>
/** `size` is `file.size`, except on a preset route that stands in for a large file.
 *  `problem` is what Import found wrong with the file; nothing is checked on pick. */
type Picked = { key: number; file: File; size: number; problem: Problem | null }
/** `replace`: the upload found the file name imported before and asks "Replace imported templates?". */
type Phase = 'idle' | 'uploading' | 'failed' | 'replace'

/* The slot's meta is the file type only (requester, 27 Oct 2026: not sure the size can be read
   reliably; was CMS's "type • size", useAssetSlotUpload `fileSizeLabel`). The size still feeds the 10 MB check. */
const typeLabel = (name: string) => (name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toUpperCase() : 'File')

/**
 * Import templates — a dialog on the list (Korn, 2026-10-05). Shell is webds
 * `confirm-dialog` (`sectioned`, the CNH dialog set), 444 wide: webds Dialog
 * `Max Width=XS`, for this dialog and Import over…? (requester, 20 Oct 2026).
 * It was 800 while Import took many files, then 600 (the sectioned dialog's
 * measured width) once it took one (review comment, 19 Oct 2026).
 *
 * One file per import (requester, 15 Oct 2026), the way a CMS asset slot
 * takes one: the 84-tall drop zone until a file is picked, then the file's
 * slot in its place, with no Preview: the users are not technical and will
 * not open the file to read it (BA, 22 Oct 2026). A drag of two or more files turns the
 * zone Negative with CMS's "1 File Only" while it is over the zone, and the
 * drop is refused, so the files fly back (design critique, 20 Oct 2026; the
 * error is back by the BA's MoM, 29 Oct 2026, after 27–29 Oct without it; was:
 * the drop landed and took none). The control takes .jsonl only: the chooser
 * filters by it and a dropped file of another type is not taken, so there is
 * no Invalid file format state (requester, 22 Oct 2026).
 *
 * Picking a file only puts it in the slot. The checks run on Import
 * (requester, 22 Oct 2026; was: the moment the file was picked): a file, then
 * 10 MB (CMS's limit) before the upload, then — under the upload spinner —
 * the file name imported before and the upload itself. A file over 10 MB
 * reads "Max file size: 10 MB" in its slot, CMS's upload-failed slot without
 * Try again, and blocks Import until the file is removed. No template field
 * is checked (requester, 27 Oct 2026; was "Invalid template structure: …"
 * under the slot); a file with no line of JSON fails the upload.
 *
 * A file whose name was imported before asks first (requester, 15 Oct 2026):
 * "Replace imported templates?", and Replace swaps that earlier import's templates.
 * Since the design critique (20 Oct 2026) it is never a dialog over a dialog:
 * the upload spinner validates the file inside this dialog, and only then does
 * this dialog close and "Replace imported templates?" open, alone on the list.
 * Its Replace uploads again. Its Cancel goes back to this dialog with the file
 * still in its slot, for the user to remove (BA, 22 Oct 2026; was: closed it
 * and stayed on the list).
 */
export function ImportDialog({
  open,
  onClose,
  onImported,
  importedNames,
  preset,
}: {
  open: boolean
  onClose: () => void
  /** `replace` is true when the user chose to import over an earlier import of the same file name. */
  onImported: (templates: Template[], fileName: string, replace: boolean) => void
  /** File names imported before — picking one of these asks before importing over it. */
  importedNames: string[]
  preset?: ImportPreset
}) {
  const [picked, setPicked] = useState<Picked | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState<string | null>(null)
  /* Only the `too-many` route sets this: it draws the refused drag, which a live drop never leaves behind. */
  const [tooMany, setTooMany] = useState(false)
  const nextKey = useRef(0)
  /* Whether the last upload was an import over: Try again repeats it without asking again. */
  const lastReplace = useRef(false)
  const uploading = phase === 'uploading'

  useEffect(() => {
    if (!open || !preset) return
    const demo = presetFile(preset)
    if (demo) {
      const file = new File([demo.text], demo.name, { type: 'application/jsonl' })
      const size = demo.size ?? file.size
      const problem = preset === 'too-large' ? sizeProblem(size) : null
      setPicked({ key: nextKey.current++, file, size, problem })
    } else setPicked(null)
    setPhase(preset === 'uploading' ? 'uploading' : preset === 'failure' ? 'failed' : preset === 'duplicate' ? 'replace' : 'idle')
    setMessage(preset === 'no-file' ? IMPORT_COPY.noFile : null)
    setTooMany(preset === 'too-many')
  }, [open, preset])

  const failed = phase === 'failed'
  const problem = picked?.problem ?? null
  const noFile = message === IMPORT_COPY.noFile

  const reset = () => {
    setPicked(null)
    setPhase('idle')
    setMessage(null)
    setTooMany(false)
  }
  const close = () => {
    if (uploading) return
    reset()
    onClose()
  }

  const add = (list: FileList | null) => {
    if (!list?.length) return
    /* The zone refuses a drop of two or more (maxFiles); the chooser takes one. */
    if (list.length > 1) return
    const file = list[0]
    /* The chooser offers .jsonl only; a dropped file of another type is not taken. */
    if (!isJsonl(file.name)) return
    setMessage(null)
    setPhase('idle')
    setTooMany(false)
    setPicked({ key: nextKey.current++, file, size: file.size, problem: null })
  }

  const remove = () => {
    setPicked(null)
    setMessage(null)
    setPhase('idle')
  }

  /* Cancel on "Replace imported templates?": back to the Import dialog, the file still picked. */
  const backToFile = () => setPhase('idle')

  /* The file name imported before, then the upload — both under the spinner. */
  const upload = (replace: boolean) => {
    if (!picked) return
    lastReplace.current = replace
    setMessage(null)
    setPhase('uploading')
    const { file } = picked
    const fails = file.name.toLowerCase().includes(IMPORT_FAIL_SENTINEL)
    const read = file.text().then(parseTemplates)
    window.setTimeout(() => {
      void read.then((check) => {
        if (!check.ok) return setPhase('failed')
        if (!replace && importedNames.includes(file.name)) return setPhase('replace')
        if (fails) return setPhase('failed')
        reset()
        onImported(check.templates, file.name, replace)
      })
    }, UPLOAD_MS)
  }

  const submit = () => {
    if (!picked) return setMessage(IMPORT_COPY.noFile)
    if (picked.problem) return setMessage(IMPORT_COPY.hasErrors)
    const tooBig = sizeProblem(picked.size)
    if (tooBig) return setPicked({ ...picked, problem: tooBig })
    upload(false)
  }

  return (
    <>
      <ConfirmDialog
        open={open && phase !== 'replace'}
        anatomy="sectioned"
        layer="fixed"
        width={444}
        title={IMPORT_COPY.title}
        cancelLabel="Cancel"
        confirmLabel="Import"
        onCancel={close}
        onConfirm={submit}
        onDismiss={uploading ? undefined : close}
        className="relative z-50"
      >
        <div className="flex flex-col gap-[var(--space-4)]">
          {uploading && (
            /* Uploading covers the whole dialog — title, body and actions (requester, 21 Oct 2026,
               back to Korn 2026-10-05; 15–21 Oct it was a Scrim Strong over the whole page, CMS's SubmitOverlay).
               Spinner only, no text (requester, 21 Oct 2026): the copy stays as its label for screen readers. */
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 z-[1] flex items-center justify-center rounded-[var(--radius-3)] bg-[var(--color-surface-primary-default)]"
            >
              <SpinnerLoader size="l" label={IMPORT_COPY.uploading} />
            </div>
          )}

          {picked ? (
            /* CMS's upload-failed slot (design request, 20 Oct 2026) for an upload that failed, with
               Try again, and for a file over 10 MB, without it (requester, 22 Oct 2026). */
            <UploadedFile
              name={picked.file.name}
              meta={typeLabel(picked.file.name)}
              error={!!problem || failed}
              errorMessage={failed ? IMPORT_COPY.failTitle : problem?.message}
              errorPlacement="slot"
              retryLabel={IMPORT_COPY.retry}
              onRetry={failed ? () => upload(lastReplace.current) : undefined}
              onRemove={remove}
            />
          ) : (
            /* The CMS prototype's upload zone (components/upload) — webds ships none. */
            <UploadZone
              buttonLabel={IMPORT_COPY.browse}
              hint={IMPORT_COPY.dropTitle}
              accept=".jsonl"
              maxFiles={1}
              tooManyHint={IMPORT_COPY.oneFile}
              error={tooMany || noFile}
              /* Inside the zone, as "1 File Only" reads (requester, 29 Oct 2026; was an Inline Message under it). */
              errorHint={tooMany ? IMPORT_COPY.oneFile : noFile ? IMPORT_COPY.noFile : undefined}
              onFiles={add}
            />
          )}

          {/* webds Inline Message under the matrix, inset to the zone's text as CMS's required message is. */}
          {message && !noFile && (
            <InlineMessage appearance="negative" size="xs" className="pl-[var(--space-4)]">
              {message}
            </InlineMessage>
          )}
        </div>
      </ConfirmDialog>

      {phase === 'replace' && picked && (
        /* Alone on the list: the Import dialog is closed by now (design critique, 20 Oct 2026). */
        <ConfirmDialog
          anatomy="sectioned"
          contentType="label-xl"
          layer="fixed"
          width={444}
          title={IMPORT_COPY.replaceTitle}
          cancelLabel="Cancel"
          confirmLabel={IMPORT_COPY.replaceConfirm}
          onCancel={backToFile}
          onConfirm={() => upload(true)}
          onDismiss={backToFile}
          className="relative z-50"
        >
          <p className="type-body-m text-[var(--color-text-primary-default)]">{IMPORT_COPY.replaceBody(picked.file.name)}</p>
        </ConfirmDialog>
      )}
    </>
  )
}
