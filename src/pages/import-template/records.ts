import { serverResult } from '@/data/import-spec'
import { transactionId, type ImportRecord, type ImportStatus } from '@/data/import-history'
import { USER } from '@/shell/AppShell'
import { importIdOf, type ImportJob, type JobStatus } from '../notifications/import-status/jobs'

const STATUS: Record<JobStatus, ImportStatus> = {
  queued: 'Queue',
  processing: 'Processing',
  done: 'Published',
  failed: 'Failed',
}

const iso = (ms: number) => new Date(ms).toISOString()

/** A job from the upload panel as an Import Template row. The prototype's
 *  stand-in checks (a template with no name fails, PROPOSAL) give its failed
 *  rows; the line numbers are the file's. */
export function recordOfJob(job: ImportJob): ImportRecord {
  const { imported } = serverResult(job.templates)
  const landed = new Set(imported)
  const done = job.status === 'done'
  const failed = done
    ? job.templates.flatMap((t, i) =>
        landed.has(t)
          ? []
          : [
              {
                line: i + 1,
                transactionId: transactionId(job.id * 1000 + i),
                status: 'DEAD',
                attempts: 1,
                error: "CNH Portal request failed with HTTP status 422 [Template] - 'templateName' is required",
              },
            ],
      )
    : []
  return {
    id: importIdOf(job),
    fileName: job.fileName,
    status: STATUS[job.status],
    createdBy: USER.shortName,
    createdAt: iso(job.startedAt),
    updatedAt: job.finishedAt ? iso(job.finishedAt) : null,
    total: job.status === 'queued' ? null : job.templates.length,
    imported: done ? imported.length : 0,
    failed,
    reportReady: done && !!job.reportReady,
  }
}
