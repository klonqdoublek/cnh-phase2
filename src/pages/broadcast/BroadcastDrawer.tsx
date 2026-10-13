import { useEffect, useRef, useState } from 'react'
import { Button } from '@/bbl/button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { DetailDrawer } from '@/patterns/detail-drawer'
import { firstSend, fmtDateTime, fmtDnd, fmtNumber, quietUntil, type Broadcast, type BroadcastStatus as Status } from '@/data/broadcast'
import { cn } from '@/lib/cn'
import { BroadcastStatus } from './list/BroadcastStatus'
import { DrawerSection, Meta, type DrawerSectionSpec } from './list/drawer-parts'

export type BroadcastDrawerProps = {
  broadcast: Broadcast
  onClose: () => void
  /** Draft only. */
  onEdit: () => void
}

/** HH:mm the current quiet period ends, or the first rule's end when now is
 *  outside every rule (the fixtures are dated, the clock is not). */
function resumesAt(b: Broadcast) {
  const end = quietUntil(new Date(), b.dnd)
  if (end) return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
  const rule = b.dnd.rules[0]
  return rule && !rule.allDay ? rule.to : '00:00'
}

const STATUS_LINE: Record<Status, (b: Broadcast) => string> = {
  Draft: () => 'Not submitted yet. Nothing is sent until the broadcast is submitted.',
  Scheduled: (b) => `The first message goes at ${fmtDateTime(firstSend(new Date(b.start), b.dnd))}.`,
  Sending: () => 'Messages are being sent.',
  Paused: (b) => `Inside the quiet period. Sending resumes at ${resumesAt(b)}.`,
  Completed: () => 'Every recipient was sent a message.',
}

function sectionsOf(b: Broadcast): DrawerSectionSpec[] {
  const draft = b.status === 'Draft'
  const waiting = Math.max(0, b.recipients - b.success - b.failed)
  const c = b.content
  return [
    ...(draft
      ? []
      : [
          {
            title: 'Delivery result',
            icon: 'send',
            rows: [
              ['Total recipients', fmtNumber(b.recipients)],
              ['Success', fmtNumber(b.success)],
              ['Failed', fmtNumber(b.failed)],
              ['Waiting to send', fmtNumber(waiting)],
            ] as [string, string][],
            note: STATUS_LINE[b.status](b),
          },
        ]),
    {
      title: 'Broadcast details',
      icon: 'calendar',
      rows: [
        ['Description', b.description],
        ['Audience file', b.audienceFile],
        ['Recipient type', `${b.recipientType === 'cis' ? 'CIS' : 'Direct recipient'} · by ${b.recipientColumn}`],
        [
          'Broadcast start',
          b.startMode === 'now'
            ? `As soon as possible · ${fmtDateTime(new Date(b.start))}`
            : fmtDateTime(new Date(b.start)),
        ],
        ['Do Not Disturb', fmtDnd(b.dnd)],
      ],
      note: draft ? STATUS_LINE.Draft(b) : undefined,
    },
    ...(b.channels.includes('Push notification')
      ? [
          {
            title: 'Push notification',
            icon: 'alert',
            rows: [
              ['Push title', c.pushTitle],
              ['Push message', c.pushBody],
            ] as [string, string][],
          },
        ]
      : []),
    ...(b.channels.includes('Email')
      ? [
          {
            title: 'Email',
            icon: 'mail',
            rows: [
              ['Email subject', c.emailSubject],
              ['Email body', c.emailBody],
            ] as [string, string][],
          },
        ]
      : []),
    ...(b.channels.includes('SMS')
      ? [{ title: 'SMS', icon: 'message', rows: [['SMS message', c.smsMessage]] as [string, string][] }]
      : []),
  ]
}

/**
 * A broadcast, read beside the list — webds `detail-drawer` (720, header with
 * status and facts, scrolling body, footer at 44). This file supplies what the
 * pattern leaves to its consumer: fixed to the right edge over the list with
 * no scrim (as the original), the 225ms slide-in, the `sidebar-collapse`
 * close, Escape, a click outside, and a focus trap. Edit is a Draft's only
 * action.
 */
export function BroadcastDrawer({ broadcast, onClose, onEdit }: BroadcastDrawerProps) {
  const panel = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return onClose()
      if (event.key !== 'Tab' || !panel.current) return
      const focusable = [
        ...panel.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => el.offsetParent !== null && !(el as HTMLButtonElement).disabled)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === panel.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    const onPointer = (event: MouseEvent) => {
      if (!panel.current?.contains(event.target as Node)) onClose()
    }
    const timer = setTimeout(() => document.addEventListener('mousedown', onPointer), 0)
    addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', onPointer)
      removeEventListener('keydown', onKey)
      if (previous && document.contains(previous)) previous.focus()
    }
  }, [onClose])

  const draft = broadcast.status === 'Draft'
  const sections = sectionsOf(broadcast)

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={broadcast.name}
      tabIndex={-1}
      className={cn(
        'fixed inset-y-0 right-0 z-50 outline-none transition-transform duration-[225ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        shown ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <DetailDrawer
        title={broadcast.name}
        status={
          <>
            <span className="type-body-s text-[var(--color-text-tertiary-default)]">Status</span>
            <BroadcastStatus status={broadcast.status} />
          </>
        }
        facts={
          <>
            <Meta icon="user" label={`Created by: ${broadcast.createdBy}`} />
            <Meta icon="transaction-history" label={`Created: ${fmtDateTime(new Date(broadcast.createdAt))}`} />
          </>
        }
        close={
          <IconButton
            size={24}
            label="Close"
            icon={<Icon slug="sidebar-collapse" size={24} />}
            onClick={onClose}
          />
        }
        actions={
          draft ? (
            <Button onClick={onEdit} className="h-[44px]">
              Edit
            </Button>
          ) : undefined
        }
      >
        {sections.map((section, i) => (
          <DrawerSection key={section.title} section={section} first={i === 0} />
        ))}
      </DetailDrawer>
    </div>
  )
}
