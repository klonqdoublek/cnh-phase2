import { useEffect, useRef, useState } from 'react'
import { Button } from '@/bbl/button'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { IMPORT_COPY } from '@/data/import-spec'
import type { ImportDirection } from '@/prototype/import-direction'
import { ListToast } from '../ListToast'
import { resultOf, type ImportJob, type JobStatus } from './jobs'
import { UploadPanel } from './UploadPanel'

type Event = { kind: 'started' | JobStatus; job: ImportJob }

/**
 * What each direction says when a job starts, finishes or fails (BA / Dev,
 * 28 Oct 2026; four directions until one is chosen):
 *
 *   A  the upload panel opens on every change; no toast. Its close ends the
 *      session (30 Oct 2026): finished jobs leave the list, a Processing one
 *      stays and brings the panel back, alone, when it changes
 *   (B, toast + Recent imports with a drawer, left the code on 29 Oct 2026,
 *   requester; it stays on the Figma playground.)
 *   (A and C: each job's row carries its result.)
 *   C  the indicator's popover opens on submit; its mark changes on done/failure
 *   D  a dialog on submit (about 10 minutes, the page can be left), a toast on
 *      done with the result, and a dialog on failure
 *      (Close / Try again, the system-fail rule)
 *   E  the loading bar under the page header carries every state; no toast
 *      (ImportProgress, 29 Oct 2026)
 *   F  grey rows under a file row at the top of the table; no toast
 *      (ImportRows, 29 Oct 2026)
 *   G  the Import button's menu opens on submit; a ring / Negative mark after
 *      its label carries the state (ImportMenuButton, 29 Oct 2026)
 *
 * Toasts close after 3 s, except on a held route (`#/list/import/<job preset>`).
 * (D's done toast stayed until closed while it carried Download result,
 * 29 Oct 2026; it closes after 3 s again since Download result went.)
 */
export function useImportFeedback(jobs: ImportJob[], direction: ImportDirection) {
  const seen = useRef(new Map<number, JobStatus>())
  const [event, setEvent] = useState<Event | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  useEffect(() => {
    let last: Event | null = null
    for (const job of jobs) {
      const before = seen.current.get(job.id)
      if (before === job.status) continue
      seen.current.set(job.id, job.status)
      last = { kind: job.status === 'processing' ? 'started' : job.status, job }
    }
    if (!last) return
    setEvent(last)
    setPanelOpen(true)
    if (last.kind === 'started') setPopoverOpen(true)
  }, [jobs])

  return { event, clearEvent: () => setEvent(null), panelOpen, setPanelOpen, popoverOpen, setPopoverOpen, direction }
}

export function ImportFeedback({
  feedback,
  jobs,
  held,
  onRetry,
  onDismiss,
}: {
  feedback: ReturnType<typeof useImportFeedback>
  jobs: ImportJob[]
  held: boolean
  onRetry: (id: number) => void
  onDismiss: (id: number) => void
}) {
  const { event, clearEvent, panelOpen, setPanelOpen, direction } = feedback
  const kind = event?.kind
  const toast =
    event &&
    ((direction === 'D' && kind === 'done' && {
        appearance: 'positive' as const,
        title: IMPORT_COPY.successTitle,
        description: IMPORT_COPY.resultLine(resultOf(event.job).imported, resultOf(event.job).failed),
      }))

  return (
    <>
      {direction === 'A' && panelOpen && jobs.length > 0 && (
        <UploadPanel
          jobs={jobs}
          onRetry={onRetry}
          onClose={() => {
            jobs.filter((j) => j.status !== 'processing').forEach((j) => onDismiss(j.id))
            setPanelOpen(false)
          }}
        />
      )}

      <ListToast
        open={!!toast}
        appearance={toast ? toast.appearance : 'positive'}
        title={toast ? toast.title : ''}
        description={toast ? toast.description : ''}
        autoHideMs={held ? undefined : 3000}
        onClose={clearEvent}
      />

      {direction === 'D' && kind === 'started' && (
        <ConfirmDialog
          anatomy="sectioned"
          contentType="label-xl"
          layer="fixed"
          width={444}
          title={IMPORT_COPY.startedTitle}
          actions={<Button onClick={clearEvent}>{IMPORT_COPY.ok}</Button>}
          onDismiss={clearEvent}
          className="relative z-50"
        >
          <p className="type-body-m text-[var(--color-text-primary-default)]">{IMPORT_COPY.startedDialogBody}</p>
        </ConfirmDialog>
      )}

      {direction === 'D' && kind === 'failed' && event && (
        /* PROPOSAL, pending BA: the server fails after the upload. */
        <ConfirmDialog
          anatomy="sectioned"
          contentType="label-xl"
          layer="fixed"
          width={444}
          title={IMPORT_COPY.failTitle}
          cancelLabel={IMPORT_COPY.close}
          confirmLabel={IMPORT_COPY.retry}
          onCancel={clearEvent}
          onConfirm={() => {
            clearEvent()
            onRetry(event.job.id)
          }}
          onDismiss={clearEvent}
          className="relative z-50"
        >
          <p className="type-body-m text-[var(--color-text-primary-default)]">{IMPORT_COPY.failBody(event.job.fileName)}</p>
        </ConfirmDialog>
      )}
    </>
  )
}
