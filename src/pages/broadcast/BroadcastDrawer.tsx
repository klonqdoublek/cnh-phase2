import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/bbl/button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { OutlineButton } from '@/bbl/outline-button'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { DetailDrawer } from '@/patterns/detail-drawer'
import {
  BROADCAST_COPY,
  dndNeverSends,
  firstSend,
  fmtDateTime,
  fmtDnd,
  fmtNumber,
  hasDeliveryReport,
  quietUntil,
  waitingOf,
  type Broadcast,
  type BroadcastStatus as Status,
} from '@/data/broadcast'
import { cn } from '@/lib/cn'
import { BroadcastStatus } from './list/BroadcastStatus'
import { DrawerSection, Meta, type DrawerSectionSpec } from './list/drawer-parts'
import { ReportDownload } from './list/ReportDownload'

export type BroadcastDrawerProps = {
  broadcast: Broadcast
  onClose: () => void
  /** Draft only. */
  onEdit: () => void
  /** Draft only: the broadcast is cancelled once the dialog confirms it. */
  onCancel: () => void
  /** Open with the Cancel dialog already up (its preset route). */
  confirmingCancel?: boolean
  /** Open with the Unable to cancel dialog already up (its preset route). */
  cancelFailed?: boolean
  /** Open with the Download report dialog already up (its preset route). */
  confirmingDownload?: boolean
  /** The next Download fails (`…/download/fail`). */
  downloadFailNext?: boolean
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
  Queue: (b) =>
    dndNeverSends(b.dnd)
      ? BROADCAST_COPY.dndNeverSends
      : `The first message goes at ${fmtDateTime(firstSend(new Date(b.start), b.dnd))}.`,
  Processing: (b) =>
    b.quiet ? `Inside the quiet period. Sending resumes at ${resumesAt(b)}.` : 'Messages are being sent.',
  Published: (b) =>
    b.notSent && b.end
      ? `The broadcast ended at ${fmtDateTime(new Date(b.end))}. ${fmtNumber(b.notSent)} recipients were not sent.`
      : 'Every recipient was sent a message.',
  /* Failed and Cancelled (19 Oct 2026): composed, the original build has
     neither. The report pointer (UX writer, 28 Oct 2026) only when the footer
     offers Download report. */
  Failed: (b) =>
    `A system error stopped the broadcast.${b.notSent ? ` ${fmtNumber(b.notSent)} recipients were not sent.` : ''}${
      b.notSent && hasDeliveryReport(b) ? ' Download report for details.' : ''
    }`,
  Cancelled: () => 'Cancelled before it was submitted. Nothing was sent.',
}

function sectionsOf(b: Broadcast): DrawerSectionSpec[] {
  const draft = b.status === 'Draft'
  /* Never submitted, so nothing was attempted. */
  const unsent = draft || b.status === 'Cancelled'
  const waiting = waitingOf(b)
  const c = b.content
  return [
    ...(unsent
      ? []
      : [
          {
            title: 'Delivery result',
            icon: 'send',
            rows: [
              ['Total recipients', fmtNumber(b.recipients)],
              ['Success', fmtNumber(b.success)],
              ['Failed', fmtNumber(b.failed)],
              ...(b.notSent ? [['Not sent', fmtNumber(b.notSent)]] : []),
              ['Waiting to send', fmtNumber(waiting)],
            ] as [string, string][],
            note: STATUS_LINE[b.status](b),
            noteTone: b.status === 'Failed' ? ('negative' as const) : ('brand' as const),
          },
        ]),
    {
      title: 'Broadcast details',
      icon: 'calendar',
      rows: [
        ['Description', b.description],
        ['Audience file', b.audienceFile],
        ['Recipient type', b.recipientType === 'cis' ? 'CIS' : 'Direct recipient'],
        ['Recipient column', b.recipientColumn],
        [
          'Broadcast start',
          b.startMode === 'now'
            ? `${fmtDateTime(new Date(b.start))} (as soon as possible)`
            : fmtDateTime(new Date(b.start)),
        ],
        ['Broadcast end', b.end ? fmtDateTime(new Date(b.end)) : ''],
        ['Do Not Disturb', fmtDnd(b.dnd)],
      ],
      note: unsent ? STATUS_LINE[b.status](b) : undefined,
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
 * close, Escape, a click outside, and a focus trap. A Draft's footer has
 * Cancel broadcast (behind a confirm dialog) and Edit. Once submitted, a
 * broadcast cannot be cancelled (a system limit, 19 Oct 2026); its footer has
 * Download report once anything was attempted (Processing, Published or
 * Failed), where the CNH template drawer keeps its Download — behind the same
 * confirm as the list row's download. Queue and Cancelled keep an empty
 * footer, so every drawer ends on the same rule (Figma `Footer · Empty`).
 */
export function BroadcastDrawer({
  broadcast,
  onClose,
  onEdit,
  onCancel,
  confirmingCancel,
  cancelFailed: openFailed,
  confirmingDownload,
  downloadFailNext,
}: BroadcastDrawerProps) {
  const panel = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(!!confirmingCancel && broadcast.status === 'Draft')
  /* The status could not be updated: the broadcast stays a Draft. */
  const [cancelFailed, setCancelFailed] = useState(!!openFailed && broadcast.status === 'Draft')
  const [reporting, setReporting] = useState(!!confirmingDownload && hasDeliveryReport(broadcast))
  /* The dialog owns Escape and clicks while it is up. */
  const dialogUp = useRef(cancelOpen || cancelFailed)
  dialogUp.current = cancelOpen || cancelFailed || reporting

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (dialogUp.current) return
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
      if (dialogUp.current) return
      if ((event.target as Element).closest?.('[data-report-download]')) return
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
  const attempted = hasDeliveryReport(broadcast)
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
            <>
              {/* Negative action on the left, away from Edit, as CMS does (22 Oct 2026). */}
              <OutlineButton appearance="negative" onClick={() => setCancelOpen(true)} className="mr-auto h-[44px]">
                {BROADCAST_COPY.cancel}
              </OutlineButton>
              <Button onClick={onEdit} className="h-[44px]">
                Edit
              </Button>
            </>
          ) : attempted ? (
            <OutlineButton onClick={() => setReporting(true)} className="h-[44px]">
              Download report
              <Icon slug="download" size={16} color="var(--color-icon-highlight-default)" />
            </OutlineButton>
          ) : (
            <></>
          )
        }
      >
        {sections.map((section, i) => (
          <DrawerSection key={section.title} section={section} first={i === 0} />
        ))}
      </DetailDrawer>

      {/* On the body: the panel's transform would pin a fixed dialog inside it. */}
      {cancelOpen &&
        createPortal(
          <ConfirmDialog
            anatomy="sectioned"
            contentType="label-xl"
            layer="fixed"
            width={600}
            destructive
            title={BROADCAST_COPY.cancelTitle}
            cancelLabel={BROADCAST_COPY.cancelKeep}
            confirmLabel={BROADCAST_COPY.cancel}
            onCancel={() => setCancelOpen(false)}
            onConfirm={onCancel}
            onDismiss={() => setCancelOpen(false)}
            className="z-50"
          >
            {BROADCAST_COPY.cancelBody(broadcast.name)}
          </ConfirmDialog>,
          document.body,
        )}
      {cancelFailed &&
        createPortal(
          <ConfirmDialog
            anatomy="sectioned"
            contentType="label-xl"
            layer="fixed"
            width={600}
            title={BROADCAST_COPY.cancelFailTitle}
            cancelLabel="Close"
            confirmLabel="Try again"
            onCancel={() => setCancelFailed(false)}
            onConfirm={() => {
              setCancelFailed(false)
              onCancel()
            }}
            onDismiss={() => setCancelFailed(false)}
            className="z-50"
          >
            Please try again
          </ConfirmDialog>,
          document.body,
        )}
      <ReportDownload
        broadcast={reporting ? broadcast : null}
        onDone={() => setReporting(false)}
        failNext={downloadFailNext}
      />
    </div>
  )
}
