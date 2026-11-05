/* Broadcast routes that open straight into a state with fixed demo content
 * (`#/broadcast/create/<preset>`, `#/broadcast/<list preset>`), and the seeds
 * each Create preset fills the form with. */

import { BA_DND, BROADCAST_COPY, DEFAULT_DND, EMPTY_CONTENT, type BroadcastContent, type Dnd, type ListToast, type RecipientType } from './broadcast'
import type { Channel } from './templates'

export const FORM_PRESETS = [
  'file-error',
  'cis',
  'email',
  'sms',
  'wrong-column',
  'errors',
  'step1-filled',
  'no-channel',
  'channel-typing',
  'channel-errors',
  'draft-no-name',
  'filled',
  'quiet',
  'dnd-rules',
  'dnd-all-week',
  'dnd-all-week-hours',
  'dnd-all-week-submit',
  'large-file',
  'long-message',
  'long-message-email',
  'long-message-sms',
  'checking',
  'confirm',
  'confirm-invalid',
  'file-blocked',
  'check-fail',
  'submitting',
  'fail-dialog',
  'leave',
] as const
export type FormPreset = (typeof FORM_PRESETS)[number]

export const LIST_PRESETS = ['submitted', 'draft-saved', 'cancelled'] as const
export type ListPreset = (typeof LIST_PRESETS)[number]

/* Download report's results held open on the list (22 Oct 2026). The confirm
 * itself is `#/broadcast/download`, or `#/broadcast/view/<id>/download` over
 * the drawer; `/fail` after either fails its Download. All on App maintenance. */
export const REPORT_PRESETS = ['download-success', 'download-failed'] as const
export type ReportPreset = (typeof REPORT_PRESETS)[number]
export const REPORT_DEMO_ID = 'BC-0003'

export const reportPreset = (s?: string) =>
  (REPORT_PRESETS as readonly string[]).includes(s ?? '') ? (s as ReportPreset) : undefined

export const formPreset = (s?: string) =>
  (FORM_PRESETS as readonly string[]).includes(s ?? '') ? (s as FormPreset) : undefined
export const listPreset = (s?: string) =>
  (LIST_PRESETS as readonly string[]).includes(s ?? '') ? (s as ListPreset) : undefined

export const LIST_TOAST: Record<ListPreset, ListToast> = {
  submitted: { name: 'October Customer Campaign', draft: false },
  'draft-saved': { name: 'October Customer Campaign', draft: true },
  cancelled: { name: 'November statement notice', draft: false, cancelled: true },
}

/* ── the Create form's seeds — `formSeed` in the original build ─────────── */


export const DIRECT_CSV = `MOBILE_NO,EMAIL,CUSTOMER_NAME,AMOUNT,PROMOTION_CODE
0812345678,somchai@email.com,Somchai Yimdee,1250.00,OCT24
0898765432,araya@email.com,Araya Chaisri,860.50,OCT24
0611122233,nattapong@email.com,Nattapong Wongsa,2100.00,OCT24
0812345678,siriporn@email,Siriporn Klaykeaw,750.25,OCT24
08-1234,,Thanapol Suksai,433.00,OCT24
+66812223333,kanya@email.com,Kanya Thongdee,1999.00,OCT24
`

/** A file too big for the preview box: 100 recipients × 55 columns, so the
 *  preview shows its first 5 rows and scrolls sideways (`#/broadcast/create/large-file`). Made up,
 *  repeating from short lists. */
const LARGE_COLUMNS = [
  'CIS_ID', 'CUSTOMER_NAME', 'ACCOUNT_NO', 'AMOUNT', 'PROMOTION_CODE', 'MOBILE_NO', 'EMAIL',
  'FIRST_NAME', 'LAST_NAME', 'TIER', 'BRANCH', 'PRODUCT', 'CARD_TYPE', 'CARD_LAST4', 'DUE_DATE',
  'MIN_PAYMENT', 'POINTS', 'POINTS_EXPIRY', 'SEGMENT', 'PREFERRED_LANG', 'CITY', 'PROVINCE',
  'POSTCODE', 'OPEN_DATE', 'RM_NAME', 'DATE_OF_BIRTH', 'GENDER', 'OCCUPATION', 'INCOME_RANGE',
  'MARITAL_STATUS', 'EMPLOYER',
]
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const OCCUPATIONS = ['Engineer', 'Teacher', 'Business owner', 'Nurse', 'Accountant']
const INCOMES = ['<30K', '30K-50K', '50K-100K', '>100K']
const EMPLOYERS = ['Siam Trading', 'Chao Phraya Logistics', 'Lanna Foods', 'Andaman Resorts']
const FIRST = ['Somchai', 'Araya', 'Nattapong', 'Siriporn', 'Thanapol', 'Kanya', 'Piti', 'Mana', 'Wipa', 'Chai']
const LAST = ['Yimdee', 'Chaisri', 'Wongsa', 'Klaykeaw', 'Suksai', 'Thongdee', 'Chaiyo', 'Deejai', 'Srisuk', 'Boonma']
const TIERS = ['Gold', 'Silver', 'Platinum', 'Classic']
const BRANCHES = ['Silom', 'Sathorn', 'Chiang Mai', 'Khon Kaen', 'Phuket']
const PRODUCTS = ['Savings', 'Current', 'Credit card', 'Home loan']
const CARDS = ['Visa', 'Mastercard', 'JCB']
const CITIES: [string, string, string][] = [
  ['Bang Rak', 'Bangkok', '10500'],
  ['Mueang', 'Chiang Mai', '50000'],
  ['Mueang', 'Khon Kaen', '40000'],
  ['Kathu', 'Phuket', '83120'],
]
export const LARGE_CSV = [
  [...LARGE_COLUMNS, ...MONTHS.map((m) => `BALANCE_${m}`), ...MONTHS.map((m) => `SPEND_${m}`)].join(','),
  ...Array.from({ length: 100 }, (_, i) => {
    const first = FIRST[i % FIRST.length]
    const last = LAST[(i * 3) % LAST.length]
    const [city, province, postcode] = CITIES[i % CITIES.length]
    const day = String((i % 28) + 1).padStart(2, '0')
    return [
      100001 + i,
      `${first} ${last}`,
      String(1234567890 + i * 7919).slice(0, 10),
      (250 + ((i * 137) % 4750)).toFixed(2),
      'OCT24',
      `08${String(10000000 + i * 4567).slice(0, 8)}`,
      `${first.toLowerCase()}.${last.toLowerCase()}${i}@email.com`,
      first,
      last,
      TIERS[i % TIERS.length],
      BRANCHES[i % BRANCHES.length],
      PRODUCTS[i % PRODUCTS.length],
      CARDS[i % CARDS.length],
      String(1000 + ((i * 373) % 9000)),
      `2026-11-${day}`,
      (100 + ((i * 61) % 900)).toFixed(2),
      (i * 250) % 20000,
      `2027-12-${day}`,
      i % 3 ? 'Retail' : 'Affluent',
      i % 4 ? 'TH' : 'EN',
      city,
      province,
      postcode,
      `20${String(10 + (i % 16)).padStart(2, '0')}-0${(i % 9) + 1}-${day}`,
      `${FIRST[(i + 4) % FIRST.length]} ${LAST[(i + 7) % LAST.length]}`,
      `19${70 + (i % 30)}-0${(i % 9) + 1}-${day}`,
      i % 2 ? 'F' : 'M',
      OCCUPATIONS[i % OCCUPATIONS.length],
      INCOMES[i % INCOMES.length],
      i % 3 ? 'Married' : 'Single',
      EMPLOYERS[i % EMPLOYERS.length],
      ...MONTHS.map((_, m) => (5000 + ((i * 911 + m * 487) % 95000)).toFixed(2)),
      ...MONTHS.map((_, m) => (((i * 313 + m * 197) % 30000)).toFixed(2)),
    ].join(',')
  }),
  '',
].join('\n')

/** Every CIS ID missing: the full read on Submit finds no valid recipient. */
export const NO_VALID_CSV = `CIS_ID,CUSTOMER_NAME,ACCOUNT_NO,AMOUNT,PROMOTION_CODE
,Somchai Yimdee,1234567890,1250.00,OCT24
,Araya Chaisri,9876543210,860.50,OCT24
,Nattapong Wongsa,4567891230,2100.00,OCT24
`

export const MESSAGE = `Dear \${CUSTOMER_NAME},
Your payment of THB \${AMOUNT} was successful.
Reference: \${ACCOUNT_NO}.`

export const SUBJECT = 'Special offer for ${CUSTOMER_NAME}'

/** What a preset (or a reopened Draft) puts into the form before it renders. */
export type FormSeed = {
  serviceCode?: string
  file?: { name: string; text: string }
  recipientType?: RecipientType
  column?: string
  channels?: Channel[]
  name?: string
  description?: string
  content?: BroadcastContent
  mode?: 'now' | 'schedule'
  /** Days from today, and HH:mm. */
  start?: { inDays: number; time: string }
  dnd?: Dnd
  /** A dialog open on arrival. `checking` is Submit's full read of the file,
   *  held; `blocked` is its result when the file cannot be used. */
  open?: 'checking' | 'confirm' | 'blocked' | 'check-fail' | 'submitting' | 'fail' | 'leave'
  /** A button pressed on arrival, to show what it does on this state. */
  press?: 'submit' | 'draft'
  /** Errors an earlier Submit left on the form, held while the user edits. */
  errors?: Record<string, string>
}

export const filled: FormSeed = {
  /* The wide file, so every Create preset shows the preview scrolling both ways (requester, 15 Oct 2026). */
  file: { name: 'audience-cis-large.csv', text: LARGE_CSV },
  serviceCode: 'NAMKTBATCH',
  recipientType: 'cis',
  column: 'CIS_ID',
  channels: ['Email', 'SMS'],
  name: 'October Customer Campaign',
  description: 'Send payment confirmation and special offer to selected customers in October.',
  content: {
    smsMessage: MESSAGE,
    emailSubject: SUBJECT,
    emailBody: MESSAGE,
    pushTitle: SUBJECT,
    pushBody: MESSAGE,
    pushDeeplink: '',
    emailSenderName: 'Bangkok Bank',
    emailSenderAddress: '',
  },
}

/* Messages near their maximum, so each preview scrolls inside its own area
 * while the channel card keeps the fields' height (requester, 3 Nov 2026).
 * Made up, inside the V.4.3 character list: a long word with no space (a
 * URL) and a Thai SMS with no spaces between words, to show the wrap. */
const LONG_BODY = `Dear \${CUSTOMER_NAME},

Thank you for banking with Bangkok Bank. Your payment of THB \${AMOUNT} to account \${ACCOUNT_NO} was successful on \${DUE_DATE}.

This October, Bualuang credit card members earn double points on every purchase at participating merchants nationwide. Your current balance is \${POINTS} points, valid until \${POINTS_EXPIRY}.

Use promotion code \${PROMOTION_CODE} before the end of the month to receive an extra 500 points on your first online purchase of THB 1,000 or more.

Your relationship manager, \${RM_NAME}, at our \${BRANCH} branch is happy to help you choose the card or product that fits your plans for the year ahead.

Read the full terms and conditions at https://www.bangkokbank.com/en/personal/promotions/octobercustomercampaign2026/termsandconditions

This message was sent to customers who agreed to receive news and offers from Bangkok Bank. Please do not reply to this message.

Bangkok Bank`

const LONG_SMS = `เรียน คุณ\${CUSTOMER_NAME} ธนาคารกรุงเทพขอขอบคุณที่ใช้บริการ รายการชำระเงิน THB \${AMOUNT} ของท่านสำเร็จแล้ว เดือนตุลาคมนี้รับคะแนนสะสมสองเท่าเมื่อใช้จ่ายผ่านบัตรเครดิตบัวหลวงที่ร้านค้าที่ร่วมรายการทั่วประเทศ ใช้รหัส \${PROMOTION_CODE} ก่อนสิ้นเดือนเพื่อรับคะแนนพิเศษ 500 คะแนน เมื่อซื้อสินค้าออนไลน์ครั้งแรกตั้งแต่ 1,000 บาทขึ้นไป อ่านเงื่อนไขที่ https://www.bangkokbank.com/th/personal/promotions/october2026 สอบถามเพิ่มเติมติดต่อสาขา\${BRANCH} หรือโทร 1333 ตลอด 24 ชั่วโมง`

const LONG_CONTENT: BroadcastContent = {
  ...(filled.content as BroadcastContent),
  pushTitle: 'Double points all October for ${CUSTOMER_NAME}, plus an extra 500 points with your first online purchase of THB 1,000 or more',
  pushBody: LONG_BODY,
  emailSubject: 'Your payment of THB ${AMOUNT} was successful, and double points all October for Bualuang credit card members',
  emailBody: LONG_BODY,
  emailSenderName: 'Bangkok Bank Credit Card and Customer Loyalty Programme',
  emailSenderAddress: 'creditcard.loyalty.programme@bangkokbank.com',
  smsMessage: LONG_SMS,
}

/* Error behavior, CNH Phase 1's five steps (Figma JjvzdUwg5LlKHDQvo2fny0
 * 123:95723) on Broadcast: Step 1 filled → Submit marks the file and the
 * channels → a channel switched on and typed in, the marks stay → Submit
 * again leaves only what is still missing. */
const step1: FormSeed = { name: filled.name, description: filled.description }
const emailTyped: FormSeed = {
  ...step1,
  channels: ['Email'],
  content: { ...EMPTY_CONTENT, emailSubject: SUBJECT },
}

/** Days until the next Monday–Thursday, so a 21:00 start lands in the quiet period. */
export const nextWeekday = () => {
  const today = new Date()
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (d.getDay() >= 1 && d.getDay() <= 4) return i
  }
  return 1
}

/** Days until the next Saturday, so a start then waits out the weekend rule. */
export const nextSaturday = () => ((6 - new Date().getDay() + 7) % 7) || 7

/** Do Not Disturb that leaves no time to send, made of two periods so the
 *  warning shows they add up (BA / Dev sync, 28 Oct 2026). */
const ALL_WEEK_DND: Dnd = {
  enabled: true,
  rules: [
    { id: 'dnd-weekdays-all-day', days: [1, 2, 3, 4, 5], allDay: true, from: '00:00', to: '00:00' },
    { id: 'dnd-weekend-all-day', days: [6, 0], allDay: true, from: '00:00', to: '00:00' },
  ],
  timeZone: 'Asia/Bangkok',
}

/** The same state from hours alone, no All day: the check adds up the periods,
 *  not the All day boxes (BA, 5 Nov 2026). */
const ALL_WEEK_HOURS_DND: Dnd = {
  enabled: true,
  rules: [
    { id: 'dnd-daytime', days: [1, 2, 3, 4, 5, 6, 0], allDay: false, from: '08:00', to: '18:00' },
    { id: 'dnd-overnight', days: [1, 2, 3, 4, 5, 6, 0], allDay: false, from: '18:00', to: '08:00' },
  ],
  timeZone: 'Asia/Bangkok',
}

export function formSeed(preset: FormPreset): FormSeed {
  switch (preset) {
    case 'file-error':
      return { file: { name: 'recipients.txt', text: 'CIS_ID\n100001\n' } }
    case 'cis':
      return { file: filled.file, recipientType: 'cis' }
    case 'email':
      return {
        file: { name: 'audience-direct.csv', text: DIRECT_CSV },
        recipientType: 'email',
        channels: ['Email'],
      }
    case 'sms':
      return {
        file: { name: 'audience-direct.csv', text: DIRECT_CSV },
        recipientType: 'sms',
        channels: ['SMS'],
      }
    case 'wrong-column':
      // PROPOSAL, pending BA (Q15): SMS with the email column, Submit pressed.
      return {
        ...filled,
        file: { name: 'audience-direct.csv', text: DIRECT_CSV },
        recipientType: 'sms',
        column: 'EMAIL',
        channels: ['SMS'],
        press: 'submit',
      }
    case 'errors':
      return { press: 'submit' }
    case 'step1-filled':
      return step1
    case 'no-channel':
      return { ...step1, press: 'submit' }
    case 'channel-typing':
      return { ...emailTyped, errors: { file: BROADCAST_COPY.noFile, channels: BROADCAST_COPY.noChannel } }
    case 'channel-errors':
      return { ...emailTyped, press: 'submit' }
    case 'draft-no-name':
      return { press: 'draft' }
    case 'filled':
      return filled
    case 'quiet':
      return { ...filled, mode: 'schedule', start: { inDays: nextWeekday(), time: '21:00' }, dnd: DEFAULT_DND }
    case 'dnd-rules':
      return { ...filled, mode: 'schedule', start: { inDays: nextSaturday(), time: '10:00' }, dnd: BA_DND }
    case 'dnd-all-week':
      return { ...filled, dnd: ALL_WEEK_DND }
    case 'dnd-all-week-hours':
      return { ...filled, dnd: ALL_WEEK_HOURS_DND }
    /* Submit pressed: the Alert turns Negative and blocks it (BA MoM, 29 Oct 2026). */
    case 'dnd-all-week-submit':
      return { ...filled, dnd: ALL_WEEK_DND, errors: { dnd: BROADCAST_COPY.dndNeverSends } }
    case 'large-file':
      return { ...filled, file: { name: 'audience-cis-large.csv', text: LARGE_CSV } }
    case 'long-message':
      return { ...filled, channels: ['Push notification', 'Email', 'SMS'], content: LONG_CONTENT }
    case 'long-message-email':
      return { ...formSeed('email'), name: filled.name, content: LONG_CONTENT }
    case 'long-message-sms':
      return { ...formSeed('sms'), name: filled.name, content: LONG_CONTENT }
    case 'checking':
      return { ...filled, open: 'checking' }
    case 'confirm':
      return { ...filled, open: 'confirm' }
    case 'confirm-invalid':
      return {
        ...filled,
        file: { name: 'audience-direct.csv', text: DIRECT_CSV },
        recipientType: 'sms',
        column: 'MOBILE_NO',
        channels: ['SMS'],
        open: 'confirm',
      }
    case 'file-blocked':
      return { ...filled, file: { name: 'audience-cis.csv', text: NO_VALID_CSV }, open: 'blocked' }
    case 'check-fail':
      return { ...filled, open: 'check-fail' }
    case 'submitting':
      return { ...filled, open: 'submitting' }
    case 'fail-dialog':
      return { ...filled, open: 'fail' }
    case 'leave':
      return { ...filled, open: 'leave' }
  }
}
