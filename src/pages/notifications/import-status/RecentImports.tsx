import { Badge, type BadgeType } from '@/bbl/badge'
import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { IMPORT_COPY } from '@/data/import-spec'
import { timeOf, type ImportJob, type JobStatus } from './jobs'

const BADGE: Record<JobStatus, { type: BadgeType; label: string }> = {
  processing: { type: 'accent', label: IMPORT_COPY.statusProcessing },
  done: { type: 'positive', label: IMPORT_COPY.statusDone },
  failed: { type: 'negative', label: IMPORT_COPY.statusFailed },
}

/**
 * Direction B — a Recent imports strip between the filters and the table
 * (HubSpot, Klaviyo, Pipedrive, Attio, Customer.io import history; Mobbin,
 * 28 Oct 2026). One row per job: the file name, when it was submitted and a
 * webds Badge S for its status (Accent Importing, Positive Imported, Negative
 * Failed), with Try again on a failed row and a close mark on a finished one.
 * The toasts on submit and on done are Dashboard's (ImportStatus).
 */
export function RecentImports({
  jobs,
  onRetry,
  onDismiss,
}: {
  jobs: ImportJob[]
  onRetry: (id: number) => void
  onDismiss: (id: number) => void
}) {
  if (!jobs.length) return null
  return (
    <section
      aria-label={IMPORT_COPY.historyTitle}
      className="flex shrink-0 flex-col gap-[var(--space-2)] bg-[var(--color-surface-primary-default)] px-[var(--space-4)] py-[var(--space-3)] shadow-[inset_0_-1px_0_0_var(--color-border-primary-default)]"
    >
      <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">{IMPORT_COPY.historyTitle}</span>
      {jobs.map((job) => {
        const badge = BADGE[job.status]
        return (
          <div key={job.id} className="flex h-[32px] items-center gap-[var(--space-4)]">
            <Icon slug="document" size={16} color="var(--color-icon-secondary-default)" />
            <span title={job.fileName} className="max-w-[360px] truncate type-body-s-emphasized text-[var(--color-text-primary-default)]">
              {job.fileName}
            </span>
            <span className="type-body-xs text-[var(--color-text-secondary-default)]">{IMPORT_COPY.submittedAt(timeOf(job.startedAt))}</span>
            <Badge type={badge.type} size="s" icon={false}>
              {badge.label}
            </Badge>
            <span className="type-body-xs text-[var(--color-text-secondary-default)]">
              {job.status === 'processing'
                ? IMPORT_COPY.processingNote
                : job.status === 'done'
                  ? IMPORT_COPY.successBody(job.templates.length)
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
    </section>
  )
}
