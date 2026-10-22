import { useMemo, useState } from 'react'
import { Button } from '@/bbl/button'
import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { ConsolePage } from '@/patterns/console-page'
import { EmptyState } from '@/patterns/empty-state'
import {
  BROADCAST_COPY,
  BROADCAST_STATUSES,
  fmtDateTime,
  fmtDndRule,
  hasDeliveryReport,
  type Broadcast,
  type Dnd,
  type ListToast as ListToastValue,
} from '@/data/broadcast'
import { CHANNELS } from '@/data/templates'
import { FilterSelect } from '../notifications/FilterSelect'
import { ListSearch } from '../notifications/ListSearch'
import { BroadcastStatus } from './list/BroadcastStatus'
import { ListFooter } from './list/ListFooter'
import { ListTable, type ListColumn } from './list/ListTable'
import { ListToast } from './list/ListToast'
import { ReportDownload } from './list/ReportDownload'

export type BroadcastListProps = {
  broadcasts: Broadcast[]
  onCreate: () => void
  onOpen: (b: Broadcast) => void
  /** The toast after Create returns; null when none. */
  created: ListToastValue | null
  /** On a preset route the toast is held open instead of timing out. */
  holdToast: boolean
  onCreatedClose: () => void
}

const PAGE_SIZE = 50

/** A rule a line, two lines at most; the rest are counted on the second. */
function DndCell({ dnd }: { dnd: Dnd }) {
  const lines = dnd.enabled ? dnd.rules.map(fmtDndRule) : ['Off']
  const more = lines.length - 2
  return (
    <span className="flex min-w-px flex-col type-body-m text-[var(--color-text-primary-default)]">
      {lines.slice(0, 2).map((line, i) => (
        <span key={i} className="truncate">
          {line}
          {i === 1 && more > 0 && ` +${more} more`}
        </span>
      ))}
    </span>
  )
}

/** The status, and on the row's hover its Download report — one broadcast, one
 *  file. The mark sits at one position on every row, 20 clear of the widest
 *  badge (Processing, 74.3 at size M), as Notification management places its
 *  download. */
function StatusCell({ broadcast, onDownload }: { broadcast: Broadcast; onDownload: (b: Broadcast) => void }) {
  return (
    <div className="relative flex w-full items-center">
      <BroadcastStatus status={broadcast.status} />
      {hasDeliveryReport(broadcast) && (
        <button
          type="button"
          aria-label={`Download report for ${broadcast.name}`}
          onClick={(e) => {
            e.stopPropagation()
            onDownload(broadcast)
          }}
          onKeyDown={(e) => e.stopPropagation()}
          className="invisible absolute top-1/2 left-[95px] inline-flex h-[16px] w-[24px] -translate-y-1/2 cursor-pointer items-center group-focus-within:visible group-hover:visible"
        >
          <Icon slug="download" size={16} color="var(--color-icon-highlight-default)" />
        </button>
      )}
    </div>
  )
}

const columnsOf = (onDownload: (b: Broadcast) => void): ListColumn<Broadcast>[] => [
  { key: 'name', label: 'Broadcast name', width: 500, cell: (b) => b.name },
  { key: 'channel', label: 'Channel', width: 360, wrap: true, cell: (b) => b.channels.join(', ') },
  { key: 'start', label: 'Broadcast start', width: 220, cell: (b) => fmtDateTime(new Date(b.start)) },
  {
    key: 'dnd',
    label: 'Do Not Disturb',
    width: 320,
    slot: true,
    cell: (b) => <DndCell dnd={b.dnd} />,
  },
  {
    key: 'status',
    label: 'Status',
    width: 200,
    slot: true,
    cell: (b) => <StatusCell broadcast={b} onDownload={onDownload} />,
  },
]

/**
 * Broadcast message — the list. webds `console-page` (title band, scrolling
 * body) at the list's own geometry: the band at px 16 and the table flush to
 * the body's edges, 24 under the band, as the original list draws it.
 */
export function BroadcastList({ broadcasts, onCreate, onOpen, created, holdToast, onCreatedClose }: BroadcastListProps) {
  const [requestedPage, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [channels, setChannels] = useState<string[]>([...CHANNELS])
  const [statuses, setStatuses] = useState<string[]>([...BROADCAST_STATUSES])
  const [reportFor, setReportFor] = useState<Broadcast | null>(null)
  const columns = useMemo(() => columnsOf(setReportFor), [])

  /* Notification management's rules: search matches name or description, and
     a filter with nothing — or everything — ticked filters nothing. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return broadcasts.filter((b) => {
      const matches = !q || b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
      const channel =
        channels.length === CHANNELS.length || channels.length === 0 || b.channels.some((c) => channels.includes(c))
      const status = statuses.length === 0 || statuses.includes(b.status)
      return matches && channel && status
    })
  }, [broadcasts, query, channels, statuses])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(requestedPage, pageCount - 1)
  const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  /** Any filter change goes back to page 1. */
  const refilter = (change: () => void) => {
    change()
    setPage(0)
  }

  /* Notification management's filter band (Figma 336:112267: the published
     Filtter set, Service code hidden) — search 520 · two 291 filters · Clear
     72, gap 16, in a 105 band (pt 20 / pb 21) with its own rule; the table
     sits flush under it. */
  const filters = (
    <div className="flex h-[105px] w-full shrink-0 items-start gap-[var(--space-4)] px-[var(--space-4)] pt-[var(--space-5)] pb-[21px] shadow-[inset_0_-1px_0_0_var(--color-border-primary-default)]">
      <div className="min-w-[200px] flex-[0_1_520px]">
        <ListSearch label={BROADCAST_COPY.search} value={query} onChange={(v) => refilter(() => setQuery(v))} />
      </div>
      <div className="min-w-[180px] flex-[0_1_291px]">
        <FilterSelect label="Channel" options={CHANNELS} value={channels} onChange={(v) => refilter(() => setChannels(v))} />
      </div>
      <div className="min-w-[180px] flex-[0_1_291px]">
        <FilterSelect
          label="Status"
          options={BROADCAST_STATUSES}
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
              setChannels([...CHANNELS])
              setStatuses([...BROADCAST_STATUSES])
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
        title={BROADCAST_COPY.listTitle}
        headerActions={
          <Button onClick={onCreate}>
            {BROADCAST_COPY.create}
            <Icon slug="plus" size={16} color="currentColor" />
          </Button>
        }
        columnWidth="fill"
        className="[&>[data-part=Body]]:bg-[var(--color-surface-primary-default)] [&>[data-part=Body]>div]:gap-0 [&>[data-part=Body]>div]:px-0 [&>[data-part=Body]>div]:pt-0 [&>[data-part=Body]>div]:pb-0 [&>[data-part=Header]]:px-[var(--space-4)]"
      >
        {broadcasts.length === 0 ? (
          /* The original's card: Surface/Primary/Hovered at radius 8, the
             copy starting 124 down (pad 24 + 100), not centred. */
          <EmptyState
            variant="idle"
            title={<span className="type-heading-xs-emphasized">{BROADCAST_COPY.emptyTitle}</span>}
            action={<Button onClick={onCreate}>{BROADCAST_COPY.create}</Button>}
            bodyMaxWidth="none"
            className="mt-[var(--space-6)] h-[813px] justify-start gap-[var(--space-8)] pt-[124px] [&>div]:gap-[var(--space-8)] [&>div>span:last-child]:text-[var(--color-text-secondary-default)]"
          >
            {BROADCAST_COPY.emptyLine}
          </EmptyState>
        ) : (
          /* One block, so the column's gap stays out from under the band. */
          <div className="flex flex-col">
            {filters}
            {rows.length === 0 ? (
              /* The empty card's shape (24 + 813), less the filter band (105). */
              <EmptyState
                variant="idle"
                icon={<img src="/illustrations/no-results.svg" alt="" width={124} height={124} />}
                bodyMaxWidth="none"
                className="h-[732px] justify-start gap-[var(--space-6)] pt-[100px] [&>div>span:last-child]:text-[var(--color-text-secondary-default)]"
              >
                {BROADCAST_COPY.noResults}
              </EmptyState>
            ) : (
              <ListTable
                label={BROADCAST_COPY.listTitle}
                columns={columns}
                rows={rows}
                rowKey={(b) => b.id}
                onOpen={onOpen}
              />
            )}
          </div>
        )}
      </ConsolePage>

      {rows.length > 0 && (
        <ListFooter
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPrevious={() => setPage(page - 1)}
          onNext={() => setPage(page + 1)}
        />
      )}

      <ListToast
        open={created !== null}
        title={
          created?.cancelled
            ? BROADCAST_COPY.cancelledTitle
            : created?.draft
              ? BROADCAST_COPY.draftTitle
              : BROADCAST_COPY.createdTitle
        }
        description={
          !created
            ? ''
            : created.cancelled
              ? BROADCAST_COPY.cancelledBody(created.name)
              : created.draft
                ? BROADCAST_COPY.draftBody(created.name)
                : BROADCAST_COPY.createdBody(created.name)
        }
        hold={holdToast}
        onClose={onCreatedClose}
      />
      <ReportDownload broadcast={reportFor} onDone={() => setReportFor(null)} />
    </div>
  )
}
