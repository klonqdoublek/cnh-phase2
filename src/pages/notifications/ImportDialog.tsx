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
  recordKey,
  sizeProblem,
  type FileCheck,
  type ImportPreset,
} from '@/data/import-spec'
import type { Template } from '@/data/templates'
import { FileUpload } from '@/components/upload/CoreFileUpload'

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
 * takes one: the File Upload zone until a file is picked, then the file's
 * slot in its place, with no Preview: the users are not technical and will
 * not open the file to read it (BA, 22 Oct 2026). No drag and drop, as
 * Broadcast (BA Natsinee, Figma comments 18 Nov 2026): files come from the
 * chooser only, and the chooser takes one file, so "more than one file" and
 * "drop to replace" cannot happen (was: a drag of two or more turned the zone
 * Negative with "1 File Only", 29 Oct 2026; a file dropped on the slot
 * replaced it, 28 Oct 2026). The chooser filters by .jsonl; a file of another
 * type is not taken, so there is no Invalid file format state (requester,
 * 22 Oct 2026).
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
 *
 */
export function ImportDialog({
  open,
  onClose,
  onImported,
  importedRecords,
  preset,
}: {
  open: boolean
  onClose: () => void
  /** `replace` is true when the user went ahead over records imported before. */
  onImported: (templates: Template[], fileName: string, replace: boolean) => void
  /** Records (template names, record keys) imported before — a file holding one asks first. */
  importedRecords: string[]
  preset?: ImportPreset
}) {
  const [picked, setPicked] = useState<Picked | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState<string | null>(null)
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
  }, [open, preset])

  const failed = phase === 'failed'
  const problem = picked?.problem ?? null
  const noFile = message === IMPORT_COPY.noFile

  const reset = () => {
    setPicked(null)
    setPhase('idle')
    setMessage(null)
  }
  const close = () => {
    if (uploading) return
    reset()
    onClose()
  }

  const add = (list: FileList | null) => {
    if (!list?.length) return
    /* The chooser takes one file (no `multiple`). */
    const file = list[0]
    /* The chooser offers .jsonl only; a file of another type is not taken. */
    if (!isJsonl(file.name)) return
    setMessage(null)
    setPhase('idle')
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
        /* Some record imported before? (BA Natsinee, 18 Nov 2026): any template in the file whose
           name was imported before (24 Nov 2026; was the file name). The backend checks it; the
           prototype stands in so the question shows. */
        if (!replace && check.templates.some((t) => importedRecords.includes(recordKey(t.name)))) return setPhase('replace')
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

          {/* Core Website Design Library's File Upload (requester, 24 Nov 2026; was the CMS prototype's
             UploadZone and UploadedFile), as the Import Figma places it: State=Default with Title
             Browse file, State=Error for no file with the message as its Description, State=Upload - Success
             for the picked file (metadata JSONL, no Preview), State=Upload - Error with the message as
             its Inline Message for a file over 10 MB and for an upload that failed. Try again stays on
             the failed upload (code since 20 Oct 2026; the Figma failure screen hides Has Action). */}
          {picked ? (
            <FileUpload
              state={problem || failed ? 'upload-error' : 'upload-success'}
              fileName={picked.file.name}
              fileMetadata={typeLabel(picked.file.name)}
              inlineMessage={failed ? IMPORT_COPY.failTitle : problem?.message}
              actionLabel={IMPORT_COPY.retry}
              onAction={failed ? () => upload(lastReplace.current) : undefined}
              onRemove={remove}
            />
          ) : (
            <FileUpload
              state={noFile ? 'error' : 'default'}
              title={IMPORT_COPY.browse}
              description={noFile ? IMPORT_COPY.noFile : IMPORT_COPY.dropTitle}
              accept=".jsonl"
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
