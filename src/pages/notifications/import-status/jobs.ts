import { useCallback, useEffect, useRef, useState } from 'react'
import { IMPORT_PROCESS_FAIL_SENTINEL, PROCESS_MS, QUEUE_MS, REPORT_MS, serverResult } from '@/data/import-spec'
import type { Template } from '@/data/templates'

/* Background import jobs (BA / Dev, 28 Oct 2026). Import that passes the dialog's
 * checks sends the file to a server, and its templates reach the list about 10
 * minutes later: a job is that wait. `queued` until the server picks it up, then
 * `processing` until it is done, then `done` (Published: the templates that pass
 * the server's row checks land on the list, the rest are counted as failed; 29 Oct
 * 2026) or `failed` (Error; PROPOSAL, pending BA: a failure on the server after the
 * upload). Queue and Published follow Broadcast's statuses (BA & Dev deck, 30 Oct
 * 2026). A Published job's report is generated after it turns Published (slide 9),
 * so `reportReady` comes a little later. App.tsx owns the jobs so they outlive a
 * visit to another page; the upload panel and the Import Template page draw them. */

export type JobStatus = 'queued' | 'processing' | 'done' | 'failed'
export type ImportJob = {
  id: number
  fileName: string
  templates: Template[]
  replace: boolean
  status: JobStatus
  startedAt: number
  /** When it turned Published or Error. */
  finishedAt?: number
  /** Published, and its report generated: Download report is ready. */
  reportReady?: boolean
  /** Closed out of the upload panel; it stays on the Import Template page. */
  dismissed?: boolean
  /** A preset route's job: it holds its status and runs no timer. */
  held?: boolean
}

export type ImportJobs = {
  /** The upload panel's jobs: this session's, less the ones its close cleared. */
  jobs: ImportJob[]
  /** Every job submitted, for the Import Template page. */
  history: ImportJob[]
  submit: (templates: Template[], fileName: string, replace: boolean) => void
  retry: (id: number) => void
  dismiss: (id: number) => void
  /** Replaces the jobs with one held job, for `#/list/import/<job preset>`. */
  seed: (job: Omit<ImportJob, 'id' | 'startedAt' | 'held'>) => void
}

/** `land` puts a finished job's templates on the list (App's import, unchanged). */
export function useImportJobs(land: (templates: Template[], fileName: string, replace: boolean) => void): ImportJobs {
  const [history, setJobs] = useState<ImportJob[]>([])
  const jobsRef = useRef(history)
  jobsRef.current = history
  const nextId = useRef(1)
  const timers = useRef(new Map<number, number>())
  const landRef = useRef(land)
  landRef.current = land

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const later = useCallback((id: number, ms: number, step: () => void) => {
    const t = window.setTimeout(() => {
      timers.current.delete(id)
      step()
    }, ms)
    timers.current.set(id, t)
  }, [])

  const patch = (id: number, change: Partial<ImportJob>) =>
    setJobs((list) => list.map((j) => (j.id === id ? { ...j, ...change } : j)))

  const run = useCallback(
    (job: ImportJob) => {
      later(job.id, QUEUE_MS, () => {
        patch(job.id, { status: 'processing' })
        later(job.id, PROCESS_MS, () => {
          const fails = job.fileName.toLowerCase().includes(IMPORT_PROCESS_FAIL_SENTINEL)
          if (!fails) landRef.current(serverResult(job.templates).imported, job.fileName, job.replace)
          patch(job.id, { status: fails ? 'failed' : 'done', finishedAt: Date.now() })
          if (!fails) later(job.id, REPORT_MS, () => patch(job.id, { reportReady: true }))
        })
      })
    },
    [later],
  )

  const submit = useCallback<ImportJobs['submit']>(
    (templates, fileName, replace) => {
      const job: ImportJob = { id: nextId.current++, fileName, templates, replace, status: 'queued', startedAt: Date.now() }
      setJobs((list) => [job, ...list])
      run(job)
    },
    [run],
  )

  const retry = useCallback<ImportJobs['retry']>(
    (id) => {
      const job = jobsRef.current.find((j) => j.id === id)
      if (!job) return
      const again: ImportJob = { ...job, status: 'queued', startedAt: Date.now(), finishedAt: undefined, held: false }
      setJobs((list) => list.map((j) => (j.id === id ? again : j)))
      run(again)
    },
    [run],
  )

  const dismiss = useCallback<ImportJobs['dismiss']>((id) => patch(id, { dismissed: true }), [])

  const seed = useCallback<ImportJobs['seed']>((job) => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current.clear()
    const now = Date.now()
    const finished = job.status === 'done' || job.status === 'failed'
    setJobs([{ ...job, id: nextId.current++, startedAt: now, finishedAt: finished ? now : undefined, held: true }])
  }, [])

  const jobs = history.filter((j) => !j.dismissed)
  return { jobs, history, submit, retry, dismiss, seed }
}

/** Templates in file, Imported and Failed for a Completed job. */
export const resultOf = (job: ImportJob) => {
  const { imported, failed } = serverResult(job.templates)
  return { total: job.templates.length, imported: imported.length, failed }
}

/** The job's id on the Import Template page. */
export const importIdOf = (job: ImportJob) => `IMP-J${job.id}`
