import type { ReactNode } from 'react'
import { Icon } from '@/bbl/icon'
import type { Audience, BroadcastContent } from '@/data/broadcast'
import type { Channel } from '@/data/templates'
import { cn } from '@/lib/cn'

/* The message preview beside each channel card's fields (BA & Dev feedback,
 * 30 Oct 2026: "Display preview all channel by first row data from audience
 * file"). Each field is filled from the file's first data row and tinted as a
 * link. Always on show, no Hide preview (requester, 1 Nov 2026).
 *
 * Each channel reads as the message the customer gets (requester, 1 Nov 2026;
 * Mobbin: Klaviyo / Fresha SMS bubbles; Email after Gmail's reading view):
 * Push a notification banner, Email a mail as the inbox opens it, SMS a
 * chat bubble. A part with nothing typed, and the whole message while its card is
 * switched off, is a neutral placeholder: the field's label in tertiary text
 * (requester, 1 Nov 2026; grey skeleton bars came first and were dropped).
 * webds ships no message preview (gap): the area is Surface/Secondary, the
 * message surfaces are Surface/Primary with the Border/Primary stroke. */

const TOKEN = /(\$\{[^{}$\s]+\})/

/** The first data row's value for each column the file has. */
const firstRow = (audience: Audience | null) =>
  new Map(audience ? audience.headers.map((h, i) => [h, audience.rows[0]?.[i] ?? '']) : [])

type Row = Map<string, string>

/** A message with every `${COLUMN}` the file has filled from its first row,
 *  the value tinted. A token the file has no column for stays as typed; with
 *  no file yet, every token does. */
function Filled({ text, row }: { text: string; row: Row }) {
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

/** One part of a message: its text, or its field's label in tertiary text
 *  while it is empty or the card is off. */
function Part({ text, row, off, className, label }: { text: string; row: Row; off: boolean; className: string; label: string }) {
  if (off || !text.trim()) {
    return <p className={cn('text-[var(--color-text-tertiary-default)]', className)}>{label}</p>
  }
  return (
    <p className={cn('whitespace-pre-line break-words text-[var(--color-text-primary-default)]', className)}>
      <Filled text={text} row={row} />
    </p>
  )
}

const SURFACE = 'border border-[var(--color-border-primary-default)] bg-[var(--color-surface-primary-default)]'

type PreviewProps = { c: BroadcastContent; row: Row; off: boolean }

/** Push: a notification banner from the app, as the phone shows it. */
function PushPreview({ c, row, off }: PreviewProps) {
  return (
    <div className={cn(SURFACE, 'flex w-full gap-[var(--space-3)] rounded-[var(--radius-4)] p-[var(--space-4)] shadow-raised')}>
      {/* The app icon: the Bangkok Bank mark, the logo's first 34 units (the wordmark starts at 37.7). */}
      <span className="flex size-[var(--space-10)] shrink-0 items-center justify-center rounded-[var(--radius-2)] border border-[var(--color-border-primary-default)]">
        <svg viewBox="0 0 34 40" className="h-[var(--space-6)]" aria-hidden>
          <image href="/bbl-logo.svg" width="161" height="40" />
        </svg>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-1)]">
        <span className="flex items-center justify-between gap-[var(--space-2)]">
          <span className="type-label-s text-[var(--color-text-secondary-default)]">Bualuang mBanking</span>
          <span className="type-body-xs text-[var(--color-text-tertiary-default)]">now</span>
        </span>
        <Part text={c.pushTitle} row={row} off={off} className="type-body-s-emphasized" label="Push title" />
        <Part text={c.pushBody} row={row} off={off} className="type-body-s line-clamp-4" label="Push message" />
      </div>
    </div>
  )
}

/** Email: the mail as an inbox opens it (requester, 1 Nov 2026, after a
 *  Gmail screenshot; a mail window with a logo-headed letter came first and
 *  read too dressed up): the subject on top, then the sender row (a
 *  grey person, Sender name and its address, *to me*, *Today*), then
 *  the content as plain text under the sender's name. */
function EmailPreview({ c, row, off }: PreviewProps) {
  const name = off ? '' : c.emailSenderName.trim()
  const address = off ? '' : c.emailSenderAddress.trim()
  return (
    <div className={cn(SURFACE, 'flex w-full flex-col gap-[var(--space-4)] rounded-[var(--radius-3)] p-[var(--space-5)]')}>
      <Part text={c.emailSubject} row={row} off={off} className="type-heading-xs" label="Email subject" />
      <div className="flex gap-[var(--space-3)]">
        {/* A grey person, as an inbox draws a sender with no photo; webds Avatar's
            Icon type is a dashed placeholder, so the circle is drawn here. */}
        <span className="flex size-[var(--space-10)] shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-tertiary-default)] text-[var(--color-icon-tertiary-default)]">
          <Icon slug="user" size={24} color="currentColor" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-4)]">
          <div className="flex items-start justify-between gap-[var(--space-3)]">
            <span className="flex min-w-0 flex-col">
              {name ? (
                <span className="truncate">
                  <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">{name}</span>
                  {address && <span className="type-body-xs text-[var(--color-text-tertiary-default)]"> &lt;{address}&gt;</span>}
                </span>
              ) : (
                <span className="type-label-m-emphasized text-[var(--color-text-tertiary-default)]">Sender name</span>
              )}
              <span className="type-body-xs flex items-center gap-[var(--space-0-5)] text-[var(--color-text-tertiary-default)]">
                to me
                <Icon slug="chevron-down" size={16} color="currentColor" />
              </span>
            </span>
            <span className="type-body-xs shrink-0 text-[var(--color-text-tertiary-default)]">Today</span>
          </div>
          <Part text={c.emailBody} row={row} off={off} className="type-body-s" label="Email content" />
        </div>
      </div>
    </div>
  )
}

/** SMS: the message as a received chat bubble. */
function SmsPreview({ c, row, off }: PreviewProps) {
  return (
    <div className="flex w-full flex-col gap-[var(--space-2)]">
      <span className="type-body-xs text-center text-[var(--color-text-tertiary-default)]">Today</span>
      <div className="w-4/5 self-start rounded-[var(--radius-4)] rounded-bl-[var(--radius-1)] bg-[var(--color-surface-primary-default)] px-[var(--space-4)] py-[var(--space-3)]">
        <Part text={c.smsMessage} row={row} off={off} className="type-body-s" label="SMS message" />
      </div>
    </div>
  )
}

const PREVIEWS: Record<Channel, (p: PreviewProps) => ReactNode> = {
  'Push notification': PushPreview,
  Email: EmailPreview,
  SMS: SmsPreview,
}

export function MessagePreview({
  channel,
  content,
  audience,
  on,
}: {
  channel: Channel
  content: BroadcastContent
  audience: Audience | null
  /** False while the card is switched off: the message is all placeholder. */
  on: boolean
}) {
  const Preview = PREVIEWS[channel]
  /* The fields set the card's height; a message taller than them scrolls
   * inside the grey area, so the card and its fields stay put (requester,
   * 3 Nov 2026). The area is laid over its cell so it adds no height of its
   * own; `my-auto` centres a short message and lets a long one start at the top. */
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <span className="type-label-xl text-[var(--color-text-tertiary-default)]">Preview</span>
      <div className="relative min-h-[240px] flex-1">
        <div className="absolute inset-0 flex flex-col overflow-y-auto rounded-[var(--radius-2)] bg-[var(--color-surface-secondary-default)] p-[var(--space-6)]">
          <div className="my-auto flex w-full flex-col">
            <Preview c={content} row={firstRow(audience)} off={!on} />
          </div>
        </div>
      </div>
    </div>
  )
}
