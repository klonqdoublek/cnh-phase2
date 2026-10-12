/* Import templates (Phase 2, requirement 1). Every state has its own route,
 * `#/list/import/<preset>`. Ported from the cnh-tm-phase2 build
 * (.reference/cnh-tm-phase2/app-extract.js, `IMPORT_COPY` … `presetTemplates`).
 * Copy and fixtures are transcribed, not composed. */

import {
  CHANNELS,
  CHANNEL_CODE,
  CODE_OF,
  EMPTY_DETAIL,
  SERVICE_CODE_LOV,
  toExport,
  toJsonl,
  type Channel,
  type Template,
  type TemplateExport,
} from './templates'

export const IMPORT_PRESETS = [
  'initial',
  'no-file',
  'selected',
  'invalid-format',
  'invalid-structure',
  'uploading',
  'failure',
  'success',
] as const
export type ImportPreset = (typeof IMPORT_PRESETS)[number]

export const IMPORT_COPY = {
  title: 'Import templates',
  dropTitle: 'Drag and drop .jsonl files here',
  /* The original's second hint line, "You can import one or more template files at
     a time", is gone: the CMS drop zone carries one hint line, 84 tall (12 Oct 2026). */
  browse: 'Browse files',
  format: 'Invalid file format. Only .jsonl files can be imported',
  structure: 'Invalid template structure',
  noFile: 'Select at least one .jsonl file to import',
  hasErrors: 'Remove the files with errors to continue',
  /* The original's one-line "Drag and drop more .jsonl files here, or" is gone:
     the CMS drop zone keeps its own hint once files are picked (12 Oct 2026). */
  summary: (files: number, templates: number) =>
    `${files} ${files === 1 ? 'file' : 'files'} · ${templates} ${templates === 1 ? 'template' : 'templates'}`,
  errorCount: (n: number) => `${n} with ${n === 1 ? 'error' : 'errors'}`,
  removeErrors: (n: number) => `Remove ${n} ${n === 1 ? 'file' : 'files'} with errors`,
  tooMany: (max: number, left: number) =>
    `You can import up to ${max} files at a time. ${left} ${left === 1 ? 'file was' : 'files were'} not added`,
  uploading: 'Importing templates…',
  failTitle: 'Unable to import templates',
  failBody: 'Please try again',
  successTitle: 'Templates imported',
  successBody: (n: number) => `${n} ${n === 1 ? 'template was' : 'templates were'} added as draft`,
}

/** A file whose name contains this fails the upload — the prototype's way to reach Import failure. */
export const IMPORT_FAIL_SENTINEL = 'error'
export const MAX_IMPORT_FILES = 50
export const UPLOAD_MS = 1200

const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const text = (v: unknown) => (typeof v === 'string' ? v : '')

type RawTemplate = Record<string, unknown>

export function structureProblem(record: unknown, line: number, many: boolean): string | null {
  const at = many ? ` (line ${line})` : ''
  if (!record || typeof record !== 'object' || Array.isArray(record)) return `Not a template object${at}`
  const r = record as RawTemplate
  if (r.recordType !== 'TEMPLATE') return `Not a template record${at}`
  if (!isText(r.templateName)) return `Missing templateName${at}`
  if (!isText(r.description)) return `Missing description${at}`
  const codes = r.serviceCodes
  if (!Array.isArray(codes) || codes.length === 0) return `Missing serviceCodes${at}`
  if (!codes.every((c) => SERVICE_CODE_LOV.includes(c))) return `Unknown service code${at}`
  const channels = r.channels
  if (!Array.isArray(channels) || channels.length === 0) return `Missing channels${at}`
  if (!channels.every((c) => c in CHANNEL_CODE)) return `Unknown channel${at}`
  if (!Array.isArray(r.templateLanguages)) return `Missing templateLanguages${at}`
  return null
}

export function fromExport(r: TemplateExport): Template {
  const lang = (l: string) =>
    (r.templateLanguages.find((x) => x?.language === l) ?? {}) as Record<string, unknown>
  const en = lang('en')
  const th = lang('th')
  const either = (k: string) => text(en[k]) || text(th[k])
  const serviceCode = r.serviceCodes[0]
  return {
    id: '',
    name: r.templateName.trim(),
    description: r.description.trim(),
    productName: text(r.productName).trim(),
    serviceCode,
    channels: CHANNELS.filter((c) => r.channels.includes(CODE_OF[c])),
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

export type FileCheck =
  | { ok: true; templates: Template[] }
  | { ok: false; problem: 'format' | 'structure'; message: string }

export function parseTemplates(name: string, body: string): FileCheck {
  if (!name.toLowerCase().endsWith('.jsonl')) return { ok: false, problem: 'format', message: IMPORT_COPY.format }
  const lines = body
    .split(/\r?\n/)
    .map((t, i) => ({ t: t.trim(), n: i + 1 }))
    .filter((l) => l.t)
  if (lines.length === 0)
    return { ok: false, problem: 'structure', message: `${IMPORT_COPY.structure}: the file has no templates` }
  const many = lines.length > 1
  const records: unknown[] = []
  for (const { t, n } of lines)
    try {
      records.push(JSON.parse(t))
    } catch {
      return { ok: false, problem: 'structure', message: `${IMPORT_COPY.structure}: line ${n} is not valid JSON` }
    }
  for (let i = 0; i < records.length; i++) {
    const problem = structureProblem(records[i], lines[i].n, many)
    if (problem) return { ok: false, problem: 'structure', message: `${IMPORT_COPY.structure}: ${problem}` }
  }
  return { ok: true, templates: (records as TemplateExport[]).map(fromExport) }
}

export async function checkFile(file: File): Promise<FileCheck> {
  return file.name.toLowerCase().endsWith('.jsonl')
    ? parseTemplates(file.name, await file.text())
    : { ok: false, problem: 'format', message: IMPORT_COPY.format }
}

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

type DemoFile = { name: string; text: string }

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

const BAD_FORMAT: DemoFile = { name: 'customers.csv', text: 'name,description\nPromotion offer,not a template' }
const BAD_STRUCTURE: DemoFile = {
  name: 'broken-template.jsonl',
  text: toJsonl([{ ...demo('No channels', 'x', 'AIA', [], 'NANOTI') }]),
}

export function presetFiles(preset: ImportPreset): DemoFile[] {
  if (preset === 'initial' || preset === 'no-file') return []
  if (preset === 'invalid-format') return [BAD_FORMAT, ...VALID_FILES]
  if (preset === 'invalid-structure') return [BAD_STRUCTURE, ...VALID_FILES]
  return VALID_FILES
}

/** The templates the success route lands on the list. */
export const presetTemplates = () =>
  VALID_FILES.flatMap((f) => {
    const check = parseTemplates(f.name, f.text)
    return check.ok ? check.templates : []
  })
