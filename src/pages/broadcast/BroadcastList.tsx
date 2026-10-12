import { useState } from 'react'
import { Button } from '@/bbl/button'
import { Icon } from '@/bbl/icon'
import { ConsolePage } from '@/patterns/console-page'
import { EmptyState } from '@/patterns/empty-state'
import {
  BROADCAST_COPY,
  EMPTY,
  fmtDateTime,
  fmtDays,
  fmtNumber,
  type Broadcast,
  type ListToast as ListToastValue,
} from '@/data/broadcast'
import { BroadcastStatus } from './list/BroadcastStatus'
import { ListFooter } from './list/ListFooter'
import { ListTable, type ListColumn } from './list/ListTable'
import { ListToast } from './list/ListToast'

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

const COLUMNS: ListColumn<Broadcast>[] = [
  { key: 'name', label: 'Broadcast name', width: 300, cell: (b) => b.name },
  { key: 'channel', label: 'Channel', width: 260, wrap: true, cell: (b) => b.channels.join(', ') },
  { key: 'recipients', label: 'Recipients', width: 160, cell: (b) => fmtNumber(b.recipients) },
  { key: 'start', label: 'Broadcast start', width: 220, cell: (b) => fmtDateTime(new Date(b.start)) },
  {
    key: 'dnd',
    label: 'Do Not Disturb',
    width: 220,
    cell: (b) => (b.dnd.enabled ? `${fmtDays(b.dnd.days)}, ${b.dnd.from}–${b.dnd.to}` : 'Off'),
  },
  {
    key: 'result',
    label: 'Result',
    width: 240,
    cell: (b) =>
      b.success + b.failed === 0 ? (
        EMPTY
      ) : (
        <>
          {fmtNumber(b.success)} sent ·{' '}
          <span className={b.failed ? 'text-[var(--color-text-negative-default)]' : undefined}>
            {fmtNumber(b.failed)} failed
          </span>
        </>
      ),
  },
  {
    key: 'status',
    label: 'Status',
    width: 200,
    slot: true,
    cell: (b) => <BroadcastStatus status={b.status} />,
  },
]

/**
 * Broadcast message — the list. webds `console-page` (title band, scrolling
 * body) at the list's own geometry: the band at px 16 and the table flush to
 * the body's edges, 24 under the band, as the original list draws it.
 */
export function BroadcastList({ broadcasts, onCreate, onOpen, created, holdToast, onCreatedClose }: BroadcastListProps) {
  const [requestedPage, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(broadcasts.length / PAGE_SIZE))
  const page = Math.min(requestedPage, pageCount - 1)
  const rows = broadcasts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

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
        className="[&>[data-part=Body]]:bg-[var(--color-surface-primary-default)] [&>[data-part=Body]>div]:gap-0 [&>[data-part=Body]>div]:px-0 [&>[data-part=Body]>div]:pt-[var(--space-6)] [&>[data-part=Body]>div]:pb-0 [&>[data-part=Header]]:px-[var(--space-4)]"
      >
        {broadcasts.length === 0 ? (
          /* The original's card: Surface/Primary/Hovered at radius 8, the
             copy starting 124 down (pad 24 + 100), not centred. */
          <EmptyState
            variant="idle"
            title={<span className="type-heading-xs-emphasized">{BROADCAST_COPY.emptyTitle}</span>}
            action={<Button onClick={onCreate}>{BROADCAST_COPY.create}</Button>}
            bodyMaxWidth="none"
            className="h-[813px] justify-start gap-[var(--space-8)] pt-[124px] [&>div]:gap-[var(--space-8)] [&>div>span:last-child]:text-[var(--color-text-secondary-default)]"
          >
            {BROADCAST_COPY.emptyLine}
          </EmptyState>
        ) : (
          <ListTable
            label={BROADCAST_COPY.listTitle}
            columns={COLUMNS}
            rows={rows}
            rowKey={(b) => b.id}
            onOpen={onOpen}
          />
        )}
      </ConsolePage>

      {rows.length > 0 && (
        <ListFooter
          page={page}
          pageSize={PAGE_SIZE}
          total={broadcasts.length}
          onPrevious={() => setPage(page - 1)}
          onNext={() => setPage(page + 1)}
        />
      )}

      <ListToast
        open={created !== null}
        title={created?.draft ? BROADCAST_COPY.draftTitle : BROADCAST_COPY.createdTitle}
        description={
          created ? (created.draft ? BROADCAST_COPY.draftBody(created.name) : BROADCAST_COPY.createdBody(created.name)) : ''
        }
        hold={holdToast}
        onClose={onCreatedClose}
      />
    </div>
  )
}
