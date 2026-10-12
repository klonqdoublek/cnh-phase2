import { useEffect, useRef, useState } from 'react'
import { Button } from '@/bbl/button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { OutlineButton } from '@/bbl/outline-button'
import { DetailDrawer, type DetailDrawerSection } from '@/patterns/detail-drawer'
import { StatusBadge, type StatusTone } from '@/patterns/status-badge'
import type { Template, TemplateStatus } from '@/data/templates'
import { cn } from '@/lib/cn'

export type TemplateDrawerProps = {
  template: Template
  onClose: () => void
  onEdit: () => void
  onDownload: () => void
}

/* webds `status-badge`, not the library Badge: the library one always draws its
   placeholder icon, and the original's badge carries none. Same three tones as
   the original (positive / disabled / caution). */
const TONE: Record<TemplateStatus, StatusTone> = { Published: 'green', Inactive: 'grey', Draft: 'yellow' }

const EMPTY = '–'

/**
 * A notification read beside the list — webds `detail-drawer` (720, measured
 * on this product's own drawer). This file supplies only what the pattern
 * leaves to its consumer, as the original build does: fixed to the right edge
 * with no scrim, a slide-in from the right (225ms, the original's MUI drawer
 * timing — neither system publishes a motion token), and closing on Escape,
 * on a click outside, or on the `sidebar-collapse` mark. Focus moves into the
 * panel, stays there on Tab, and goes back where it was on close.
 */
export function TemplateDrawer({ template, onClose, onEdit, onDownload }: TemplateDrawerProps) {
  const panel = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !panel.current) return
      const focusable = [
        ...panel.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => el.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === panel.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    const onOutside = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node)) onClose()
    }
    /* Next tick, so the click that opened the drawer does not close it. */
    const t = setTimeout(() => document.addEventListener('mousedown', onOutside), 0)
    addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', onOutside)
      removeEventListener('keydown', onKey)
      if (before && document.contains(before)) before.focus()
    }
  }, [onClose])

  const d = template.detail
  const section = (title: string, icon: string, rows: [string, string][]): DetailDrawerSection => ({
    title,
    icon: <Icon slug={icon} size={24} />,
    rows: rows.map(([label, value]) => [label, value || EMPTY]),
  })
  const sections = [
    section('General information', 'personal-information', [
      ['Ref code', d.templateRefCode],
      ['Notification name', template.name],
      ['Description', template.description],
      ['Product name', template.productName],
      ['Service code', d.serviceCode],
      ['Notification group', d.notificationGroup],
      ['Remarks', d.remark],
    ]),
    section('Push notification', 'alert', [
      ['Push title (TH)', d.pushTitleTh],
      ['Push title (EN)', d.pushTitleEn],
      ['Push message (TH)', d.pushBodyTh],
      ['Push message (EN)', d.pushBodyEn],
      ['Deep link', d.pushDeeplink],
    ]),
    section('Email', 'mail', [
      ['Email subject (TH)', d.emailSubjectTh],
      ['Email subject (EN)', d.emailSubjectEn],
      ['Email content (TH)', d.emailBodyTh],
      ['Email content (EN)', d.emailBodyEn],
      ['Sender name (TH)', d.emailDisplayNameTh],
      ['Sender name (EN)', d.emailDisplayNameEn],
      ['Sender email address', d.emailFromAddress],
    ]),
    /* The original labels the SMS rows "Email subject (TH/EN)" — transcribed as
       built; flagged in the report rather than corrected here. */
    section('SMS', 'message', [
      ['Email subject (TH)', d.smsMessageTh],
      ['Email subject (EN)', d.smsMessageEn],
    ]),
  ]

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={template.name}
      tabIndex={-1}
      className={cn(
        'fixed inset-y-0 right-0 z-50 outline-none transition-transform duration-[225ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        shown ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <DetailDrawer
        title={template.name}
        status={
          <>
            <span className="type-body-s text-[var(--color-text-secondary-default)]">Status</span>
            <StatusBadge tone={TONE[template.status]} size="m">
              {template.status}
            </StatusBadge>
          </>
        }
        facts={
          <>
            <Fact icon="user" label={`Created by: ${d.createdBy}`} />
            <Fact icon="edit-1" label={`Updated by: ${d.updatedBy}`} />
            <Fact icon="transaction-history" label={`Last update: ${d.lastUpdated}`} />
          </>
        }
        close={
          <IconButton size={24} label="Close" icon={<Icon slug="sidebar-collapse" size={24} />} onClick={onClose} />
        }
        sections={sections}
        actions={
          <>
            <OutlineButton onClick={onDownload}>
              <Icon slug="download" size={16} color="currentColor" />
              Download
            </OutlineButton>
            <Button onClick={onEdit}>Edit</Button>
          </>
        }
      />
    </div>
  )
}

function Fact({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-[var(--space-1-5)] type-body-s text-[var(--color-text-tertiary-default)]">
      <Icon slug={icon} size={16} color="var(--color-icon-tertiary-default)" />
      <span>{label}</span>
    </span>
  )
}
