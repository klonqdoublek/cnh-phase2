/* Create / Edit notification — the form as data: cards, rows, fields and the
 * rules that check them. Transcribed from the cnh-tm-phase2 build
 * (.reference/cnh-tm-phase2/app-extract.js, `FORM` … `SECTION_OF`). */

import { NOTIFICATION_GROUP_LOV, SERVICE_CODE_LOV, STATUSES } from '@/data/templates'
import type { FormValues, Toggles } from '@/data/template-form'

export type FieldKey = keyof FormValues

export type FieldSpec = {
  key: FieldKey
  label: string
  required: boolean
  kind: 'text' | 'textarea' | 'select' | 'multiselect'
  /** Counter denominator and the over-max rule. */
  max?: number
  /** False hides the counter row. */
  hasHint?: boolean
  hint?: string
  options?: readonly string[]
  /** A text box drawn taller than 56 — rendered as a Text Area of this height. */
  boxHeight?: number
  /** Skips the charset rule (URLs, email addresses). */
  rawFormat?: boolean
  /** Shown in Edit only. */
  editOnly?: boolean
  span: 'half' | 'third' | 'full'
  placeholder: string
  /** In Edit, the field holds this width instead of its span. */
  editWidth?: number
}

export type SectionId = 'general' | 'push' | 'email' | 'sms'

export type SectionSpec = {
  id: SectionId
  title: string
  toggle: boolean
  hint?: string
  rowGap?: 4
  rows: FieldSpec[][]
}

export const FORM: SectionSpec[] = [
  {
    id: 'general',
    title: 'General information',
    toggle: false,
    rows: [
      [
        { key: 'templateName', label: 'Notification name', required: true, kind: 'text', hasHint: false, max: 20, span: 'half', placeholder: 'Enter notification name' },
        { key: 'templateDescription', label: 'Description', required: true, kind: 'text', hasHint: false, max: 20, span: 'half', placeholder: 'Enter description' },
      ],
      [
        { key: 'productName', label: 'Product name', required: false, kind: 'text', max: 50, span: 'third', placeholder: 'Enter product name (optional)', editWidth: 500 },
        { key: 'serviceCode', label: 'Service code', required: true, kind: 'multiselect', options: SERVICE_CODE_LOV, span: 'third', placeholder: 'Select service code', editWidth: 220 },
        { key: 'notificationGroup', label: 'Notification group', required: true, kind: 'select', options: NOTIFICATION_GROUP_LOV, span: 'third', placeholder: 'Select notification group', editWidth: 220 },
      ],
      [
        { key: 'status', label: 'Status', required: true, kind: 'select', options: STATUSES, editOnly: true, span: 'third', placeholder: 'Select status', editWidth: 220 },
      ],
      [
        { key: 'remark', label: 'Remarks', required: false, kind: 'textarea', hasHint: false, max: 500, span: 'full', placeholder: 'Enter remarks (optional)' },
      ],
    ],
  },
  {
    id: 'push',
    title: 'Push notification',
    toggle: true,
    rowGap: 4,
    rows: [
      [
        { key: 'pushTitleTh', label: 'Push title (TH)', required: true, kind: 'text', max: 255, span: 'half', placeholder: 'Enter push title in Thai' },
        { key: 'pushTitleEn', label: 'Push title (EN)', required: true, kind: 'text', max: 255, span: 'half', placeholder: 'Enter push title in English' },
      ],
      [
        { key: 'pushBodyTh', label: 'Push message (TH)', required: true, kind: 'text', max: 2048, boxHeight: 77, span: 'half', placeholder: 'Enter push message in Thai' },
        { key: 'pushBodyEn', label: 'Push message (EN)', required: true, kind: 'text', max: 2048, boxHeight: 77, span: 'half', placeholder: 'Enter push message in English' },
      ],
      [
        {
          key: 'pushDeeplink',
          label: 'Deep link',
          required: true,
          kind: 'textarea',
          max: 2048,
          rawFormat: true,
          hint: 'A deep link will take customers to your specific destination when tapping the push notification',
          span: 'full',
          placeholder: 'Enter a deep link URL (optional)',
        },
      ],
    ],
  },
  {
    id: 'email',
    title: 'Email',
    toggle: true,
    hint: 'To send both Thai and English content in the same email, please enter content in both Thai and English for every placeholder',
    rows: [
      [
        { key: 'emailSubjectTh', label: 'Email subject (TH)', required: true, kind: 'text', max: 255, span: 'half', placeholder: 'Enter email subject' },
        { key: 'emailSubjectEn', label: 'Email subject (EN)', required: true, kind: 'text', max: 255, span: 'half', placeholder: 'Enter email subject' },
      ],
      [
        { key: 'emailBodyTh', label: 'Email content (TH)', required: true, kind: 'textarea', max: 2048, hasHint: false, span: 'half', placeholder: 'Enter email content' },
        { key: 'emailBodyEn', label: 'Email content (EN)', required: true, kind: 'textarea', max: 2048, hasHint: false, span: 'half', placeholder: 'Enter email content' },
      ],
      [
        { key: 'emailDisplayNameTh', label: 'Sender name (TH)', required: false, kind: 'text', max: 255, boxHeight: 77, span: 'half', placeholder: 'Enter sender name in Thai (optional)' },
        { key: 'emailDisplayNameEn', label: 'Sender name (EN)', required: true, kind: 'text', max: 255, boxHeight: 77, span: 'half', placeholder: 'Enter sender name in English' },
      ],
      [
        { key: 'emailFromAddress', label: 'Sender email address', required: false, kind: 'text', max: 255, rawFormat: true, placeholder: 'Enter sender email address (optional)', span: 'half' },
        { key: 'emailTemplateName', label: 'Notification name', required: true, kind: 'text', max: 20, span: 'half', placeholder: 'Enter notification name' },
      ],
    ],
  },
  {
    id: 'sms',
    title: 'SMS',
    toggle: true,
    rows: [
      [
        { key: 'smsMessageTh', label: 'SMS message (TH)', required: true, kind: 'textarea', max: 800, span: 'half', placeholder: 'Enter SMS message in Thai' },
        { key: 'smsMessageEn', label: 'SMS message (EN)', required: true, kind: 'textarea', max: 800, span: 'half', placeholder: 'Enter SMS message in English' },
      ],
    ],
  },
]

export const ALL_FIELDS = FORM.flatMap((s) => s.rows.flat())

export const STEP_1_TITLE = 'Step 1: Enter general information about the notification'
export const STEP_2_TITLE =
  'Step 2: Enable the notification channels you want to use and enter the required information'
export const MSG_REQUIRED = 'Please enter information'
export const MSG_NO_CHANNEL = 'Please enable at least 1 notification channel'
export const msgMax = (_max: number) => 'Character limit exceeded'
export const MSG_CHARSET = 'You can use these special characters only ~ ฿ ^ _ : . / ?'

const ALLOWED = /^[฀-๿ a-zA-Z0-9~฿^_:./?\n\r]*$/
const FORBIDDEN = [/<#[^>]*>/, /<@[^>]*>/, /\[=[^\]]*\]/, /\[#[^\]]*\]/]
const patternsOk = (v: string) => !FORBIDDEN.some((re) => re.test(v))
export const charsetOk = (v: string, raw = false) => patternsOk(v) && (raw || ALLOWED.test(v))

/** Which toggle a channel card reads. */
export const TOGGLE_OF: Record<Exclude<SectionId, 'general'>, keyof Toggles> = {
  push: 'push',
  email: 'email',
  sms: 'sms',
}

/** The message a text field shows for its value, or undefined. Two rules at
 *  once are one run with a line break, as the source writes them. */
export function textProblem(spec: FieldSpec, value: string): string | undefined {
  if (spec.kind !== 'text' && spec.kind !== 'textarea') return undefined
  const over = !!spec.max && value.length > spec.max
  const charset = !charsetOk(value, spec.rawFormat)
  if (over && charset) return `${MSG_CHARSET}\n${msgMax(spec.max!)}`
  if (over) return msgMax(spec.max!)
  if (charset) return MSG_CHARSET
  return undefined
}
