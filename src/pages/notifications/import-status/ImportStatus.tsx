import { useEffect, useRef, useState } from 'react'
import type { ImportJob, JobStatus } from './jobs'
import { UploadPanel } from './UploadPanel'

/**
 * How Import says a job started, finished or failed: direction A, the upload
 * panel (design critique, 29 Oct 2026; C–G left the code on 30 Oct 2026, B
 * on 29 Oct, and all stay on the Figma playground). The panel opens on every
 * change; no toast. Its close ends the session (30 Oct 2026): finished jobs
 * leave the list, a Processing one stays and brings the panel back, alone,
 * when it changes. Every import also stays on the Import Template page.
 */
export function useImportFeedback(jobs: ImportJob[]) {
  const seen = useRef(new Map<number, JobStatus>())
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    let changed = false
    for (const job of jobs) {
      if (seen.current.get(job.id) === job.status) continue
      seen.current.set(job.id, job.status)
      changed = true
    }
    if (changed) setPanelOpen(true)
  }, [jobs])

  return { panelOpen, setPanelOpen }
}

export function ImportFeedback({
  feedback,
  jobs,
  onRetry,
  onDismiss,
}: {
  feedback: ReturnType<typeof useImportFeedback>
  jobs: ImportJob[]
  onRetry: (id: number) => void
  onDismiss: (id: number) => void
}) {
  const { panelOpen, setPanelOpen } = feedback
  if (!panelOpen || jobs.length === 0) return null
  return (
    <UploadPanel
      jobs={jobs}
      onRetry={onRetry}
      onClose={() => {
        jobs.filter((j) => j.status !== 'processing').forEach((j) => onDismiss(j.id))
        setPanelOpen(false)
      }}
    />
  )
}
