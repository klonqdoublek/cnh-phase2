import { CardSurface } from '@/bbl/building-block-card-surface'
import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import type { Audience, BroadcastContent } from '@/data/broadcast'
import type { Channel } from '@/data/templates'
import { cn } from '@/lib/cn'
import { NOTE } from './fields'

/* The message preview beside each channel card's fields (BA & Dev feedback,
 * 30 Oct 2026: "Display preview all channel by first row data from audience
 * file"). The deck draws Email: fields on the left, a grey Preview area on the
 * right holding the message as a white card, each field filled from the file's
 * first data row and tinted as a link, and *Hide preview ›* top right. Push and
 * SMS follow the same shape. webds ships no message preview (gap): the area is
 * Surface/Secondary, the card is Card Surface with the Border/Primary stroke
 * the DND period cards carry, the toggle is a Ghost Button. */

const TOKEN = /(\$\{[^{}$\s]+\})/

/** The first data row's value for each column the file has. */
const firstRow = (audience: Audience | null) =>
  new Map(audience ? audience.headers.map((h, i) => [h, audience.rows[0]?.[i] ?? '']) : [])

/** A message with every `${COLUMN}` the file has filled from its first row,
 *  the value tinted. A token the file has no column for stays as typed; with
 *  no file yet, every token does. */
function Filled({ text, row }: { text: string; row: Map<string, string> }) {
  return (
    <>
      {text.split(TOKEN).map((run, i) => {
        const column = TOKEN.test(run) ? run.slice(2, -1) : null
        return column !== null && row.has(column) ? (
          <span key={i} className="text-[var(--color-text-link-default)]">
            {row.get(column)}
          </span>
        ) : (
          <span key={i}>{run}</span>
        )
      })}
    </>
  )
}

/** What each channel's preview card shows: a title line, then the body. */
const PARTS: Record<Channel, (c: BroadcastContent) => [string, string]> = {
  'Push notification': (c) => [c.pushTitle, c.pushBody],
  Email: (c) => [c.emailSubject, c.emailBody],
  SMS: (c) => ['', c.smsMessage],
}

/** *Show preview ‹* — on the card's title row while the preview is hidden. */
export function ShowPreview({ onShow }: { onShow: () => void }) {
  return (
    <GhostButton appearance="highlight" padding="none" onClick={onShow}>
      Show preview
      <Icon slug="chevron-left" size={16} color="currentColor" />
    </GhostButton>
  )
}

export function MessagePreview({
  channel,
  content,
  audience,
  onHide,
}: {
  channel: Channel
  content: BroadcastContent
  audience: Audience | null
  onHide: () => void
}) {
  const row = firstRow(audience)
  const [title, body] = PARTS[channel](content)
  const empty = !title.trim() && !body.trim()
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <div className="flex items-center justify-between gap-[var(--space-4)]">
        <span className="type-label-xl text-[var(--color-text-tertiary-default)]">Preview</span>
        <GhostButton appearance="highlight" padding="none" onClick={onHide}>
          Hide preview
          <Icon slug="chevron-right" size={16} color="currentColor" />
        </GhostButton>
      </div>
      <div className="flex min-h-[240px] flex-1 flex-col justify-center rounded-[var(--radius-2)] bg-[var(--color-surface-secondary-default)] p-[var(--space-6)]">
        {empty ? (
          <p className={cn(NOTE, 'text-center')}>Type a message to see its preview.</p>
        ) : (
          <CardSurface className="h-auto flex-col items-start gap-[var(--space-2)] border border-[var(--color-border-primary-default)]">
            {title.trim() && (
              <p className="type-label-l-emphasized whitespace-pre-line break-words text-[var(--color-text-primary-default)]">
                <Filled text={title} row={row} />
              </p>
            )}
            {body.trim() && (
              <p className="type-body-s whitespace-pre-line break-words text-[var(--color-text-primary-default)]">
                <Filled text={body} row={row} />
              </p>
            )}
          </CardSurface>
        )}
      </div>
    </div>
  )
}
