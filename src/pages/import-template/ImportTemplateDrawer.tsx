import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { InlineMessage } from '@/bbl/inline-message'
import { OutlineButton } from '@/bbl/outline-button'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { DetailDrawer } from '@/patterns/detail-drawer'
import {
  IMPORT_TEMPLATE_COPY as COPY,
  fmtImportTime,
  importReportCsv,
  importReportName,
  reportOffered,
  type ImportRecord,
} from '@/data/import-history'
import { fmtNumber } from '@/data/broadcast'
import { cn } from '@/lib/cn'
import { BroadcastStatus } from '../broadcast/list/BroadcastStatus'
import { DrawerSection, Meta, type DrawerSectionSpec } from '../broadcast/list/drawer-parts'
import { ReportDownload } from '../broadcast/list/ReportDownload'

export type ImportTemplateDrawerProps = {
  record: ImportRecord
  onClose: () => void
  /** Open with the Download report dialog already up (its preset route). */
  confirmingDownload?: boolean
  /** Hold the drawer's loading state (`#/import-template/view/<id>/loading`). */
  holdLoading?: boolean
}

/** How long the drawer fetches the import before its details show, in the prototype. */
const DRAWER_LOAD_MS = 600

function sectionsOf(r: ImportRecord): DrawerSectionSpec[] {
  const read = r.total !== null
  return [
    {
      title: COPY.resultTitle,
      icon: 'document',
      rows: [
        [COPY.total, read ? fmtNumber(r.total!) : ''],
        [COPY.imported, read ? fmtNumber(r.imported) : ''],
        [COPY.failed, read ? fmtNumber(r.failed.length) : ''],
      ],
      note:
        r.status === 'Published'
          ? COPY.note.Published(r.failed.length)
          : r.status === 'Failed'
            ? COPY.note.Failed
            : COPY.note[r.status],
      noteTone: r.status === 'Failed' ? 'negative' : 'brand',
    },
    {
      title: COPY.detailsTitle,
      icon: 'calendar',
      rows: [
        ['Import file name', r.fileName],
        ['Created datetime', fmtImportTime(r.createdAt)],
        ['Updated datetime', fmtImportTime(r.updatedAt)],
      ],
    },
  ]
}

/**
 * One import, read beside the Import Template list — built as the Broadcast
 * View detail drawer (webds `detail-drawer`, 720, fixed to the right, no scrim,
 * the 225ms slide-in, `sidebar-collapse` close, Escape, a click outside, a
 * focus trap). Its sections are the import's result (Templates in file /
 * Imported / Failed, as Broadcast's Delivery result) and details.
 *
 * Download report (BA & Dev deck, slide 9): Published only, and only once the
 * report is generated, which starts when the status turns Published. Until
 * then the button is disabled with a line saying so (composed, 30 Oct 2026).
 * The report holds the failed rows only, so the user can fix and import them
 * again. Queue, Processing and Error keep an empty footer, as Broadcast's
 * Processing does.
 */
export function ImportTemplateDrawer({ record, onClose, confirmingDownload, holdLoading }: ImportTemplateDrawerProps) {
  const panel = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  /* CNH Phase 1's View detail loading (Phase 1 Figma 1:138888, 6 Nov 2026): the drawer opens on a
     spinner, with only its close, then the import's details. */
  const [fetching, setFetching] = useState(!confirmingDownload)
  useEffect(() => {
    if (holdLoading || !fetching) return
    const timer = setTimeout(() => setFetching(false), DRAWER_LOAD_MS)
    return () => clearTimeout(timer)
  }, [holdLoading, fetching])
  const [reporting, setReporting] = useState(!!confirmingDownload && record.reportReady)
  const dialogUp = useRef(reporting)
  dialogUp.current = reporting

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
        ...panel.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])'),
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

  const sections = sectionsOf(record)

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={record.fileName}
      tabIndex={-1}
      className={cn(
        'fixed inset-y-0 right-0 z-50 outline-none transition-transform duration-[225ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        shown ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      {fetching ? (
        <DetailDrawer
          title=""
          close={
            <IconButton size={24} label="Close" icon={<Icon slug="sidebar-collapse" size={24} />} onClick={onClose} />
          }
          /* Phase 1 draws no rule under the close while it loads. */
          className="[&>[data-part=Header]]:shadow-none"
        >
          <div className="flex h-full min-h-[400px] w-full items-center justify-center">
            <SpinnerLoader size="l" />
          </div>
        </DetailDrawer>
      ) : (
      <DetailDrawer
        title={record.fileName}
        status={
          <>
            <span className="type-body-s text-[var(--color-text-tertiary-default)]">{COPY.status}</span>
            <BroadcastStatus status={record.status} />
          </>
        }
        facts={
          <>
            {/* Created by / Updated by / Updated at, as the Broadcast drawer and
                CNH Phase 1's (BA Natsinee, 12 Nov 2026: consistent across
                sections). The Created date row is dropped on that request. */}
            <Meta icon="user" label={`Created by: ${record.createdBy}`} />
            <Meta icon="edit-1" label={`Updated by: ${record.updatedBy ?? record.createdBy}`} />
            <Meta
              icon="transaction-history"
              label={`Updated at: ${fmtImportTime(record.updatedAt ?? record.createdAt)}`}
            />
          </>
        }
        close={
          <IconButton size={24} label="Close" icon={<Icon slug="sidebar-collapse" size={24} />} onClick={onClose} />
        }
        actions={
          reportOffered(record) ? (
            <div className="flex w-full items-center justify-end gap-[var(--space-4)]">
              {!record.reportReady && (
                <InlineMessage size="s" className="min-w-px flex-1">
                  {COPY.reportGenerating}
                </InlineMessage>
              )}
              <OutlineButton disabled={!record.reportReady} onClick={() => setReporting(true)} className="h-[44px] shrink-0">
                Download report
                <Icon
                  slug="download"
                  size={16}
                  color={record.reportReady ? 'var(--color-icon-highlight-default)' : 'var(--color-icon-disabled-default)'}
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
      )}

      <ReportDownload
        file={reporting ? { name: importReportName(record), text: () => importReportCsv(record) } : null}
        title={COPY.reportTitle}
        onDone={() => setReporting(false)}
      />
    </div>
  )
}
