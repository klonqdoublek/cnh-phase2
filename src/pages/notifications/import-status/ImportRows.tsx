import { Badge } from '@/bbl/badge'
import { Checkbox } from '@/bbl/checkbox'
import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { TableDataCell } from '@/bbl/table-data-cell'
import { IMPORT_COPY } from '@/data/import-spec'
import type { Template } from '@/data/templates'
import { cn } from '@/lib/cn'
import { JobBadge } from './JobBadge'
import { downloadResult, resultOf, timeOf, type ImportJob } from './jobs'

const EMPTY = '–'

/**
 * Direction F — the import's templates go into the table at once, greyed,
 * at the top of page 1, where the list's newest-first sort puts them when
 * they land (requester, 29 Oct 2026; after WRITER's "Uploading" and
 * Perplexity's "Queued" file rows, Pipedrive's highlighted "Importing…" row
 * and Grain's "Processing…" row, with Motion's group header rows; Mobbin,
 * 29 Oct 2026).
 *
 * Each job is a group: a file row spanning the table (document mark, file
 * name, its status badge, when it was submitted, a line, and Download result /
 * Try again / close at the end) over one row per template in the file. While
 * Processing the template rows are greyed: Text/Disabled, a disabled
 * checkbox, a Disabled badge "Processing", and they do not open. When the job
 * is Completed its templates are real Drafts under the file row, so the grey
 * rows go and the file row stays with the result until closed. On Error the
 * grey rows stay with a Negative "Error" badge and the file row offers Try
 * again (PROPOSAL, pending BA).
 */
export function ImportRows({ jobs, columns, rowRule, onRetry, onDismiss }: {
  jobs: ImportJob[]
  /** The table's column count, checkbox included, for the file row's span. */
  columns: number
  rowRule: string
  onRetry: (id: number) => void
  onDismiss: (id: number) => void
}) {
  return (
    <>
      {jobs.map((job) => {
        const r = resultOf(job)
        const line =
          job.status === 'processing'
            ? IMPORT_COPY.processingNote
            : job.status === 'done'
              ? IMPORT_COPY.resultLine(r.imported, r.failed)
              : IMPORT_COPY.failTitle
        return [
          <tr key={`job-${job.id}`} className="h-[48px]">
            <td colSpan={columns} className="p-0">
              <TableDataCell type="slot" state="default" className={cn('bg-[var(--color-surface-primary-subtle-default)]', rowRule)}>
                <div className="flex w-full items-center gap-[var(--space-3)]">
                  <Icon slug="document" size={16} color="var(--color-icon-secondary-default)" />
                  <span title={job.fileName} className="max-w-[480px] truncate type-body-s-emphasized text-[var(--color-text-primary-default)]">
                    {job.fileName}
                  </span>
                  <JobBadge status={job.status} />
                  <span className="type-body-xs text-[var(--color-text-secondary-default)]">
                    {IMPORT_COPY.submitted} {timeOf(job.startedAt)}
                  </span>
                  <span
                    className={cn(
                      'min-w-px flex-1 truncate type-body-xs',
                      job.status === 'failed' ? 'text-[var(--color-text-negative-default)]' : 'text-[var(--color-text-secondary-default)]',
                    )}
                  >
                    {line}
                  </span>
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
                  {job.status !== 'processing' && (
                    <IconButton
                      label={`${IMPORT_COPY.close} ${job.fileName}`}
                      icon={<Icon slug="close" size={16} color="var(--color-icon-secondary-default)" />}
                      onClick={() => onDismiss(job.id)}
                    />
                  )}
                </div>
              </TableDataCell>
            </td>
          </tr>,
          ...(job.status === 'done' ? [] : job.templates.map((t, i) => <PendingRow key={`job-${job.id}-${i}`} t={t} failed={job.status === 'failed'} rowRule={rowRule} />)),
        ]
      })}
    </>
  )
}

/** A template still on the server: greyed, not selectable, not opened. */
function PendingRow({ t, failed, rowRule }: { t: Template; failed: boolean; rowRule: string }) {
  const text = (value: React.ReactNode, wrap = false) => (
    <TableDataCell type="slot" state="default" className={rowRule}>
      <span className={cn('block w-full overflow-hidden type-body-m text-[var(--color-text-disabled-default)]', wrap ? 'line-clamp-2' : 'truncate')}>
        {value}
      </span>
    </TableDataCell>
  )
  return (
    <tr aria-disabled className="h-[64px] cursor-default">
      <td className="p-0">
        <TableDataCell type="slot" state="default" className={cn('justify-center', rowRule)}>
          <Checkbox selection="none" disabled aria-label={`${t.name || EMPTY} is not imported yet`} />
        </TableDataCell>
      </td>
      <td className="p-0">{text(t.name || EMPTY)}</td>
      <td className="p-0">{text(t.description || EMPTY)}</td>
      <td className="p-0">{text(t.productName || EMPTY)}</td>
      <td className="p-0">{text(t.serviceCode || EMPTY)}</td>
      <td className="p-0">{text(t.channels.join(', ') || EMPTY, true)}</td>
      <td className="p-0">
        <TableDataCell type="slot" state="default" className={rowRule}>
          <Badge type={failed ? 'negative' : 'disabled'} size="xs" icon={false}>
            {failed ? IMPORT_COPY.statusFailed : IMPORT_COPY.statusProcessing}
          </Badge>
        </TableDataCell>
      </td>
    </tr>
  )
}
