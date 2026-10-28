/* Broadcast message — records, copy and the rules the list, drawer and Create
 * form share. Ported from the cnh-tm-phase2 build
 * (.reference/cnh-tm-phase2/app-extract.js, `BROADCAST_COPY` … `STATUS_TONE`).
 * Copy and fixtures are transcribed, not composed. */

import type { Channel } from './templates'

export const BROADCAST_COPY = {
  listTitle: 'Broadcast message',
  create: 'Create broadcast',
  edit: 'Edit broadcast',
  createLede: 'Create a manual notification for a selected audience.',
  emptyTitle: 'No broadcasts created yet',
  emptyLine: 'Create a broadcast to send one message to many customers',
  /* Composed (docs/broadcast-gaps.md): the list's search and its no-results
     line, after the Notification management list. */
  search: 'Search by broadcast name or description',
  noResults: 'No results found',
  /* The list's load fail: Notification management's copy, reused (20 Oct 2026). */
  loadFail: 'Unable to get information',
  dropTitle: 'Upload audience file',
  /* Was `Supported file types: CSV, XLSX · Maximum 10 MB · Up to 1,000
     recipients` (original build); reworded without the `·` joins, 28 Oct 2026. */
  dropHint: 'CSV or XLSX, up to 10 MB and 1,000 recipients',
  browse: 'Choose file',
  sample: 'Download sample file',
  noFile: 'Upload an audience file to continue',
  noValidRows: 'The file has no valid recipients. Fix the file and upload it again',
  fileSize: 'The file is larger than 10 MB',
  fileFormat: 'Invalid file format. Only .csv and .xlsx files can be uploaded',
  xlsxNotInPrototype: 'This prototype can only read .csv. Save the sheet as .csv and upload it again',
  fileEmpty: 'The file has no recipients',
  tooManyRows: 'The file has more than 1,000 recipients',
  checking: 'Checking file…',
  /* Composed (docs/broadcast-gaps.md): the original build has no dialog for a
     file that fails the full read on Submit. */
  fileBlockedTitle: 'The audience file cannot be used',
  invalidNote: 'Invalid recipients are skipped. Only valid recipients will receive the broadcast.',
  previewTitle: 'Preview (first 5 rows)',
  required: 'This field is required',
  noColumn: 'Select the column that identifies each recipient',
  /** PROPOSAL, composed (not in the original build), pending BA (Q15). */
  wrongColumn: (column: string, holds: 'mobile' | 'email', wanted: 'mobile' | 'email') => {
    const plural = { mobile: 'mobile numbers', email: 'email addresses' }
    return `${column} contains ${plural[holds]}. Select the column that contains ${plural[wanted]}`
  },
  noChannel: 'Please enable at least 1 notification channel',
  msgMax: (n: number) => `Maximum ${n} characters allowed.`,
  pickField: 'Click in a message field first, then choose a field to insert',
  startPast: 'Start must be later than the current time',
  endBeforeStart: 'End must be later than the start',
  dndNoDay: 'Select at least 1 day',
  dndSame: 'The quiet period cannot start and end at the same time',
  submitTitle: 'Submit this broadcast?',
  submitFailTitle: 'Unable to submit the broadcast',
  createdTitle: 'Broadcast submitted',
  createdBody: (name: string) => `${name} will be sent outside the quiet period`,
  draftTitle: 'Draft saved',
  draftBody: (name: string) => `${name} is saved as a draft`,
  draftNeedsName: 'Enter a broadcast name to save a draft',
  /* Cancel a draft (19 Oct 2026). Composed: the original build has no cancel. */
  cancel: 'Cancel broadcast',
  cancelTitle: 'Cancel this broadcast?',
  cancelBody: (name: string) => `${name} will not be sent, and it cannot be edited again.`,
  cancelKeep: 'Keep draft',
  cancelledTitle: 'Broadcast cancelled',
  cancelledBody: (name: string) => `${name} is cancelled`,
  /* Download report from a list row or the drawer (22 Oct 2026), through
     Notification management's confirm and toast. Composed after its copy. */
  reportTitle: 'Download the delivery report?',
  reportBody: 'The report will be saved as a CSV file',
  reportConfirm: 'Download',
  reportDoneTitle: 'Download Success',
  reportDoneBody: (file: string) => `${file} is saved`,
  /* "Be able to download?" No (requester 22 Oct 2026): Notification
     management's failure toast, Figma 1:14740. */
  reportFailTitle: 'Unable to download',
  reportFailBody: 'Please try again',
  /* The status could not be updated: Submit's fail dialog, reworded. */
  cancelFailTitle: 'Unable to cancel the broadcast',
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

/** On pick. Only the file type and size are validated (BA, 19 Oct 2026): the
 *  browser can show a preview but cannot read the whole file, so row counts and
 *  row checks wait for Submit (`checkAudience`). The prototype parses every row
 *  here only because it has no server to read the file later. */
export function readAudience(name: string, text: string, size = text.length): AudienceResult {
  const lower = name.toLowerCase()
  if (!lower.endsWith('.csv') && !lower.endsWith('.xlsx')) return { ok: false, message: BROADCAST_COPY.fileFormat }
  if (size > MAX_FILE_BYTES) return { ok: false, message: BROADCAST_COPY.fileSize }
  if (lower.endsWith('.xlsx')) return { ok: false, message: BROADCAST_COPY.xlsxNotInPrototype }
  const all = parseCsv(text)
  return { ok: true, audience: { headers: (all[0] ?? []).map((h) => h.trim()), rows: all.slice(1) } }
}

export async function readAudienceFile(file: File): Promise<AudienceResult> {
  return file.name.toLowerCase().endsWith('.csv')
    ? readAudience(file.name, await file.text(), file.size)
    : readAudience(file.name, '', file.size)
}

/* ── recipients ────────────────────────────────────────────────────────── */

/** Three recipient types (BA / Dev sync, 28 Oct 2026): CIS ID, Email or SMS.
 *  Before, CIS or Direct recipient, where Direct then picked Email or SMS on
 *  the channel cards; the second pick confused users. */
export type RecipientType = 'cis' | 'email' | 'sms'
export type IdKind = 'cis' | 'mobile' | 'email'

export const RECIPIENT_TYPE_LABEL: Record<RecipientType, string> = { cis: 'CIS ID', email: 'Email', sms: 'SMS' }

/** The one channel an Email or SMS broadcast sends by; CIS ID picks its own. */
export const TYPE_CHANNEL: Record<Exclude<RecipientType, 'cis'>, Channel> = { email: 'Email', sms: 'SMS' }

export const idKind = (type: RecipientType): IdKind => (type === 'sms' ? 'mobile' : type)

export const ID_LABEL: Record<IdKind, string> = { cis: 'CIS ID', mobile: 'Mobile number', email: 'Email address' }
const DUPLICATE: Record<IdKind, string> = {
  cis: 'Duplicate CIS ID',
  mobile: 'Duplicate mobile number',
  email: 'Duplicate email address',
}

/** What a column holds: mobile numbers or email addresses when more than half of
 * its filled values are, so a few bad rows do not hide it; null otherwise (a CIS
 * ID has no fixed format yet). PROPOSAL, pending BA (Q15). */
export function columnHolds(audience: Audience, column: string): 'mobile' | 'email' | null {
  const index = audience.headers.indexOf(column)
  const values = audience.rows.map((row) => (row[index] ?? '').trim()).filter(Boolean)
  if (index < 0 || !values.length) return null
  const most = (test: (v: string) => boolean) => values.filter(test).length > values.length / 2
  if (most((v) => EMAIL.test(v.toLowerCase()))) return 'email'
  if (most((v) => MOBILE.test(v.replace(/[\s-]/g, '')))) return 'mobile'
  return null
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

export type AudienceCheck = { ok: true; check: RecipientCheck } | { ok: false; message: string }

/** On Submit: the whole file is read. No rows, more than 1,000 or no valid
 *  recipient blocks the broadcast; invalid rows are otherwise skipped. */
export function checkAudience(audience: Audience, column: string, kind: IdKind): AudienceCheck {
  const total = audience.rows.length
  if (total === 0) return { ok: false, message: BROADCAST_COPY.fileEmpty }
  if (total > MAX_RECIPIENTS) return { ok: false, message: BROADCAST_COPY.tooManyRows }
  const check = checkRecipients(audience, column, kind)
  if (check.valid === 0) return { ok: false, message: BROADCAST_COPY.noValidRows }
  return { ok: true, check }
}

/* ── message content ───────────────────────────────────────────────────── */

export const fieldsOf = (audience: Audience | null | undefined, idColumn: string) =>
  (audience?.headers ?? []).filter((h) => h && h !== idColumn).map((column) => ({ column, token: `{{${column}}}` }))

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

/** One quiet period: the days it starts on and its hours, or the whole day.
 *  `to` before `from` runs overnight into the next day. */
export type DndRule = { id: string; days: number[]; allDay: boolean; from: string; to: string }
/** Do Not Disturb holds any number of quiet periods (BA, 2026-10-14 — e.g.
 *  Mon – Fri 18:00–08:00 and Sat, Sun all day); the original build had one. */
export type Dnd = { enabled: boolean; rules: DndRule[]; timeZone: string }

export const dndRule = (part: Partial<DndRule> = {}): DndRule => ({
  id: `dnd-${Math.random().toString(36).slice(2, 8)}`,
  days: [],
  allDay: false,
  from: '20:00',
  to: '08:00',
  ...part,
})

export const DEFAULT_DND: Dnd = {
  enabled: true,
  rules: [{ id: 'dnd-weekdays', days: [1, 2, 3, 4, 5], allDay: false, from: '20:00', to: '08:00' }],
  timeZone: 'Asia/Bangkok',
}
/** The BA's own example (2026-10-14): weeknights, and the whole weekend. */
export const BA_DND: Dnd = {
  enabled: true,
  rules: [
    { id: 'dnd-weeknights', days: [1, 2, 3, 4, 5], allDay: false, from: '18:00', to: '08:00' },
    { id: 'dnd-weekend', days: [6, 0], allDay: true, from: '00:00', to: '00:00' },
  ],
  timeZone: 'Asia/Bangkok',
}
/** `offset` follows the quiet period's time label (design critique, 27 Oct
 *  2026), in place of a Time zone row under the periods. */
export const TIME_ZONES = [{ value: 'Asia/Bangkok', label: 'Asia/Bangkok (GMT+7)', offset: 'GMT+7' }]

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

/** When `t` falls in one rule's quiet period, the moment that period ends. */
function ruleUntil(t: Date, rule: DndRule): Date | null {
  if (!rule.days.length || (!rule.allDay && rule.from === rule.to)) return null
  const overnight = !rule.allDay && minutes(rule.from) > minutes(rule.to)
  for (const back of [1, 0]) {
    const day = at(t, '00:00', -back)
    if (!rule.days.includes(day.getDay())) continue
    const from = rule.allDay ? day : at(day, rule.from)
    const to = rule.allDay ? at(day, '00:00', 1) : at(day, rule.to, overnight ? 1 : 0)
    if (t >= from && t < to) return to
  }
  return null
}

/** When `t` falls in a quiet period, the moment that period ends; otherwise
 *  null. Where rules overlap, the latest end wins. */
export function quietUntil(t: Date, dnd: Dnd): Date | null {
  if (!dnd.enabled) return null
  let end: Date | null = null
  for (const rule of dnd.rules) {
    const until = ruleUntil(t, rule)
    if (until && (!end || until > end)) end = until
  }
  return end
}

/** The first moment a broadcast starting at `t` can actually send — rules
 *  that run into each other (Fri night, then all of Sat and Sun) chain. */
export function firstSend(t: Date, dnd: Dnd): Date {
  let next = t
  for (let i = 0; i < 64; i++) {
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

/** The period ends on the day after it starts (BA, 2026-10-19): its end is
 *  before its start. Never for All day, a same-day period, or From = To. */
export const endsNextDay = (rule: DndRule) => !rule.allDay && minutes(rule.to) < minutes(rule.from)

/** "Mon – Fri, 18:00–08:00 (Next day)", "Mon, 12:00–15:00" or "Sat, Sun, All day". */
export const fmtDndRule = (rule: DndRule) =>
  `${fmtDays(rule.days)}, ${rule.allDay ? 'All day' : `${rule.from}–${rule.to}${endsNextDay(rule) ? ' (Next day)' : ''}`}`

/** Each rule on a line of its own, the time zone once at the end. */
export const fmtDnd = (dnd: Dnd) =>
  dnd.enabled ? `${dnd.rules.map(fmtDndRule).join('\n')} (${dnd.timeZone})` : 'Off'

/* ── records ───────────────────────────────────────────────────────────── */

export type BroadcastContent = {
  smsMessage: string
  emailSubject: string
  emailBody: string
  pushTitle: string
  pushBody: string
}

/** The status list of values (16 Oct 2026; meanings 19 Oct 2026):
 *  DRAFT — saved as a draft · QUEUE — submitted, accepted by the system ·
 *  PROCESSING — the system has picked the broadcast up and is validating it,
 *  nothing sent yet · PUBLISHED — validated; it sends, pauses in a quiet
 *  period and finishes under Published (BA / Dev sync, 28 Oct 2026; was
 *  "started sending" and "finished"; the lifecycle is pending BA confirmation) ·
 *  FAILED — a system error · CANCELLED — a draft cancelled before submit.
 *  Only a Draft can be cancelled; once submitted it cannot. */
export const BROADCAST_STATUSES = ['Draft', 'Queue', 'Processing', 'Published', 'Failed', 'Cancelled'] as const
export type BroadcastStatus = (typeof BROADCAST_STATUSES)[number]

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
  /** Broadcast End (optional, BA 2026-10-14): sending stops here, and whoever
   *  is still waiting is counted as Not sent. `YYYY-MM-DDTHH:mm`. */
  end?: string
  dnd: Dnd
  status: BroadcastStatus
  success: number
  failed: number
  /** Recipients still unsent when the end was reached, or when a system
   *  error stopped the broadcast (Failed). */
  notSent?: number
  /** Published and still sending, but inside a quiet period (was the Paused
   *  status, then Processing until 28 Oct 2026). */
  quiet?: boolean
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

const directFile = (n: number) =>
  'MOBILE_NO,CUSTOMER_NAME,AMOUNT\n' +
  Array.from(
    { length: n },
    (_, i) => `08${String(10000000 + (i + 1) * 7919).slice(-8)},${FIRST[i % 8]} ${LAST[(i * 3) % 8]},${(250 + ((i * 37) % 2000)).toFixed(2)}`,
  ).join('\n') +
  '\n'

export const BROADCASTS: Broadcast[] = [
  /* Composed (28 Oct 2026) so every status has an Email or SMS example as
     well as a CIS ID one: this Draft, BC-0011 Queue and BC-0010 Cancelled. */
  {
    id: 'BC-0012',
    name: 'Card delivery notice',
    description: 'Tell customers their new debit card is on its way.',
    channels: ['SMS'],
    audienceFile: 'card-delivery-mobile.csv',
    audienceText: directFile(420),
    recipients: 420,
    recipientType: 'sms',
    recipientColumn: 'MOBILE_NO',
    startMode: 'schedule',
    start: '2026-11-04T10:00',
    dnd: DEFAULT_DND,
    status: 'Draft',
    success: 0,
    failed: 0,
    content: content('Dear {{CUSTOMER_NAME}}, your new debit card will be delivered within 7 days.'),
    createdBy: 'Naree R.',
    createdAt: '2026-10-09T11:20',
  },
  {
    id: 'BC-0011',
    name: 'Fixed deposit maturity reminder',
    description: '',
    channels: ['Email'],
    audienceFile: 'fixed-deposit-email.csv',
    recipients: 350,
    recipientType: 'email',
    recipientColumn: 'EMAIL',
    startMode: 'schedule',
    start: '2026-10-15T08:00',
    end: '2026-10-17T18:00',
    dnd: DEFAULT_DND,
    status: 'Queue',
    success: 0,
    failed: 0,
    content: content('', 'Your fixed deposit is maturing', 'Dear Customer, your fixed deposit will mature on 20 October 2026.'),
    createdBy: 'Somchai J.',
    createdAt: '2026-10-09T09:05',
  },
  {
    id: 'BC-0010',
    name: 'Mobile number update request',
    description: '',
    channels: ['SMS'],
    audienceFile: 'mobile-update.csv',
    recipients: 150,
    recipientType: 'sms',
    recipientColumn: 'MOBILE_NO',
    startMode: 'schedule',
    start: '2026-10-20T09:00',
    dnd: DEFAULT_DND,
    status: 'Cancelled',
    success: 0,
    failed: 0,
    content: content('Dear Customer, please update your mobile number at any Bangkok Bank branch.'),
    createdBy: 'Panisa R.',
    createdAt: '2026-10-08T16:30',
  },
  /* Composed (19 Oct 2026) so the list and drawer show a Failed broadcast: a
     system error stopped it while it was sending, so whoever was still waiting
     is Not sent. */
  {
    id: 'BC-0009',
    name: 'Loan payment reminder',
    description: '',
    channels: ['Email'],
    audienceFile: 'loan-due-october.csv',
    recipients: 500,
    recipientType: 'email',
    recipientColumn: 'EMAIL',
    startMode: 'now',
    start: '2026-10-07T14:00',
    dnd: DEFAULT_DND,
    status: 'Failed',
    success: 120,
    failed: 2,
    notSent: 378,
    content: content('', 'Your loan payment is due', 'Dear Customer, your loan payment is due on 15 October 2026.'),
    createdBy: 'Naree R.',
    createdAt: '2026-10-07T13:52',
  },
  /* Composed (19 Oct 2026): a draft cancelled before it was submitted. */
  {
    id: 'BC-0008',
    name: 'Year-end promotion',
    description: '',
    channels: ['SMS'],
    audienceFile: 'promotion-december.csv',
    recipients: 800,
    ...cis,
    startMode: 'schedule',
    start: '2026-12-01T09:00',
    dnd: DEFAULT_DND,
    status: 'Cancelled',
    success: 0,
    failed: 0,
    content: content('Dear {{CUSTOMER_NAME}}, use code {{PROMOTION_CODE}} for our year-end promotion.'),
    createdBy: 'Panisa R.',
    createdAt: '2026-10-08T15:20',
  },
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
    end: '2026-10-16T18:00',
    dnd: BA_DND,
    status: 'Queue',
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
    recipientType: 'sms',
    recipientColumn: 'MOBILE_NO',
    startMode: 'now',
    start: '2026-10-05T10:00',
    dnd: DEFAULT_DND,
    /* Validating (28 Oct 2026): nothing attempted yet, so no report. */
    status: 'Processing',
    success: 0,
    failed: 0,
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
    status: 'Published',
    quiet: true,
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
    status: 'Published',
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
    recipientType: 'email',
    recipientColumn: 'EMAIL',
    startMode: 'schedule',
    start: '2026-09-21T07:00',
    dnd: DEFAULT_DND,
    status: 'Published',
    success: 988,
    failed: 12,
    content: content('', 'Your statement is ready', 'Your credit card statement is ready.'),
    createdBy: 'Naree R.',
    createdAt: '2026-09-19T14:30',
  },
  /* The deck's scenario F (composed, 2026-10-14): the end came before every
     recipient was sent, so 174 are Not sent and the broadcast is Published. */
  {
    id: 'BC-0001',
    name: 'Savings interest rate update',
    description: 'Tell savings customers about the new interest rate.',
    channels: ['SMS'],
    audienceFile: 'savings-customers.csv',
    recipients: 1000,
    ...cis,
    startMode: 'schedule',
    start: '2026-09-15T10:00',
    end: '2026-09-15T12:00',
    dnd: DEFAULT_DND,
    status: 'Published',
    success: 820,
    failed: 6,
    notSent: 174,
    content: content('Dear Customer, effective 1 October 2026, our savings account interest rate will be updated. Thank you.'),
    createdBy: 'Panisa R.',
    createdAt: '2026-09-12T09:30',
  },
]

export const STATUS_TONE: Record<BroadcastStatus, 'caution' | 'disabled' | 'accent' | 'positive' | 'negative'> = {
  Draft: 'caution',
  Queue: 'disabled',
  Processing: 'accent',
  Published: 'positive',
  Failed: 'negative',
  Cancelled: 'disabled',
}

/** What the badge and the Status filter read. FAILED reads "Error" (UX
 *  writer, 28 Oct 2026; "System error" since the 27 Oct critique): the
 *  drawer's Delivery result also counts "Failed" recipients, and the two read
 *  as the same thing. The value stays FAILED. PROPOSAL, pending BA. */
export const STATUS_LABEL: Record<BroadcastStatus, string> = {
  Draft: 'Draft',
  Queue: 'Queue',
  Processing: 'Processing',
  Published: 'Published',
  Failed: 'Error',
  Cancelled: 'Cancelled',
}

/** Recipients not yet attempted: not sent, not failed, not cut off by the end. */
export const waitingOf = (b: Broadcast) => Math.max(0, b.recipients - b.success - b.failed - (b.notSent ?? 0))

export const EMPTY = '–'
export const fmtNumber = (n: number) => n.toLocaleString('en-US')

/** The toast the list shows after Create returns, or after a draft is
 *  cancelled — held open on its preset route. */
export type ListToast = { name: string; draft: boolean; cancelled?: boolean }

/* ── delivery report ───────────────────────────────────────────────────── */

/* The drawer's Download report (BA, 2026-10-14). A broadcast here carries
 * counts, not per-recipient attempts, so the rows are made up from the counts:
 * one row per recipient, Success then Failed then Waiting to send, keyed by the
 * file's ID column. The totals always equal the drawer's. Copy is composed —
 * the original build has no report (docs/broadcast-gaps.md). */

const FAIL_REASONS: Record<Channel, string[]> = {
  SMS: ['Invalid mobile number', 'Number not reachable'],
  Email: ['Mailbox not found', 'Message rejected'],
  'Push notification': ['No active device'],
}

const recipientId = (column: string, n: number) => {
  if (/mobile|phone|tel/i.test(column)) return `08${String(10000000 + n * 7919).slice(-8)}`
  if (/e-?mail/i.test(column)) return `customer${String(n).padStart(4, '0')}@example.com`
  return `CIS${String(n).padStart(6, '0')}`
}

const csvCell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)

export const deliveryReportName = (b: Broadcast) => `${b.id}-delivery-report.csv`

/** A report exists once anything was attempted (Published or Failed; Processing
 *  only validates, BA / Dev sync 28 Oct 2026). */
export const hasDeliveryReport = (b: Broadcast) => b.success + b.failed > 0

export function deliveryReportCsv(b: Broadcast): string {
  const waiting = waitingOf(b)
  const reasons = b.channels.flatMap((c) => FAIL_REASONS[c])
  const rows = [[b.recipientColumn, 'Channel', 'Result', 'Reason']]
  let n = 0
  const add = (count: number, result: string, reason: (i: number) => string) => {
    for (let i = 0; i < count; i++) rows.push([recipientId(b.recipientColumn, ++n), b.channels.join(', '), result, reason(i)])
  }
  add(b.success, 'Success', () => '')
  add(b.failed, 'Failed', (i) => reasons[i % reasons.length])
  add(b.notSent ?? 0, 'Not sent', () => (b.status === 'Failed' ? 'System error' : 'Broadcast ended'))
  add(waiting, 'Waiting to send', () => '')
  return rows.map((row) => row.map(csvCell).join(',')).join('\n') + '\n'
}
