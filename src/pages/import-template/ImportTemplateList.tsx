import { useMemo, useState } from 'react'
import { Breadcrumbs } from '@/bbl/breadcrumbs'
import { Button } from '@/bbl/button'
import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { OutlineButton } from '@/bbl/outline-button'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { ConsolePage } from '@/patterns/console-page'
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
  /** Opens the Import dialog from this page (PROPOSAL, 1 Nov 2026, pending BA). */
  onImport: () => void
  /** `#/import-template/loading` · `#/import-template/error`. */
  state?: 'ready' | 'loading' | 'error'
  onRetry?: () => void
  /** Fetches the list again: every import's status as of now. */
  onRefresh: () => void
  /** Import menu option: the page sits under Notification management, so a breadcrumb leads back (3 Nov 2026). */
  breadcrumb?: boolean
}

const PAGE_SIZE = 50
/** How long the refetch shows the list's loading state in the prototype. */
const REFRESH_MS = 800

/* Slide 8's columns, in its order. Widths at 1920, as Broadcast's list. */
const COLUMNS: ListColumn<ImportRecord>[] = [
  { key: 'file', label: 'Import file name', width: 560, cell: (r) => r.fileName },
  { key: 'status', label: COPY.status, width: 200, slot: true, cell: (r) => <BroadcastStatus status={r.status} /> },
  { key: 'by', label: 'Created by', width: 300, cell: (r) => r.createdBy },
  { key: 'created', label: 'Created datetime', width: 270, cell: (r) => fmtImportTime(r.createdAt) },
  { key: 'updated', label: 'Updated datetime', width: 270, cell: (r) => fmtImportTime(r.updatedAt) || '–' },
]

/**
 * Import Template — one row per imported file (BA & Dev feedback deck Post
 * MMP 2, slides 8–9, 30 Oct 2026; reverses the requester's 29 Oct "no separate
 * page"). Built as Broadcast's list: webds `console-page`, the same filter band
 * (search by file name and Status; no Channel, an import has none), table and
 * footer, newest first. Selecting a row opens its drawer. Import sits in the
 * header and the empty state as a second way in, beside Notification
 * management's (PROPOSAL, 1 Nov 2026, pending BA: the deck does not ask for it).
 */
export function ImportTemplateList({ records, onOpen, onImport, state: shownState = 'ready', onRetry, onRefresh, breadcrumb = false }: ImportTemplateListProps) {
  const [refreshing, setRefreshing] = useState(false)
  const state = refreshing ? 'loading' : shownState
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
          label={COPY.status}
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

  /* CNH Phase 1's state card, as Notification management draws it: Surface/Primary/Hovered
     at Radius 2, p 24 round a 765 slot, the block 100 from the slot's top. */
  const card = (children: React.ReactNode) => (
    <div className="w-full rounded-[var(--radius-2)] bg-[var(--color-surface-primary-hovered)] p-[var(--space-6)]">
      <div className="flex h-[765px] w-full flex-col">{children}</div>
    </div>
  )
  const centred = (children: React.ReactNode) => (
    <div className="flex w-full flex-col items-center gap-[var(--space-6)] pt-[100px] text-center">{children}</div>
  )
  const stateLine = (text: string) => (
    <p className="type-label-xl text-[var(--color-text-secondary-default)]">{text}</p>
  )

  return (
    <div className="flex h-full min-h-px flex-col">
      <ConsolePage
        title={
          breadcrumb ? (
            /* Breadcrumb over the title, as CMS PageBand (gap 4): viewing import status is secondary to
               Notification management, where imported templates land anyway (requester, 3 Nov 2026).
               Fits the 82 band: 20 + 4 + 28. */
            <span className="flex flex-col gap-[var(--space-1)]">
              <Breadcrumbs items={[{ label: COPY.crumbParent, href: '#/list' }, { label: COPY.title }]} />
              {COPY.title}
            </span>
          ) : (
            COPY.title
          )
        }
        /* Refresh fetches the page again (design critique with the lead design team, 3 Nov
           2026): the list shows each import's status as of when it was opened, so the user
           pulls the newer ones. Filters, search and page stay. Composed: Outline Button with
           the library's `refresh` icon after the label, as webds `picker-dialog`'s Refresh. */
        headerActions={
          <span className="flex items-center gap-[var(--space-4)]">
            <OutlineButton
              disabled={state === 'loading'}
              onClick={() => {
                setRefreshing(true)
                setTimeout(() => {
                  onRefresh()
                  setRefreshing(false)
                }, REFRESH_MS)
              }}
            >
              {COPY.refreshAction}
              <Icon slug="refresh" size={16} color="currentColor" />
            </OutlineButton>
            <Button onClick={onImport}>{COPY.importAction}</Button>
          </span>
        }
        columnWidth="fill"
        className="[&>[data-part=Body]]:bg-[var(--color-surface-primary-default)] [&>[data-part=Body]>div]:gap-0 [&>[data-part=Body]>div]:px-0 [&>[data-part=Body]>div]:pt-0 [&>[data-part=Body]>div]:pb-0 [&>[data-part=Header]]:px-[var(--space-4)]"
      >
        {/* Every state keeps the filter band and draws CNH Phase 1's state card
            (Notification management, Dashboard.tsx; Phase 1 Figma 1:126486): the empty
            state too, with its Empty page illustration (requester, 5 Nov 2026). */}
        <div className="flex flex-col">
          {filters}
          {state === 'loading' ? (
            card(
              <div className="flex h-full w-full items-center justify-center">
                <SpinnerLoader size="l" />
              </div>,
            )
          ) : state === 'error' ? (
            card(
              centred(
                <>
                  <img src="/illustrations/error.svg" alt="" width={124} height={124} />
                  <div className="flex flex-col items-center gap-[var(--space-8)]">
                    {stateLine(COPY.loadFail)}
                    <Button onClick={onRetry}>Try again</Button>
                  </div>
                </>,
              ),
            )
          ) : records.length === 0 ? (
            card(
              centred(
                <>
                  <img src="/illustrations/empty.svg" alt="" width={124} height={124} />
                  <div className="flex flex-col items-center gap-[var(--space-8)]">
                    <p className="type-heading-xs-emphasized text-[var(--color-text-primary-default)]">
                      {COPY.emptyTitle}
                    </p>
                    {stateLine(COPY.emptyLine)}
                    <Button onClick={onImport}>{COPY.importAction}</Button>
                  </div>
                </>,
              ),
            )
          ) : rows.length === 0 ? (
            card(
              centred(
                <>
                  <img src="/illustrations/no-results.svg" alt="" width={124} height={124} />
                  {stateLine(COPY.noResults)}
                </>,
              ),
            )
          ) : (
            <ListTable label={COPY.title} columns={COLUMNS} rows={rows} rowKey={(r) => r.id} onOpen={onOpen} />
          )}
        </div>
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
