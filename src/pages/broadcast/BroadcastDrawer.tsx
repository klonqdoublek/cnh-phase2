import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/bbl/button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { InlineMessage } from '@/bbl/inline-message'
import { OutlineButton } from '@/bbl/outline-button'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { DetailDrawer } from '@/patterns/detail-drawer'
import {
  BROADCAST_COPY,
  fmtDateTime,
  fmtDnd,
  fmtNumber,
  isCancellable,
  RECIPIENT_TYPE_LABEL,
  reportOffered,
  reportReady,
  waitingOf,
  type Broadcast,
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

/* Only Error carries a note (BA Natsinee, 7–9 Nov 2026: drop the blue notes,
   keep the red box with the error's reason). Draft, Queued, Processing, Published
   and Cancelled had a Brand note each until 9 Nov 2026; their copy is in
   docs/broadcast-gaps.md. The Error line is composed (19 Oct 2026). */
const errorNote = (b: Broadcast) =>
  `A system error stopped the broadcast.${b.notSent ? ` ${fmtNumber(b.notSent)} recipients were not sent.` : ''}`

function sectionsOf(b: Broadcast): DrawerSectionSpec[] {
  const draft = b.status === 'Draft'
  /* Nothing was attempted: never submitted, or cancelled. Processing sends, so it has a Delivery result (2 Nov 2026). */
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
            ...(b.status === 'Failed' ? { note: errorNote(b), noteTone: 'negative' as const } : {}),
          },
        ]),
    {
      title: 'Broadcast details',
      icon: 'calendar',
      rows: [
        ['Description', b.description],
        ['Service code', b.serviceCode],
        ['Audience file', b.audienceFile],
        ['Recipient type', RECIPIENT_TYPE_LABEL[b.recipientType]],
        ['Recipient column', b.recipientColumn],
        [
          'Broadcast start',
          b.startMode === 'now'
            ? `${fmtDateTime(new Date(b.start))} (as soon as possible)`
            : fmtDateTime(new Date(b.start)),
        ],
        ['Do Not Disturb', fmtDnd(b.dnd)],
      ],
    },
    ...(b.channels.includes('Push notification')
      ? [
          {
            title: 'Push notification',
            icon: 'alert',
            rows: [
              ['Push title', c.pushTitle],
              ['Push message', c.pushBody],
              ['Deep link', c.pushDeeplink],
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
              ['Sender name', c.emailSenderName],
              ['Sender email address', c.emailSenderAddress],
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
 * Cancel broadcast (behind a confirm dialog) and Edit. A Queued broadcast can
 * be cancelled too but not edited (BA MoM, 29 Oct 2026; was Draft only), so
 * its footer has Cancel broadcast alone (Figma `Footer · Queued`). Once
 * processing starts it cannot be cancelled. Download report is Published's
 * alone (BA MoM, 29 Oct 2026; was once anything was attempted, Error
 * included) and works once the report is generated, which starts when the
 * status turns Published: until then the button is disabled with a line
 * saying so, as the Import Template drawer's (PROPOSAL, pending BA) — behind
 * the same confirm as the list row's download. Processing, Error and
 * Cancelled keep an empty footer, so every drawer ends on the same rule
 * (Figma `Footer · Empty`).
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
  const cancellable = isCancellable(broadcast)
  const [cancelOpen, setCancelOpen] = useState(!!confirmingCancel && cancellable)
  /* The status could not be updated: the broadcast keeps its status. */
  const [cancelFailed, setCancelFailed] = useState(!!openFailed && cancellable)
  const [reporting, setReporting] = useState(!!confirmingDownload && reportReady(broadcast))
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
            {/* Last update (BA asked for the update date, 6 Nov 2026; label as CNH
                Phase 1's drawer). Before any edit it reads the creation time. */}
            <Meta
              icon="transaction-history"
              label={`Last update: ${fmtDateTime(new Date(broadcast.updatedAt ?? broadcast.createdAt))}`}
            />
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
          ) : cancellable ? (
            <OutlineButton appearance="negative" onClick={() => setCancelOpen(true)} className="mr-auto h-[44px]">
              {BROADCAST_COPY.cancel}
            </OutlineButton>
          ) : reportOffered(broadcast) ? (
            <div className="flex w-full items-center justify-end gap-[var(--space-4)]">
              {!reportReady(broadcast) && (
                <InlineMessage size="s" className="min-w-px flex-1">
                  {BROADCAST_COPY.reportGenerating}
                </InlineMessage>
              )}
              <OutlineButton disabled={!reportReady(broadcast)} onClick={() => setReporting(true)} className="h-[44px] shrink-0">
                Download report
                <Icon
                  slug="download"
                  size={16}
                  color={reportReady(broadcast) ? 'var(--color-icon-highlight-default)' : 'var(--color-icon-disabled-default)'}
                />
              </OutlineButton>
            </div>
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
            cancelLabel={draft ? BROADCAST_COPY.cancelKeep : BROADCAST_COPY.cancelKeepQueued}
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
        failDialog
      />
    </div>
  )
}
