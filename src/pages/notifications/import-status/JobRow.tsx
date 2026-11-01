import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { IMPORT_COPY } from '@/data/import-spec'
import { go } from '@/lib/hash'
import { cn } from '@/lib/cn'
import { ImportBar } from './ImportBar'
import { importIdOf, resultOf, type ImportJob } from './jobs'

/**
 * One import job as a row in the upload panel (A): a document mark, the file name (Body S Emphasized) over its
 * status (Body XS), and the status mark at the end. Importing reads in
 * Text/Secondary with a clock (webds ships no spinner smaller than 48, a gap),
 * Completed in Text/Positive with its result ("4 imported, 1 failed"; it had
 * Download result 29 Oct 2026, removed the same day), Error in
 * Text/Negative with a highlight Ghost Try again. Composed from webds parts,
 * as the CMS upload slot is. Queue reads as Processing does, "Waiting to start".
 * Every row but Error has a highlight Ghost View that opens the import on the
 * Import Template page (30 Oct 2026; composed).
 *
 * `bar` adds the never-ending loading bar under the file's lines while it is
 * Queue or Processing (requester, 29 Oct 2026).
 */
export function JobRow({
  job,
  bar = false,
  onRetry,
}: {
  job: ImportJob
  bar?: boolean
  onRetry: (id: number) => void
}) {
  const waiting = job.status === 'queued' || job.status === 'processing'
  const line =
    job.status === 'queued'
      ? IMPORT_COPY.queuedNote
      : job.status === 'processing'
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
            waiting && 'text-[var(--color-text-secondary-default)]',
            job.status === 'done' && 'text-[var(--color-text-positive-default)]',
            job.status === 'failed' && 'text-[var(--color-text-negative-default)]',
          )}
        >
          {line}
        </span>
        {bar && waiting && <ImportBar status={job.status} label={job.fileName} className="mt-[var(--space-2)]" />}
      </div>
      {waiting && (
        <span role="img" aria-label={job.status === 'queued' ? IMPORT_COPY.statusQueued : IMPORT_COPY.statusProcessing} className="flex">
          <Icon slug="time" size={16} color="var(--color-icon-secondary-default)" />
        </span>
      )}
      {job.status === 'failed' ? (
        <GhostButton appearance="highlight" padding="none" onClick={() => onRetry(job.id)}>
          {IMPORT_COPY.retry}
        </GhostButton>
      ) : (
        <GhostButton appearance="highlight" padding="none" onClick={() => go(`/import-template/view/${importIdOf(job)}`)}>
          {IMPORT_COPY.view}
        </GhostButton>
      )}
    </div>
  )
}
