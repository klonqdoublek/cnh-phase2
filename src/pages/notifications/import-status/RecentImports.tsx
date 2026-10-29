import { useState } from 'react'
import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { IMPORT_COPY } from '@/data/import-spec'
import { ImportDrawer } from './ImportDrawer'
import { JobBadge } from './JobBadge'
import { resultOf, timeOf, type ImportJob } from './jobs'

/**
 * Direction B — a Recent imports strip between the filters and the table
 * (HubSpot, Klaviyo, Pipedrive, Attio, Customer.io import history; Mobbin,
 * 28 Oct 2026). One row per job: the file name, when it was submitted and a
 * webds Badge S for its status (Accent Processing, Positive Completed, Negative
 * Error; 29 Oct 2026), with Try again on an Error row and a close mark on a
 * finished one. A row opens the import's drawer, with its result and Download
 * result (BA's MoM, 29 Oct 2026: select an import to see its result).
 * The toasts on submit and on done are Dashboard's (ImportStatus).
 */
export function RecentImports({
  jobs,
  onRetry,
  onDismiss,
  onOpen,
}: {
  jobs: ImportJob[]
  onRetry: (id: number) => void
  onDismiss: (id: number) => void
  /** Opening a drawer closes the list's toast, which would sit over its header. */
  onOpen: () => void
}) {
  const [openId, setOpenId] = useState<number | null>(null)
  const open = jobs.find((j) => j.id === openId)
  if (!jobs.length) return null
  return (
    <section
      aria-label={IMPORT_COPY.historyTitle}
      className="flex shrink-0 flex-col gap-[var(--space-2)] bg-[var(--color-surface-primary-default)] px-[var(--space-4)] py-[var(--space-3)] shadow-[inset_0_-1px_0_0_var(--color-border-primary-default)]"
    >
      <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">{IMPORT_COPY.historyTitle}</span>
      {jobs.map((job) => {
        const r = resultOf(job)
        return (
          <div key={job.id} className="flex h-[32px] items-center gap-[var(--space-4)]">
            <Icon slug="document" size={16} color="var(--color-icon-secondary-default)" />
            <button
              type="button"
              title={job.fileName}
              onClick={() => {
                onOpen()
                setOpenId(job.id)
              }}
              className="max-w-[360px] truncate type-body-s-emphasized text-[var(--color-text-highlight-default)] hover:text-[var(--color-text-highlight-hovered)]"
            >
              {job.fileName}
            </button>
            <span className="type-body-xs text-[var(--color-text-secondary-default)]">{IMPORT_COPY.submittedAt(timeOf(job.startedAt))}</span>
            <JobBadge status={job.status} />
            <span className="type-body-xs text-[var(--color-text-secondary-default)]">
              {job.status === 'processing'
                ? IMPORT_COPY.processingNote
                : job.status === 'done'
                  ? IMPORT_COPY.resultLine(r.imported, r.failed)
                  : IMPORT_COPY.failTitle}
            </span>
            <span className="flex-1" />
            {job.status === 'failed' && (
              <GhostButton appearance="highlight" padding="none" onClick={() => onRetry(job.id)}>
                {IMPORT_COPY.retry}
              </GhostButton>
            )}
            {job.status !== 'processing' && (
              <IconButton
                label={`${IMPORT_COPY.close} ${job.fileName}`}
                icon={<Icon slug="close" size={16} color="var(--color-icon-secondary-default)" />}
                onClick={() => onDismiss(job.id)}
              />
            )}
          </div>
        )
      })}
      {open && <ImportDrawer job={open} onClose={() => setOpenId(null)} onRetry={onRetry} />}
    </section>
  )
}
