import { useMemo, useState } from 'react'
import { Button } from '@/bbl/button'
import { GhostButton } from '@/bbl/ghost-button'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { ConsolePage } from '@/patterns/console-page'
import { EmptyState } from '@/patterns/empty-state'
import { STATUS_LABEL } from '@/data/broadcast'
import {
  IMPORT_STATUSES,
  IMPORT_TEMPLATE_COPY as COPY,
  fmtImportTime,
  type ImportRecord,
  type ImportStatus,
} from '@/data/import-history'
import { FilterSelect } from '../notifications/FilterSelect'
import { ListSearch } from '../notifications/ListSearch'
import { BroadcastStatus } from '../broadcast/list/BroadcastStatus'
import { ListFooter } from '../broadcast/list/ListFooter'
import { ListTable, type ListColumn } from '../broadcast/list/ListTable'

export type ImportTemplateListProps = {
  records: ImportRecord[]
  onOpen: (r: ImportRecord) => void
  /** `#/import-template/loading` · `#/import-template/error`. */
  state?: 'ready' | 'loading' | 'error'
  onRetry?: () => void
}

const PAGE_SIZE = 50

/* Slide 8's columns, in its order. Widths at 1920, as Broadcast's list. */
const COLUMNS: ListColumn<ImportRecord>[] = [
  { key: 'file', label: 'Import file name', width: 560, cell: (r) => r.fileName },
  { key: 'status', label: 'Status', width: 200, slot: true, cell: (r) => <BroadcastStatus status={r.status} /> },
  { key: 'by', label: 'Created by', width: 300, cell: (r) => r.createdBy },
  { key: 'created', label: 'Created datetime', width: 270, cell: (r) => fmtImportTime(r.createdAt) },
  { key: 'updated', label: 'Updated datetime', width: 270, cell: (r) => fmtImportTime(r.updatedAt) || '–' },
]

/**
 * Import Template — one row per imported file (BA & Dev feedback deck Post
 * MMP 2, slides 8–9, 30 Oct 2026; reverses the requester's 29 Oct "no separate
 * page"). Built as Broadcast's list: webds `console-page`, the same filter band
 * (search by file name and Status; no Channel, an import has none), table and
 * footer, newest first. Selecting a row opens its drawer. No header action:
 * files are imported from Notification management.
 */
export function ImportTemplateList({ records, onOpen, state = 'ready', onRetry }: ImportTemplateListProps) {
  const [requestedPage, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [statuses, setStatuses] = useState<string[]>([...IMPORT_STATUSES])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...records]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .filter((r) => (!q || r.fileName.toLowerCase().includes(q)) && (statuses.length === 0 || statuses.includes(r.status)))
  }, [records, query, statuses])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(requestedPage, pageCount - 1)
  const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const refilter = (change: () => void) => {
    change()
    setPage(0)
  }

  /* Broadcast's filter band: search 520 · a 291 filter · Clear 72, gap 16. */
  const filters = (
    <div className="flex h-[105px] w-full shrink-0 items-start gap-[var(--space-4)] px-[var(--space-4)] pt-[var(--space-5)] pb-[21px] shadow-[inset_0_-1px_0_0_var(--color-border-primary-default)]">
      <div className="min-w-[200px] flex-[0_1_520px]">
        <ListSearch label={COPY.search} value={query} onChange={(v) => refilter(() => setQuery(v))} />
      </div>
      <div className="min-w-[180px] flex-[0_1_291px]">
        <FilterSelect
          label="Status"
          options={IMPORT_STATUSES}
          optionLabel={(s) => STATUS_LABEL[s as ImportStatus]}
          value={statuses}
          onChange={(v) => refilter(() => setStatuses(v))}
        />
      </div>
      <div className="flex h-[64px] shrink-0 items-center">
        <GhostButton
          appearance="highlight"
          className="w-[72px] whitespace-nowrap"
          onClick={() =>
            refilter(() => {
              setQuery('')
              setStatuses([...IMPORT_STATUSES])
            })
          }
        >
          Clear
        </GhostButton>
      </div>
    </div>
  )

  return (
    <div className="flex h-full min-h-px flex-col">
      <ConsolePage
        title={COPY.title}
        columnWidth="fill"
        className="[&>[data-part=Body]]:bg-[var(--color-surface-primary-default)] [&>[data-part=Body]>div]:gap-0 [&>[data-part=Body]>div]:px-0 [&>[data-part=Body]>div]:pt-0 [&>[data-part=Body]>div]:pb-0 [&>[data-part=Header]]:px-[var(--space-4)]"
      >
        {state === 'ready' && records.length === 0 ? (
          <EmptyState
            variant="idle"
            title={<span className="type-heading-xs-emphasized">{COPY.emptyTitle}</span>}
            bodyMaxWidth="none"
            className="mt-[var(--space-6)] h-[813px] justify-start gap-[var(--space-8)] pt-[124px] [&>div]:gap-[var(--space-8)] [&>div>span:last-child]:text-[var(--color-text-secondary-default)]"
          >
            {COPY.emptyLine}
          </EmptyState>
        ) : (
          <div className="flex flex-col">
            {filters}
            {state === 'loading' ? (
              <EmptyState variant="idle" icon={<SpinnerLoader size="l" />} className="h-[732px] justify-center" />
            ) : state === 'error' ? (
              <EmptyState
                variant="idle"
                icon={<img src="/illustrations/error.svg" alt="" width={124} height={124} />}
                action={
                  <Button onClick={onRetry} className="mt-[var(--space-2)]">
                    Try again
                  </Button>
                }
                bodyMaxWidth="none"
                className="h-[732px] justify-start gap-[var(--space-6)] pt-[100px] [&>div>span:last-child]:text-[var(--color-text-secondary-default)]"
              >
                {COPY.loadFail}
              </EmptyState>
            ) : rows.length === 0 ? (
              <EmptyState
                variant="idle"
                icon={<img src="/illustrations/no-results.svg" alt="" width={124} height={124} />}
                bodyMaxWidth="none"
                className="h-[732px] justify-start gap-[var(--space-6)] pt-[100px] [&>div>span:last-child]:text-[var(--color-text-secondary-default)]"
              >
                {COPY.noResults}
              </EmptyState>
            ) : (
              <ListTable label={COPY.title} columns={COLUMNS} rows={rows} rowKey={(r) => r.id} onOpen={onOpen} />
            )}
          </div>
        )}
      </ConsolePage>

      {state === 'ready' && rows.length > 0 && (
        <ListFooter
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPrevious={() => setPage(page - 1)}
          onNext={() => setPage(page + 1)}
        />
      )}
    </div>
  )
}
