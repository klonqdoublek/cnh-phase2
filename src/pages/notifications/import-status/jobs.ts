import { useCallback, useEffect, useRef, useState } from 'react'
import { IMPORT_PROCESS_FAIL_SENTINEL, PROCESS_MS, resultCsv, resultFileName, serverResult } from '@/data/import-spec'
import { downloadText } from '@/lib/download'
import type { Template } from '@/data/templates'

/* Background import jobs (BA / Dev, 28 Oct 2026). Import that passes the dialog's
 * checks sends the file to a server, and its templates reach the list about 10
 * minutes later: a job is that wait. `processing` until the server is done, then
 * `done` (Completed: the templates that pass the server's row checks land on the
 * list, the rest are counted as failed; 29 Oct 2026) or `failed` (Error; PROPOSAL,
 * pending BA: a failure on the server after the upload). App.tsx owns the jobs so they outlive
 * a visit to another page; the four directions only draw them. */

export type JobStatus = 'processing' | 'done' | 'failed'
export type ImportJob = {
  id: number
  fileName: string
  templates: Template[]
  replace: boolean
  status: JobStatus
  startedAt: number
  /** A preset route's job: it holds its status and runs no timer. */
  held?: boolean
}

export type ImportJobs = {
  jobs: ImportJob[]
  submit: (templates: Template[], fileName: string, replace: boolean) => void
  retry: (id: number) => void
  dismiss: (id: number) => void
  /** Replaces the jobs with one held job, for `#/list/import/<job preset>`. */
  seed: (job: Omit<ImportJob, 'id' | 'startedAt' | 'held'>) => void
}

/** `land` puts a finished job's templates on the list (App's import, unchanged). */
export function useImportJobs(land: (templates: Template[], fileName: string, replace: boolean) => void): ImportJobs {
  const [jobs, setJobs] = useState<ImportJob[]>([])
  const jobsRef = useRef(jobs)
  jobsRef.current = jobs
  const nextId = useRef(1)
  const timers = useRef(new Map<number, number>())
  const landRef = useRef(land)
  landRef.current = land

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const run = useCallback((job: ImportJob) => {
    const t = window.setTimeout(() => {
      timers.current.delete(job.id)
      const fails = job.fileName.toLowerCase().includes(IMPORT_PROCESS_FAIL_SENTINEL)
      if (!fails) landRef.current(serverResult(job.templates).imported, job.fileName, job.replace)
      setJobs((list) => list.map((j) => (j.id === job.id ? { ...j, status: fails ? 'failed' : 'done' } : j)))
    }, PROCESS_MS)
    timers.current.set(job.id, t)
  }, [])

  const submit = useCallback<ImportJobs['submit']>(
    (templates, fileName, replace) => {
      const job: ImportJob = { id: nextId.current++, fileName, templates, replace, status: 'processing', startedAt: Date.now() }
      setJobs((list) => [job, ...list])
      run(job)
    },
    [run],
  )

  const retry = useCallback<ImportJobs['retry']>(
    (id) => {
      const job = jobsRef.current.find((j) => j.id === id)
      if (!job) return
      const again: ImportJob = { ...job, status: 'processing', startedAt: Date.now(), held: false }
      setJobs((list) => list.map((j) => (j.id === id ? again : j)))
      run(again)
    },
    [run],
  )

  const dismiss = useCallback<ImportJobs['dismiss']>((id) => setJobs((list) => list.filter((j) => j.id !== id)), [])

  const seed = useCallback<ImportJobs['seed']>((job) => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current.clear()
    setJobs([{ ...job, id: nextId.current++, startedAt: Date.now(), held: true }])
  }, [])

  return { jobs, submit, retry, dismiss, seed }
}

/** Templates in file, Imported and Failed for a Completed job. */
export const resultOf = (job: ImportJob) => {
  const { imported, failed } = serverResult(job.templates)
  return { total: job.templates.length, imported: imported.length, failed }
}

/** Download result: the server's result file, a stand-in here (its columns are the backend's). */
export const downloadResult = (job: ImportJob) => downloadText(resultFileName(job.fileName), resultCsv(job.templates))

/** "14:05" — when the job was submitted. */
export const timeOf = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
