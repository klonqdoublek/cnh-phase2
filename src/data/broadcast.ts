/* Broadcast message — records, copy and the rules the list, drawer and Create
 * form share. Ported from the cnh-tm-phase2 build
 * (reference/cnh-tm-phase2/app-extract.js, `BROADCAST_COPY` … `STATUS_TONE`).
 * Copy and fixtures are transcribed, not composed. */

import type { Channel } from './templates'

export const BROADCAST_COPY = {
  listTitle: 'Broadcast message',
  create: 'Create broadcast',
  edit: 'Edit broadcast',
  createLede: 'Create a manual notification for a selected audience.',
  emptyTitle: 'No broadcasts created yet',
  emptyLine: 'Create a broadcast to send one message to many customers',
  dropTitle: 'Upload audience file',
  dropHint: 'Supported file types: CSV, XLSX · Maximum 10 MB · Up to 1,000 recipients',
  browse: 'Choose file',
  sample: 'Download sample file',
  noFile: 'Upload an audience file to continue',
  noValidRows: 'The file has no valid recipients. Fix the file and upload it again',
  fileSize: 'The file is larger than 10 MB',
  fileFormat: 'Invalid file format. Only .csv and .xlsx files can be uploaded',
  xlsxNotInPrototype: 'This prototype can only read .csv. Save the sheet as .csv and upload it again',
  fileEmpty: 'The file has no recipients',
  tooManyRows: (n: number) => `The file has ${n.toLocaleString('en-US')} recipients. The maximum is 1,000`,
  checking: 'Checking file…',
  validated: 'File validated',
  rowsSummary: (total: number, valid: number) =>
    `${total.toLocaleString('en-US')} ${total === 1 ? 'recipient' : 'recipients'} · ${valid.toLocaleString('en-US')} valid`,
  invalidCount: (n: number) => `${n} invalid`,
  invalidNote: 'Invalid recipients are skipped. Only valid recipients will receive the broadcast.',
  previewTitle: 'Preview (first 5 rows)',
  required: 'This field is required',
  noColumn: 'Select the column that identifies each recipient',
  noChannel: 'Please enable at least 1 notification channel',
  noDirectChannel: 'Select Email or SMS',
  msgMax: (n: number) => `Maximum ${n} characters allowed.`,
  pickField: 'Click in a message field first, then choose a field to insert',
  startPast: 'Start must be later than the current time',
  dndNoDay: 'Select at least 1 day',
  dndSame: 'The quiet period cannot start and end at the same time',
  submitTitle: 'Submit this broadcast?',
  submitFailTitle: 'Unable to submit the broadcast',
  createdTitle: 'Broadcast submitted',
  createdBody: (name: string) => `${name} will be sent outside the quiet period`,
  draftTitle: 'Draft saved',
  draftBody: (name: string) => `${name} is saved as a draft`,
  draftNeedsName: 'Enter a broadcast name to save a draft',
}

export const MAX_FILE_BYTES = 10485760
export const MAX_RECIPIENTS = 1000
const MOBILE = /^\+?\d{9,15}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ── audience file ─────────────────────────────────────────────────────── */

export type Audience = { headers: string[]; rows: string[][] }
export type AudienceResult = { ok: true; audience: Audience } | { ok: false; message: string }

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const s = text.replace(/^﻿/, '')
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (quoted) {
      if (ch === '"' && s[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

export function readAudience(name: string, text: string, size = text.length): AudienceResult {
  const lower = name.toLowerCase()
  if (!lower.endsWith('.csv') && !lower.endsWith('.xlsx')) return { ok: false, message: BROADCAST_COPY.fileFormat }
  if (size > MAX_FILE_BYTES) return { ok: false, message: BROADCAST_COPY.fileSize }
  if (lower.endsWith('.xlsx')) return { ok: false, message: BROADCAST_COPY.xlsxNotInPrototype }
  const all = parseCsv(text)
  const rows = all.slice(1)
  if (all.length === 0 || rows.length === 0) return { ok: false, message: BROADCAST_COPY.fileEmpty }
  if (rows.length > MAX_RECIPIENTS) return { ok: false, message: BROADCAST_COPY.tooManyRows(rows.length) }
  return { ok: true, audience: { headers: all[0].map((h) => h.trim()), rows } }
}

export async function readAudienceFile(file: File): Promise<AudienceResult> {
  return file.name.toLowerCase().endsWith('.csv')
    ? readAudience(file.name, await file.text(), file.size)
    : readAudience(file.name, '', file.size)
}

/* ── recipients ────────────────────────────────────────────────────────── */

export type RecipientType = 'cis' | 'direct'
export type IdKind = 'cis' | 'mobile' | 'email'

export const idKind = (type: RecipientType, channels: Channel[]): IdKind | null =>
  type === 'cis' ? 'cis' : channels.includes('SMS') ? 'mobile' : channels.includes('Email') ? 'email' : null

export const ID_LABEL: Record<IdKind, string> = { cis: 'CIS ID', mobile: 'Mobile number', email: 'Email address' }
const GUESS: Record<IdKind, RegExp> = { cis: /cis/i, mobile: /mobile|phone|tel/i, email: /e-?mail/i }
export const guessColumn = (headers: string[], kind: IdKind) => headers.find((h) => GUESS[kind].test(h)) ?? ''
const DUPLICATE: Record<IdKind, string> = {
  cis: 'Duplicate CIS ID',
  mobile: 'Duplicate mobile number',
  email: 'Duplicate email address',
}

export type RecipientRow = { line: number; id: string; errors: string[] }
export type RecipientCheck = { rows: RecipientRow[]; valid: number; invalid: number }

export function checkRecipients(audience: Audience, column: string, kind: IdKind): RecipientCheck {
  const index = audience.headers.indexOf(column)
  const label = ID_LABEL[kind]
  const seen = new Set<string>()
  const rows = audience.rows.map((row, i) => {
    const id = index >= 0 ? (row[index] ?? '').trim() : ''
    const key = kind === 'mobile' ? id.replace(/[\s-]/g, '') : kind === 'email' ? id.toLowerCase() : id
    const errors: string[] = []
    if (!key) errors.push(`${label} is required`)
    else if (kind === 'mobile' && !MOBILE.test(key)) errors.push('Invalid mobile number')
    else if (kind === 'email' && !EMAIL.test(key)) errors.push('Invalid email address')
    else if (seen.has(key)) errors.push(DUPLICATE[kind])
    if (key) seen.add(key)
    return { line: i + 2, id, errors }
  })
  const invalid = rows.filter((r) => r.errors.length).length
  return { rows, valid: rows.length - invalid, invalid }
}

/* ── message content ───────────────────────────────────────────────────── */

export const fieldsOf = (audience: Audience | null | undefined, idColumn: string) =>
  (audience?.headers ?? []).filter((h) => h && h !== idColumn).map((column) => ({ column, token: `{{${column}}}` }))

export const MESSAGE_MAX = 1000

export function smsInfo(text: string) {
  const unicode = /[^\x00-\x7F]/.test(text)
  const single = unicode ? 70 : 160
  const multi = unicode ? 67 : 153
  const length = [...text].length
  return { unicode, length, single, segments: length === 0 ? 0 : length <= single ? 1 : Math.ceil(length / multi) }
}

/* ── delivery and Do Not Disturb ───────────────────────────────────────── */

export const DAYS = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
]

export const TIMES = Array.from(
  { length: 48 },
  (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`,
)

export type Dnd = { enabled: boolean; days: number[]; from: string; to: string; timeZone: string }

export const DEFAULT_DND: Dnd = { enabled: true, days: [1, 2, 3, 4, 5], from: '20:00', to: '08:00', timeZone: 'Asia/Bangkok' }
export const TIME_ZONES = [{ value: 'Asia/Bangkok', label: 'Asia/Bangkok (GMT+7)' }]

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
const at = (base: Date, hhmm: string, addDays = 0) => {
  const d = new Date(base)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + addDays)
  d.setMinutes(minutes(hhmm))
  return d
}

/** When `t` falls in a quiet period, the moment that period ends; otherwise null. */
export function quietUntil(t: Date, dnd: Dnd): Date | null {
  if (!dnd.enabled || !dnd.days.length || dnd.from === dnd.to) return null
  const overnight = minutes(dnd.from) > minutes(dnd.to)
  for (const back of [1, 0]) {
    const day = at(t, '00:00', -back)
    if (!dnd.days.includes(day.getDay())) continue
    const from = at(day, dnd.from)
    const to = at(day, dnd.to, overnight ? 1 : 0)
    if (t >= from && t < to) return to
  }
  return null
}

/** The first moment a broadcast starting at `t` can actually send. */
export function firstSend(t: Date, dnd: Dnd): Date {
  let next = t
  for (let i = 0; i < 14; i++) {
    const end = quietUntil(next, dnd)
    if (!end) return next
    next = end
  }
  return next
}

export const fmtDateTime = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

export const fmtDays = (days: number[]) => {
  const ordered = DAYS.map((d) => d.day).filter((d) => days.includes(d))
  if (ordered.join() === '1,2,3,4,5') return 'Mon – Fri'
  if (ordered.length === 7) return 'Every day'
  return ordered.map((d) => DAYS.find((x) => x.day === d)!.label).join(', ')
}

export const fmtDnd = (dnd: Dnd) => (dnd.enabled ? `${fmtDays(dnd.days)}, ${dnd.from}–${dnd.to} (${dnd.timeZone})` : 'Off')

/* ── records ───────────────────────────────────────────────────────────── */

export type BroadcastContent = {
  smsMessage: string
  emailSubject: string
  emailBody: string
  pushTitle: string
  pushBody: string
}

export type BroadcastStatus = 'Draft' | 'Scheduled' | 'Sending' | 'Paused' | 'Completed'

export type Broadcast = {
  id: string
  name: string
  description: string
  channels: Channel[]
  audienceFile: string
  /** Only a Draft carries its file's text, so Edit can reopen it. */
  audienceText?: string
  recipients: number
  recipientType: RecipientType
  recipientColumn: string
  startMode: 'now' | 'schedule'
  /** `YYYY-MM-DDTHH:mm`, local time. */
  start: string
  dnd: Dnd
  status: BroadcastStatus
  success: number
  failed: number
  content: BroadcastContent
  createdBy: string
  createdAt: string
}

const content = (message: string, subject = '', body = message): BroadcastContent => ({
  smsMessage: message,
  emailSubject: subject,
  emailBody: body,
  pushTitle: subject,
  pushBody: message,
})

const cis = { recipientType: 'cis' as const, recipientColumn: 'CIS_ID' }

const FIRST = ['Somchai', 'Araya', 'Nattapong', 'Siriporn', 'Thanapol', 'Kanya', 'Piti', 'Mana']
const LAST = ['Yimdee', 'Chaisri', 'Wongsa', 'Klaykeaw', 'Suksai', 'Thongdee', 'Chaiyo', 'Deejai']

const cisFile = (n: number) =>
  'CIS_ID,CUSTOMER_NAME,ACCOUNT_NO,AMOUNT,PROMOTION_CODE\n' +
  Array.from(
    { length: n },
    (_, i) =>
      `${200001 + i},${FIRST[i % 8]} ${LAST[(i * 3) % 8]},${String(1e9 + i * 7919).slice(0, 10)},${(250 + ((i * 37) % 2000)).toFixed(2)},NOV26`,
  ).join('\n') +
  '\n'

export const BROADCASTS: Broadcast[] = [
  {
    id: 'BC-0007',
    name: 'November statement notice',
    description: 'Draft for the November statement campaign.',
    channels: ['Email'],
    audienceFile: 'statement-november.csv',
    audienceText: cisFile(640),
    recipients: 640,
    ...cis,
    startMode: 'schedule',
    start: '2026-11-02T09:00',
    dnd: DEFAULT_DND,
    status: 'Draft',
    success: 0,
    failed: 0,
    content: content('', 'Your November statement', ''),
    createdBy: 'Panisa R.',
    createdAt: '2026-10-06T09:40',
  },
  {
    id: 'BC-0006',
    name: 'October Customer Campaign',
    description: 'Send payment confirmation and special offer to selected customers in October.',
    channels: ['Email', 'SMS', 'Push notification'],
    audienceFile: 'customer_list_october.csv',
    recipients: 1000,
    ...cis,
    startMode: 'schedule',
    start: '2026-10-12T09:00',
    dnd: DEFAULT_DND,
    status: 'Scheduled',
    success: 0,
    failed: 0,
    content: content(
      'Dear {{CUSTOMER_NAME}}, your payment of THB {{AMOUNT}} was successful.',
      'Special offer for {{CUSTOMER_NAME}}',
    ),
    createdBy: 'Panisa R.',
    createdAt: '2026-10-05T10:12',
  },
  {
    id: 'BC-0005',
    name: 'Interest rate update',
    description: '',
    channels: ['SMS'],
    audienceFile: 'savings-mobile.csv',
    recipients: 1000,
    recipientType: 'direct',
    recipientColumn: 'MOBILE_NO',
    startMode: 'now',
    start: '2026-10-05T10:00',
    dnd: DEFAULT_DND,
    status: 'Sending',
    success: 612,
    failed: 9,
    content: content(
      'Dear Customer, effective 1 November 2026, our savings account interest rate will be updated. Thank you.',
    ),
    createdBy: 'Panisa R.',
    createdAt: '2026-10-05T10:00',
  },
  {
    id: 'BC-0004',
    name: 'Branch closure notice',
    description: 'Branch BKK-12, closed 10 October.',
    channels: ['Push notification', 'SMS'],
    audienceFile: 'branch-bkk-12.csv',
    recipients: 860,
    ...cis,
    startMode: 'schedule',
    start: '2026-10-03T19:00',
    dnd: DEFAULT_DND,
    status: 'Paused',
    success: 402,
    failed: 3,
    content: content('Dear Customer, our branch will be closed on 10 October 2026.', 'Branch closure'),
    createdBy: 'Somchai J.',
    createdAt: '2026-10-02T11:05',
  },
  {
    id: 'BC-0003',
    name: 'App maintenance',
    description: '',
    channels: ['Push notification'],
    audienceFile: 'mbanking-active.csv',
    recipients: 998,
    ...cis,
    startMode: 'now',
    start: '2026-09-29T08:15',
    dnd: { ...DEFAULT_DND, enabled: false },
    status: 'Completed',
    success: 991,
    failed: 7,
    content: content('Bualuang mBanking will be unavailable on 30 Sep 2026, 00:00–04:00.', 'Scheduled maintenance'),
    createdBy: 'Panisa R.',
    createdAt: '2026-09-29T08:15',
  },
  {
    id: 'BC-0002',
    name: 'Credit card statement reminder',
    description: '',
    channels: ['Email'],
    audienceFile: 'cc-statement.csv',
    recipients: 1000,
    recipientType: 'direct',
    recipientColumn: 'EMAIL',
    startMode: 'schedule',
    start: '2026-09-21T07:00',
    dnd: DEFAULT_DND,
    status: 'Completed',
    success: 988,
    failed: 12,
    content: content('', 'Your statement is ready', 'Your credit card statement is ready.'),
    createdBy: 'Naree R.',
    createdAt: '2026-09-19T14:30',
  },
]

export const STATUS_TONE: Record<BroadcastStatus, 'caution' | 'disabled' | 'accent' | 'positive'> = {
  Draft: 'caution',
  Scheduled: 'disabled',
  Sending: 'accent',
  Paused: 'caution',
  Completed: 'positive',
}

export const EMPTY = '–'
export const fmtNumber = (n: number) => n.toLocaleString('en-US')

/** The toast the list shows after Create returns — held open on its preset route. */
export type ListToast = { name: string; draft: boolean }
