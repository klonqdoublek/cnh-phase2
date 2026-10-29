import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { IMPORT_COPY } from '@/data/import-spec'
import { cn } from '@/lib/cn'
import { downloadResult, resultOf, type ImportJob } from './jobs'

/**
 * One import job as a row, shared by the upload panel (A) and the indicator's
 * popover (C): a document mark, the file name (Body S Emphasized) over its
 * status (Body XS), and the status mark at the end. Importing reads in
 * Text/Secondary with a clock (webds ships no spinner smaller than 48, a gap),
 * Completed in Text/Positive with its result ("4 imported, 1 failed") and a
 * highlight Ghost Download result (29 Oct 2026; was a tick), Error in
 * Text/Negative with a highlight Ghost Try again. Composed from webds parts,
 * as the CMS upload slot is.
 */
export function JobRow({ job, onRetry }: { job: ImportJob; onRetry: (id: number) => void }) {
  const line =
    job.status === 'processing'
      ? IMPORT_COPY.processingNote
      : job.status === 'done'
        ? IMPORT_COPY.resultLine(resultOf(job).imported, resultOf(job).failed)
        : IMPORT_COPY.failTitle
  return (
    <div className="flex items-center gap-[var(--space-3)] py-[var(--space-3)]">
      <Icon slug="document" size={24} color="var(--color-icon-secondary-default)" />
      <div className="flex min-w-px flex-1 flex-col">
        <span title={job.fileName} className="truncate type-body-s-emphasized text-[var(--color-text-primary-default)]">
          {job.fileName}
        </span>
        <span
          className={cn(
            'type-body-xs',
            job.status === 'processing' && 'text-[var(--color-text-secondary-default)]',
            job.status === 'done' && 'text-[var(--color-text-positive-default)]',
            job.status === 'failed' && 'text-[var(--color-text-negative-default)]',
          )}
        >
          {line}
        </span>
      </div>
      {job.status === 'processing' && (
        <span role="img" aria-label={IMPORT_COPY.statusProcessing} className="flex">
          <Icon slug="time" size={16} color="var(--color-icon-secondary-default)" />
        </span>
      )}
      {job.status === 'done' && (
        <GhostButton appearance="highlight" padding="none" onClick={() => downloadResult(job)}>
          {IMPORT_COPY.downloadResult}
        </GhostButton>
      )}
      {job.status === 'failed' && (
        <GhostButton appearance="highlight" padding="none" onClick={() => onRetry(job.id)}>
          {IMPORT_COPY.retry}
        </GhostButton>
      )}
    </div>
  )
}
