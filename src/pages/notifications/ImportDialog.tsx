import { useEffect, useRef, useState } from 'react'
import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { InlineMessage } from '@/bbl/inline-message'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import {
  IMPORT_COPY,
  IMPORT_FAIL_SENTINEL,
  MAX_IMPORT_FILES,
  UPLOAD_MS,
  checkFile,
  parseTemplates,
  presetFiles,
  type FileCheck,
  type ImportPreset,
} from '@/data/import-spec'
import type { Template } from '@/data/templates'
import { UploadZone } from '@/components/upload/UploadZone'
import { UploadedFile } from '@/components/upload/UploadedFile'

type Picked = { key: number; file: File; check: FileCheck | null }
type Phase = 'idle' | 'uploading' | 'failed'

const sizeLabel = (bytes: number) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(+(bytes < 10240))} KB`)
const isBad = (p: Picked) => p.check !== null && !p.check.ok

/**
 * Import templates — a dialog on the list (Korn, 2026-10-05): several .jsonl
 * files at once, each checked the moment it is picked; any file in error
 * blocks the import until it is removed. Shell is webds `confirm-dialog`
 * (`sectioned`, the CNH dialog set), 800 wide.
 */
export function ImportDialog({
  open,
  onClose,
  onImported,
  preset,
}: {
  open: boolean
  onClose: () => void
  onImported: (templates: Template[]) => void
  preset?: ImportPreset
}) {
  const [files, setFiles] = useState<Picked[]>([])
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const nextKey = useRef(0)
  const uploading = phase === 'uploading'

  useEffect(() => {
    if (!open || !preset) return
    setFiles(
      presetFiles(preset).map(({ name, text }) => ({
        key: nextKey.current++,
        file: new File([text], name, { type: name.endsWith('.jsonl') ? 'application/jsonl' : 'text/csv' }),
        check: parseTemplates(name, text),
      })),
    )
    setPhase(preset === 'uploading' ? 'uploading' : preset === 'failure' ? 'failed' : 'idle')
    setMessage(preset === 'no-file' ? IMPORT_COPY.noFile : null)
  }, [open, preset])

  const bad = files.filter(isBad)
  const templateCount = files.reduce((n, f) => n + (f.check?.ok ? f.check.templates.length : 0), 0)
  /* Files in error sort to the top. */
  const ordered = [...bad, ...files.filter((f) => !isBad(f))]

  const reset = () => {
    setFiles([])
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
    const all = Array.from(list)
    const kept = all.slice(0, Math.max(0, MAX_IMPORT_FILES - files.length))
    const left = all.length - kept.length
    const picked = kept.map((file) => ({ key: nextKey.current++, file, check: null }))
    setFiles((current) => [...current, ...picked])
    setMessage(left > 0 ? IMPORT_COPY.tooMany(MAX_IMPORT_FILES, left) : null)
    setPhase('idle')
    picked.forEach(({ key, file }) =>
      checkFile(file).then((check) => setFiles((current) => current.map((f) => (f.key === key ? { ...f, check } : f)))),
    )
  }

  const remove = (keys: number[]) => {
    setFiles((current) => current.filter((f) => !keys.includes(f.key)))
    setMessage(null)
    setPhase('idle')
  }

  const submit = () => {
    if (files.length === 0) return setMessage(IMPORT_COPY.noFile)
    if (files.some((f) => !f.check || !f.check.ok)) return setMessage(IMPORT_COPY.hasErrors)
    setMessage(null)
    setPhase('uploading')
    const fails = files.some((f) => f.file.name.toLowerCase().includes(IMPORT_FAIL_SENTINEL))
    window.setTimeout(() => {
      if (fails) return setPhase('failed')
      const templates = files.flatMap((f) => (f.check?.ok ? f.check.templates : []))
      reset()
      onImported(templates)
    }, UPLOAD_MS)
  }

  return (
    <ConfirmDialog
      open={open}
      anatomy="sectioned"
      layer="fixed"
      width={800}
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
          /* Uploading covers the whole dialog — title, body and actions (Korn, 2026-10-05). */
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-[var(--space-3)] rounded-[var(--radius-3)] bg-[var(--color-surface-primary-default)]"
          >
            <SpinnerLoader size="l" />
            <p className="mt-[var(--space-2)] type-heading-xxs-emphasized text-[var(--color-text-primary-default)]">
              {IMPORT_COPY.uploading}
            </p>
          </div>
        )}

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

        {/* The CMS prototype's upload zone (components/upload) — webds ships none. */}
        {files.length === 0 ? (
          <UploadZone
            buttonLabel={IMPORT_COPY.browse}
            hint={[IMPORT_COPY.dropTitle, IMPORT_COPY.dropHint]}
            accept=".jsonl"
            multiple
            error={message === IMPORT_COPY.noFile}
            onFiles={add}
          />
        ) : (
          <UploadZone layout="bar" buttonLabel={IMPORT_COPY.browse} hint={IMPORT_COPY.dropMore} accept=".jsonl" multiple onFiles={add} />
        )}

        {files.length > 0 && (
          <div className="flex min-h-[32px] items-center justify-between gap-[var(--space-4)]">
            <p className="type-label-m-emphasized text-[var(--color-text-primary-default)]">
              {IMPORT_COPY.summary(files.length, templateCount)}
              {bad.length > 0 && (
                <span className="text-[var(--color-text-negative-default)]">
                  {' · '}
                  {IMPORT_COPY.errorCount(bad.length)}
                </span>
              )}
            </p>
            {bad.length > 0 && (
              <GhostButton appearance="negative" className="h-[32px]" onClick={() => remove(bad.map((f) => f.key))}>
                {IMPORT_COPY.removeErrors(bad.length)}
              </GhostButton>
            )}
          </div>
        )}

        {files.length > 0 && (
          /* ~10 one-line rows at 40, capped by the viewport. The right gutter is
             for an overlay scrollbar, which would otherwise sit over the ×. */
          <ul
            aria-label="Selected files"
            className="flex max-h-[min(400px,40vh)] list-none flex-col overflow-y-auto border-t border-[var(--color-border-primary-default)] pr-[var(--space-3)]"
          >
            {ordered.map(({ key, file, check }) => {
              const error = !!check && !check.ok
              const meta = check
                ? check.ok
                  ? `${sizeLabel(file.size)} · ${check.templates.length} ${check.templates.length === 1 ? 'template' : 'templates'}`
                  : check.message
                : 'Checking…'
              return (
                <li key={key}>
                  <UploadedFile name={file.name} meta={meta} error={error} density="row" onRemove={() => remove([key])} />
                </li>
              )
            })}
          </ul>
        )}

        {message && (
          <InlineMessage appearance="negative" size="s">
            {message}
          </InlineMessage>
        )}
      </div>
    </ConfirmDialog>
  )
}
