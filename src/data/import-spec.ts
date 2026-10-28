/* Import templates (Phase 2, requirement 1). Every state has its own route,
 * `#/list/import/<preset>`. Ported from the cnh-tm-phase2 build
 * (.reference/cnh-tm-phase2/app-extract.js, `IMPORT_COPY` … `presetTemplates`).
 * Copy and fixtures are transcribed, not composed. */

import {
  CHANNELS,
  CODE_OF,
  EMPTY_DETAIL,
  toExport,
  toJsonl,
  type Channel,
  type Template,
  type TemplateExport,
} from './templates'

export const IMPORT_PRESETS = [
  'initial',
  'no-file',
  'too-many',
  'too-large',
  'selected',
  'duplicate',
  'uploading',
  'failure',
  'success',
] as const
export type ImportPreset = (typeof IMPORT_PRESETS)[number]

export const IMPORT_COPY = {
  title: 'Import templates',
  /* One file per import (requester, 15 Oct 2026): the hint is singular and carries
     CMS's size hint, "Max file size: 10 MB", on the same line so the zone stays 84 tall.
     The original's second hint line, "You can import one or more template files at
     a time", is gone: the CMS drop zone carries one hint line (12 Oct 2026). */
  dropTitle: 'Drag and drop a .jsonl file here · Max file size: 10 MB',
  browse: 'Browse file',
  /* CMS's slot hint (ASSET_COPY.sizeHint). Since 22 Oct 2026 (requester) it reads in the
     file's slot, CMS's upload-failed slot without Try again, when Import finds the file over
     the limit. 20–22 Oct it was the empty zone's hint and the file was not taken. */
  size: 'Max file size: 10 MB',
  noFile: 'Select a .jsonl file to import',
  hasErrors: 'Remove the file and choose another to continue',
  uploading: 'Importing templates…',
  /* Inside the file slot since 20 Oct 2026 (CMS's upload-failed slot); the banner's
     second line, "Please try again", became CMS's Try again button. */
  failTitle: 'Unable to import templates',
  retry: 'Try again',
  successTitle: 'Templates imported',
  successBody: (n: number) => `${n} ${n === 1 ? 'template was' : 'templates were'} added as draft`,
  /* Composed (requester, 15 Oct 2026): a file whose name was imported before asks
     before it imports over that file. Since the design critique (20 Oct 2026) it opens
     after the upload spinner, alone, not over the Import dialog. Reworded 21 Oct 2026
     (requester): was "Import over <name>?" with Import, which did not say what goes.
     Title and button share the verb, as "Submit this broadcast?" does. */
  replaceTitle: 'Replace imported templates?',
  replaceBody: (name: string) =>
    `${name} was imported before. The templates from that import will be deleted and replaced with the ones in this file.`,
  replaceConfirm: 'Replace',
}

/** A file whose name contains this fails the upload — the prototype's way to reach Import failure. */
export const IMPORT_FAIL_SENTINEL = 'error'
/** CMS's limit (MAX_ASSET_BYTES); the BA has not set one for Import yet (size limits, P2-1…P2-9). */
export const MAX_IMPORT_BYTES = 10 * 1024 * 1024
export const UPLOAD_MS = 1200

const text = (v: unknown) => (typeof v === 'string' ? v : '')

/* No field is checked before the upload (requester, 27 Oct 2026; was "Invalid template
   structure: Missing …" under the slot), so a missing field reads as empty. */
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

export function fromExport(r: Partial<TemplateExport>): Template {
  const lang = (l: string) =>
    (list(r.templateLanguages).find((x) => (x as { language?: string } | null)?.language === l) ?? {}) as Record<string, unknown>
  const en = lang('en')
  const th = lang('th')
  const either = (k: string) => text(en[k]) || text(th[k])
  const serviceCode = text(list(r.serviceCodes)[0])
  const channels = list(r.channels)
  return {
    id: '',
    name: text(r.templateName).trim(),
    description: text(r.description).trim(),
    productName: text(r.productName).trim(),
    serviceCode,
    channels: CHANNELS.filter((c) => channels.includes(CODE_OF[c])),
    status: 'Draft',
    detail: {
      templateRefCode: '',
      serviceCode,
      notificationGroup: text(r.notificationGroupName),
      remark: text(r.remark),
      pushTitleTh: text(th.pushTitle),
      pushTitleEn: text(en.pushTitle),
      pushBodyTh: text(th.pushMessage),
      pushBodyEn: text(en.pushMessage),
      pushDeeplink: either('pushDeepLink'),
      emailSubjectTh: text(th.emailSubject),
      emailSubjectEn: text(en.emailSubject),
      emailBodyTh: text(th.emailBody),
      emailBodyEn: text(en.emailBody),
      emailDisplayNameTh: text(th.emailFromDisplayName) || either('emailFromDisplayName'),
      emailDisplayNameEn: text(en.emailFromDisplayName) || either('emailFromDisplayName'),
      emailFromAddress: either('emailFrom'),
      emailTemplateName: '',
      smsMessageTh: text(th.smsMessage),
      smsMessageEn: text(en.smsMessage),
      createdBy: '',
      updatedBy: '',
      lastUpdated: '',
    },
  }
}

/** `unreadable`: no line of JSON to import; the upload fails ("Unable to import templates"). */
export type FileCheck =
  | { ok: true; templates: Template[] }
  | { ok: false; problem: 'size' | 'unreadable'; message: string }

/** The upload control takes .jsonl only (requester, 22 Oct 2026): another type is never picked. */
export const isJsonl = (name: string) => name.toLowerCase().endsWith('.jsonl')

export function parseTemplates(body: string): FileCheck {
  const lines = body
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean)
  const unreadable = { ok: false, problem: 'unreadable', message: IMPORT_COPY.failTitle } as const
  if (lines.length === 0) return unreadable
  const records: Partial<TemplateExport>[] = []
  for (const t of lines)
    try {
      const record: unknown = JSON.parse(t)
      if (!record || typeof record !== 'object' || Array.isArray(record)) return unreadable
      records.push(record as Partial<TemplateExport>)
    } catch {
      return unreadable
    }
  return { ok: true, templates: records.map(fromExport) }
}

/** Checked on Import, before the upload (requester, 22 Oct 2026; was: when the file was picked). */
export const sizeProblem = (size: number): Extract<FileCheck, { ok: false }> | null =>
  size > MAX_IMPORT_BYTES ? { ok: false, problem: 'size', message: IMPORT_COPY.size } : null

/* ── preset files: what each `#/list/import/<preset>` route opens with ── */

const demo = (name: string, description: string, productName: string, channels: Channel[], serviceCode: string) =>
  toExport({
    id: '',
    name,
    description,
    productName,
    serviceCode,
    channels,
    status: 'Published',
    detail: { ...EMPTY_DETAIL, serviceCode },
  })

type DemoFile = { name: string; text: string; size?: number }

const VALID_FILES: DemoFile[] = [
  {
    name: 'card-payment-due.jsonl',
    text: toJsonl([
      demo('Card payment due', 'แจ้งเตือนก่อนถึงวันครบกำหนดชำระบัตรเครดิต', 'M Credit Card', ['Push notification', 'Email'], 'NANOTI'),
    ]),
  },
  {
    name: 'login-otp.jsonl',
    text: toJsonl([demo('Login OTP', 'ส่งรหัส OTP เพื่อยืนยันการเข้าสู่ระบบ', 'Bualuang mBanking', ['SMS'], 'NAOTP')]),
  },
  {
    name: 'statements.jsonl',
    text: toJsonl([
      demo('Monthly statement ready', 'แจ้งเมื่อ e-Statement ประจำเดือนพร้อมให้ดาวน์โหลด', 'M Credit Card', ['Email'], 'NABATCH'),
      demo('Insurance renewal', 'แจ้งเตือนต่ออายุกรมธรรม์ประกันล่วงหน้า 30 วัน', 'AIA', ['Email', 'SMS'], 'NAMKTBATCH'),
    ]),
  },
]

/** One file per import (15 Oct 2026); `duplicate` picks a file the history already holds. */
export function presetFile(preset: ImportPreset): DemoFile | null {
  /* `too-many` draws the refused drag, which looks the same as the empty zone (27 Oct 2026). */
  if (preset === 'initial' || preset === 'no-file' || preset === 'too-many') return null
  /* A stand-in size: the route cannot carry a file over 10 MB. */
  if (preset === 'too-large') return { ...VALID_FILES[0], size: 14.2 * 1024 * 1024 }
  if (preset === 'duplicate') return VALID_FILES[2]
  return VALID_FILES[0]
}

/** Files imported before this session, so `#/list/import/duplicate` has one to import over.
 *  Their templates are not on the seeded list, so importing over one replaces nothing. */
export const IMPORT_HISTORY: Record<string, string[]> = { [VALID_FILES[2].name]: [] }

/** The templates the success route lands on the list: the one file `selected` picks. */
export const presetTemplates = () => {
  const check = parseTemplates(VALID_FILES[0].text)
  return check.ok ? check.templates : []
}
