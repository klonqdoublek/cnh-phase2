import { useEffect, useRef, useState } from 'react'
import { Alert } from '@/bbl/alert'
import { Icon } from '@/bbl/icon'
import { Scrim } from '@/bbl/building-block-scrim'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import {
  IMPORT_COPY,
  IMPORT_FAIL_SENTINEL,
  UPLOAD_MS,
  checkFile,
  presetFile,
  type FileCheck,
  type ImportPreset,
} from '@/data/import-spec'
import type { Template } from '@/data/templates'
import { UploadZone } from '@/components/upload/UploadZone'
import { UploadedFile } from '@/components/upload/UploadedFile'
import { FilePreviewDialog, PREVIEW_COPY } from '@/components/upload/FilePreviewDialog'

/** `size` is `file.size`, except on a preset route that stands in for a large file. */
type Picked = { key: number; file: File; size: number; check: FileCheck | null }
type Phase = 'idle' | 'uploading' | 'failed'

/* CMS's `fileSizeLabel` and its "type • size" meta (useAssetSlotUpload, UploadedAssetSlot). */
const sizeLabel = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
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
 * slot with a Preview in its place. A drag of two or more files turns the
 * zone Negative with CMS's "1 File Only" while it is over the zone, and the
 * drop is refused, so the files fly back (design critique, 20 Oct 2026; was:
 * the drop landed and took none). The file is checked the
 * moment it is picked — format, then size (10 MB, CMS's limit), then
 * structure — and a file in error blocks Import until it is removed. Files
 * with a wrong extension are still taken and flagged — the original build's
 * Invalid file format state.
 *
 * A file whose name was imported before is flagged in this same dialog once
 * the file has been checked: a Caution Alert under the slot says its
 * templates will be replaced, and Import imports over that earlier import.
 * One pop-up, never a dialog over a dialog (design critique, 20 Oct 2026;
 * was a second "Import over <name>?" dialog after Import, requester 15 Oct).
 *
 * Preview hides this dialog while Document Preview is open — one scrim, not a
 * darker one on top — and Preview's Import imports from there (critique,
 * 20 Oct 2026).
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
  const [previewing, setPreviewing] = useState<File | null>(null)
  const nextKey = useRef(0)
  const uploading = phase === 'uploading'

  useEffect(() => {
    if (!open || !preset) return
    const demo = presetFile(preset)
    if (demo) {
      const file = new File([demo.text], demo.name, { type: demo.name.endsWith('.jsonl') ? 'application/jsonl' : 'text/csv' })
      const size = demo.size ?? file.size
      const key = nextKey.current++
      setPicked({ key, file, size, check: null })
      checkFile(file, size).then((check) => setPicked((p) => (p?.key === key ? { ...p, check } : p)))
    } else setPicked(null)
    setPhase(preset === 'uploading' ? 'uploading' : preset === 'failure' ? 'failed' : 'idle')
    setMessage(preset === 'no-file' ? IMPORT_COPY.noFile : null)
    setTooMany(preset === 'too-many')
  }, [open, preset])

  const bad = !!picked?.check && !picked.check.ok
  /* Shown only after the file has been checked and passed. */
  const duplicate = !!picked?.check?.ok && importedNames.includes(picked.file.name)
  const templateCount = picked?.check?.ok ? picked.check.templates.length : 0

  const reset = () => {
    setPicked(null)
    setPhase('idle')
    setMessage(null)
    setTooMany(false)
    setPreviewing(null)
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
    setMessage(null)
    setPhase('idle')
    setTooMany(false)
    const file = list[0]
    const key = nextKey.current++
    setPicked({ key, file, size: file.size, check: null })
    checkFile(file).then((check) => setPicked((p) => (p?.key === key ? { ...p, check } : p)))
  }

  const remove = () => {
    setPicked(null)
    setMessage(null)
    setPhase('idle')
  }

  const upload = (replace: boolean) => {
    if (!picked?.check?.ok) return
    setMessage(null)
    setPhase('uploading')
    const { file, check } = picked
    const fails = file.name.toLowerCase().includes(IMPORT_FAIL_SENTINEL)
    window.setTimeout(() => {
      if (fails) return setPhase('failed')
      reset()
      onImported(check.templates, file.name, replace)
    }, UPLOAD_MS)
  }

  const submit = () => {
    if (!picked) return setMessage(IMPORT_COPY.noFile)
    if (!picked.check || !picked.check.ok) return setMessage(IMPORT_COPY.hasErrors)
    upload(duplicate)
  }

  return (
    <>
      <ConfirmDialog
        open={open && !previewing}
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
          {phase === 'failed' && (
            <div
              role="alert"
              className="flex items-start gap-[var(--space-3)] rounded-[var(--radius-2)] bg-[var(--color-surface-negative-subtle-default)] px-[var(--space-4)] py-[var(--space-3)]"
            >
              <Icon slug="caution" size={24} color="var(--color-icon-negative-default)" />
              <div>
                <p className="type-label-m-emphasized text-[var(--color-text-negative-strong-default)]">{IMPORT_COPY.failTitle}</p>
                <p className="type-body-s text-[var(--color-text-negative-strong-default)]">{IMPORT_COPY.failBody}</p>
              </div>
            </div>
          )}

          {picked ? (
            <UploadedFile
              name={picked.file.name}
              meta={`${typeLabel(picked.file.name)} • ${sizeLabel(picked.size)}${
                !picked.check
                  ? ' • Checking…'
                  : picked.check.ok
                    ? ` • ${templateCount} ${templateCount === 1 ? 'template' : 'templates'}`
                    : ''
              }`}
              error={bad}
              errorMessage={picked.check && !picked.check.ok ? picked.check.message : undefined}
              previewLabel={PREVIEW_COPY.preview}
              onPreview={() => setPreviewing(picked.file)}
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
              error={tooMany || message === IMPORT_COPY.noFile}
              errorHint={tooMany ? IMPORT_COPY.oneFile : undefined}
              onFiles={add}
            />
          )}

          {duplicate && (
            <Alert
              appearance="caution"
              title={IMPORT_COPY.duplicateTitle}
              description={IMPORT_COPY.duplicateBody}
              /* The slot the file names for Caution: Icon/24px/Illustration/Caution. */
              icon={<Icon slug="caution" size={24} color="var(--color-icon-caution-default)" />}
            />
          )}

          {/* CMS's required message under the matrix: Body XS, Text/Negative. */}
          {message && <span className="pl-[var(--space-4)] type-body-xs text-[var(--color-text-negative-default)]">{message}</span>}
        </div>
      </ConfirmDialog>

      {uploading && (
        /* Uploading covers the whole page (requester, 15 Oct 2026; was the dialog only,
           Korn 2026-10-05): CMS's SubmitOverlay — Scrim Strong and an on-inverse spinner, above the dialog layer (z 100). */
        <Scrim
          appearance="strong"
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[200] flex-col items-center justify-center gap-[var(--space-3)] px-0"
        >
          <SpinnerLoader size="l" appearance="on-inverse" label={IMPORT_COPY.uploading} />
          <p className="mt-[var(--space-2)] type-heading-xxs-emphasized text-[var(--color-text-primary-inverse-default)]">
            {IMPORT_COPY.uploading}
          </p>
        </Scrim>
      )}
      <FilePreviewDialog
        file={previewing}
        onClose={() => setPreviewing(null)}
        confirmLabel="Import"
        onConfirm={() => {
          setPreviewing(null)
          submit()
        }}
      />
    </>
  )
}
