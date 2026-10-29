import { useEffect, useRef, useState } from 'react'
import { Button } from '@/bbl/button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { OutlineButton } from '@/bbl/outline-button'
import { DetailDrawer } from '@/patterns/detail-drawer'
import { IMPORT_COPY } from '@/data/import-spec'
import { cn } from '@/lib/cn'
import { DrawerSection, Meta, type DrawerSectionSpec } from '@/pages/broadcast/list/drawer-parts'
import { JobBadge } from './JobBadge'
import { downloadResult, resultOf, timeOf, type ImportJob } from './jobs'

function sectionOf(job: ImportJob): DrawerSectionSpec {
  if (job.status === 'processing')
    return { title: IMPORT_COPY.resultTitle, icon: 'document', rows: [], note: IMPORT_COPY.startedBody }
  if (job.status === 'failed')
    return { title: IMPORT_COPY.resultTitle, icon: 'document', rows: [], note: IMPORT_COPY.failBody(job.fileName), noteTone: 'negative' }
  const r = resultOf(job)
  return {
    title: IMPORT_COPY.resultTitle,
    icon: 'document',
    rows: [
      [IMPORT_COPY.resultTotal, String(r.total)],
      [IMPORT_COPY.resultImported, String(r.imported)],
      [IMPORT_COPY.resultFailed, String(r.failed)],
    ],
    note: IMPORT_COPY.resultNote(r.failed),
  }
}

/**
 * Direction B's import, read beside the list (BA's MoM, 29 Oct 2026: select an
 * import to see its result and download the file). Built as the Broadcast
 * drawer: webds `detail-drawer` (720), its status and facts, one Import result
 * section (Templates in file, Imported, Failed) with the status note, fixed to
 * the right edge with no scrim, the 225ms slide-in, Escape and a click outside.
 * The footer offers Download result on a Completed import and Try again on an
 * Error (the system-fail rule); Processing keeps an empty footer.
 */
export function ImportDrawer({ job, onClose, onRetry }: { job: ImportJob; onClose: () => void; onRetry: (id: number) => void }) {
  const panel = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    panel.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    const onPointer = (event: MouseEvent) => {
      if (!panel.current?.contains(event.target as Node)) onClose()
    }
    const timer = setTimeout(() => document.addEventListener('mousedown', onPointer), 0)
    addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', onPointer)
      removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={job.fileName}
      tabIndex={-1}
      className={cn(
        'fixed inset-y-0 right-0 z-50 outline-none transition-transform duration-[225ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        shown ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <DetailDrawer
        title={job.fileName}
        status={
          <>
            <span className="type-body-s text-[var(--color-text-tertiary-default)]">Status</span>
            <JobBadge status={job.status} />
          </>
        }
        facts={<Meta icon="transaction-history" label={`${IMPORT_COPY.submitted}: ${timeOf(job.startedAt)}`} />}
        close={<IconButton size={24} label="Close" icon={<Icon slug="sidebar-collapse" size={24} />} onClick={onClose} />}
        actions={
          job.status === 'done' ? (
            <OutlineButton onClick={() => downloadResult(job)} className="h-[44px]">
              {IMPORT_COPY.downloadResult}
              <Icon slug="download" size={16} color="var(--color-icon-highlight-default)" />
            </OutlineButton>
          ) : job.status === 'failed' ? (
            <Button onClick={() => onRetry(job.id)} className="h-[44px]">
              {IMPORT_COPY.retry}
            </Button>
          ) : (
            <></>
          )
        }
      >
        <DrawerSection section={sectionOf(job)} first />
      </DetailDrawer>
    </div>
  )
}
