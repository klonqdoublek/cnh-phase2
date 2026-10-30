import { IMPORT_COPY } from '@/data/import-spec'
import { cn } from '@/lib/cn'
import type { JobStatus } from './jobs'

const STATUS_TEXT: Record<JobStatus, string> = {
  queued: IMPORT_COPY.statusQueued,
  processing: IMPORT_COPY.statusProcessing,
  done: IMPORT_COPY.statusDone,
  failed: IMPORT_COPY.statusFailed,
}

/**
 * The import's loading bar (29 Oct 2026), under a job row of the upload panel
 * (A). The server reports no percentage, so while a job is Queue or Processing
 * the bar never ends: a third-width Surface/Highlight segment runs across a
 * Surface/Highlight/Subtle track (`import-bar`, src/index.css). Completed and
 * Error fill it with Surface/Positive/Strong or Surface/Negative/Strong. 4
 * tall (--space-1), Radius Full. webds ships no progress bar (gap).
 */
export function ImportBar({ status, label, className }: { status: JobStatus; label: string; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuetext={STATUS_TEXT[status]}
      className={cn('relative h-[var(--space-1)] overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-surface-highlight-subtle-default)]', className)}
    >
      {status === 'queued' || status === 'processing' ? (
        <span className="absolute inset-y-0 left-0 w-1/3 rounded-[var(--radius-full)] bg-[var(--color-surface-highlight-default)] animate-[import-bar_1.6s_ease-in-out_infinite]" />
      ) : (
        <span
          className={cn(
            'absolute inset-0 rounded-[var(--radius-full)]',
            status === 'done' ? 'bg-[var(--color-surface-positive-strong-default)]' : 'bg-[var(--color-surface-negative-strong-default)]',
          )}
        />
      )}
    </div>
  )
}
