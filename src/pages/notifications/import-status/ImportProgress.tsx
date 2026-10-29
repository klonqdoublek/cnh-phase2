import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { IMPORT_COPY } from '@/data/import-spec'
import { cn } from '@/lib/cn'
import { ImportBar } from './ImportBar'
import { JobBadge } from './JobBadge'
import { resultOf, type ImportJob } from './jobs'

/**
 * Direction E — a loading bar across the page, between the page header and
 * the filters (requester, 29 Oct 2026; after Klaviyo's "Imported 20 rows" card
 * and Cofounder's import progress, Mobbin 28 Oct 2026). One block per job:
 * the file name and its status badge, a line under it, the bar, and the
 * action at the end. The server reports no percentage, so while a job is
 * Processing the bar is indeterminate: a third-width Surface/Highlight
 * segment runs across a Surface/Highlight/Subtle track (still under reduced
 * motion). Completed fills it with Surface/Positive/Strong, with the result;
 * Error with Surface/Negative/Strong and Try again. A
 * finished block closes with its close mark. No toast. webds ships no
 * progress bar (it has Stepper only): authored from tokens, a gap.
 *
 * `placement="bottom"` is direction E.2 (requester, 29 Oct 2026): the same
 * blocks docked above the list's pagination footer, its rule on top instead
 * of underneath.
 */
export function ImportProgress({
  jobs,
  placement = 'top',
  onRetry,
  onDismiss,
}: {
  jobs: ImportJob[]
  /** `top` under the page header (E), `bottom` above the pagination footer (E.2). */
  placement?: 'top' | 'bottom'
  onRetry: (id: number) => void
  onDismiss: (id: number) => void
}) {
  if (!jobs.length) return null
  return (
    <section
      aria-label={IMPORT_COPY.indicator}
      className={cn(
        'flex shrink-0 flex-col gap-[var(--space-4)] bg-[var(--color-surface-primary-default)] px-[var(--space-4)] py-[var(--space-4)]',
        placement === 'top'
          ? 'shadow-[inset_0_-1px_0_0_var(--color-border-primary-default)]'
          : 'shadow-[inset_0_1px_0_0_var(--color-border-primary-default)]',
      )}
    >
      {jobs.map((job) => {
        const r = resultOf(job)
        const line =
          job.status === 'processing'
            ? IMPORT_COPY.progressNote
            : job.status === 'done'
              ? IMPORT_COPY.resultLine(r.imported, r.failed)
              : IMPORT_COPY.failTitle
        return (
          <div key={job.id} className="flex flex-col gap-[var(--space-2)]">
            <div className="flex items-center gap-[var(--space-3)]">
              <Icon slug="document" size={16} color="var(--color-icon-secondary-default)" />
              <span title={job.fileName} className="max-w-[480px] truncate type-body-s-emphasized text-[var(--color-text-primary-default)]">
                {job.fileName}
              </span>
              <JobBadge status={job.status} />
              <span
                className={cn(
                  'min-w-px flex-1 truncate type-body-xs',
                  job.status === 'failed' ? 'text-[var(--color-text-negative-default)]' : 'text-[var(--color-text-secondary-default)]',
                )}
              >
                {line}
              </span>
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
            <ImportBar status={job.status} label={job.fileName} />
          </div>
        )
      })}
    </section>
  )
}
