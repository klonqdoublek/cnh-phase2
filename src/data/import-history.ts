/* Import Template — one row per imported file (BA & Dev feedback deck Post MMP 2,
 * slides 8–9, 30 Oct 2026). The original build has no such page, so the copy
 * below is composed, except the column names (slide 8) and the report's columns
 * and example rows (slide 9). Statuses are Broadcast's (slide 8: "Status –
 * เหมือน Broadcast Message"). Counts, notes and the report-generating state are
 * a PROPOSAL, pending BA. */

import type { BroadcastStatus } from './broadcast'
import { fmtDateTime } from './broadcast'

/** Broadcast's statuses that an import goes through: no Draft, no Cancelled. */
export type ImportStatus = Extract<BroadcastStatus, 'Queue' | 'Processing' | 'Published' | 'Failed'>
export const IMPORT_STATUSES = ['Queue', 'Processing', 'Published', 'Failed'] as const satisfies readonly ImportStatus[]

/** One row of the report: a template the server could not import (slide 9). */
export type FailedRow = {
  line: number
  transactionId: string
  status: string
  attempts: number
  error: string
}

export type ImportRecord = {
  id: string
  fileName: string
  status: ImportStatus
  createdBy: string
  /** When the file was imported. */
  createdAt: string
  /** The latest time the system imported a row; none while Queue. */
  updatedAt: string | null
  /** Templates in file; unknown (null) until the server has read the file. */
  total: number | null
  imported: number
  failed: FailedRow[]
  /** Published, and the report generated (it starts when the status turns Published). */
  reportReady: boolean
}

export const IMPORT_TEMPLATE_COPY = {
  /* The sidebar item, the Import menu's row and this title read alike (requester, 2 Nov 2026; the deck's name was Import Template). */
  title: 'View import status',
  /* The breadcrumb's parent in the Import menu option: the side nav's label (3 Nov 2026). */
  crumbParent: 'Notification management',
  search: 'Search by import file name',
  /* Was "Status" (Broadcast's) until the design critique of 3 Nov 2026: a bare "Queue" did not
     say what is queued. The column, the Status filter and the drawer name it (composed). */
  status: 'Import status',
  emptyTitle: 'No files imported yet',
  /* Was "Import a template file from Notification management to see it here" until the page had its own Import (1 Nov 2026, composed). */
  emptyLine: 'Import a template file to see its result here',
  importAction: 'Import',
  noResults: 'No results found',
  loadFail: 'Unable to get information',
  resultTitle: 'Import result',
  detailsTitle: 'Import details',
  total: 'Templates in file',
  imported: 'Imported',
  failed: 'Failed',
  reportTitle: 'Download the import report?',
  reportGenerating: 'The report is being generated. Download report is available once it is ready.',
  /* One line per status, under the result (as Broadcast's Delivery result note). */
  note: {
    Queue: 'Waiting for the system to start. Nothing is imported yet.',
    Processing: 'Importing the templates row by row. Imported templates are on Notification management as draft.',
    Published: (failed: number) =>
      failed
        ? 'The import is finished. The templates that could not be imported are in the report.'
        : 'The import is finished. Every template in the file was imported as draft.',
    Failed: 'A system error stopped the import. Import the file again from Notification management.',
  },
}

/* Slide 9's two rows: the report's error text is the backend's. */
const SERVICE_NOT_FOUND = "CNH Portal request failed with HTTP status 422 [Service] - 'serviceCode' with value 'XX' not found"
const NAME_REQUIRED = "CNH Portal request failed with HTTP status 422 [Template] - 'templateName' is required"

/** A transaction id that looks like the backend's, stable for one seed. */
export function transactionId(seed: number) {
  let x = (seed * 2654435761) >>> 0
  const hex = () => {
    x = (x * 1103515245 + 12345) >>> 0
    return (x >>> 8).toString(16).padStart(6, '0').slice(0, 4)
  }
  return `${hex()}${hex()}-${hex()}-4${hex().slice(1)}-${hex()}-${hex()}${hex()}${hex()}`
}

const rows = (lines: number[], error = SERVICE_NOT_FOUND): FailedRow[] =>
  lines.map((line) => ({ line, transactionId: transactionId(line * 31), status: 'DEAD', attempts: 1, error }))

/** Seeded imports, newest first, across every status. */
export const IMPORT_RECORDS: ImportRecord[] = [
  {
    id: 'IMP-0012',
    fileName: 'promotion-nov.jsonl',
    status: 'Queue',
    createdBy: 'Panisa R.',
    createdAt: '2026-10-30T14:20:00',
    updatedAt: null,
    total: null,
    imported: 0,
    failed: [],
    reportReady: false,
  },
  {
    id: 'IMP-0011',
    fileName: 'card-alerts.jsonl',
    status: 'Processing',
    createdBy: 'Panisa R.',
    createdAt: '2026-10-30T14:05:00',
    updatedAt: '2026-10-30T14:09:00',
    total: 40,
    imported: 18,
    failed: rows([7]),
    reportReady: false,
  },
  {
    id: 'IMP-0010',
    fileName: 'statements.jsonl',
    status: 'Published',
    createdBy: 'Panisa R.',
    createdAt: '2026-10-30T13:30:00',
    updatedAt: '2026-10-30T13:41:00',
    total: 24,
    imported: 22,
    failed: rows([8, 21]),
    reportReady: false,
  },
  {
    id: 'IMP-0009',
    fileName: 'loan-reminders.jsonl',
    status: 'Published',
    createdBy: 'Naree R.',
    createdAt: '2026-10-29T16:12:00',
    updatedAt: '2026-10-29T16:23:00',
    total: 30,
    imported: 27,
    failed: [...rows([8, 21]), ...rows([14], NAME_REQUIRED)],
    reportReady: true,
  },
  {
    id: 'IMP-0008',
    fileName: 'security-alerts.jsonl',
    status: 'Failed',
    createdBy: 'Panisa R.',
    createdAt: '2026-10-29T10:02:00',
    updatedAt: '2026-10-29T10:05:00',
    total: 12,
    imported: 0,
    failed: [],
    reportReady: false,
  },
  {
    id: 'IMP-0007',
    fileName: 'deposit-maturity.jsonl',
    status: 'Published',
    createdBy: 'Naree R.',
    createdAt: '2026-10-28T15:47:00',
    updatedAt: '2026-10-28T15:58:00',
    total: 8,
    imported: 8,
    failed: [],
    reportReady: true,
  },
  {
    id: 'IMP-0006',
    fileName: 'transfer-success.jsonl',
    status: 'Published',
    createdBy: 'Panisa R.',
    createdAt: '2026-10-27T11:20:00',
    updatedAt: '2026-10-27T11:30:00',
    total: 15,
    imported: 14,
    failed: rows([3]),
    reportReady: true,
  },
  {
    id: 'IMP-0005',
    fileName: 'device-registered.jsonl',
    status: 'Published',
    createdBy: 'Panisa R.',
    createdAt: '2026-10-24T09:15:00',
    updatedAt: '2026-10-24T09:26:00',
    total: 6,
    imported: 6,
    failed: [],
    reportReady: true,
  },
]

export const fmtImportTime = (iso: string | null) => (iso ? fmtDateTime(new Date(iso)) : '')

/** The report: the failed rows only, for the user to fix and import again (slide 9). */
export function importReportCsv(r: ImportRecord): string {
  const quote = (v: string | number) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))
  return [
    ['LineNumber', 'CNHTransactionID', 'Status', 'AttemptCount', 'LastError'],
    ...r.failed.map((f) => [f.line, f.transactionId, f.status, f.attempts, f.error]),
  ]
    .map((row) => row.map(quote).join(','))
    .join('\n')
}

export const importReportName = (r: ImportRecord) => `${r.fileName.replace(/\.[^.]+$/, '')}-import-report.csv`

/** Download report is offered on a Published import once its report is generated. */
export const reportOffered = (r: ImportRecord) => r.status === 'Published'
