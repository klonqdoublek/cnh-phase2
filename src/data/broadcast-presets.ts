/* Broadcast routes that open straight into a state with fixed demo content
 * (`#/broadcast/create/<preset>`, `#/broadcast/<list preset>`), and the seeds
 * each Create preset fills the form with. */

import { BA_DND, DEFAULT_DND, type BroadcastContent, type Dnd, type ListToast, type RecipientType } from './broadcast'
import type { Channel } from './templates'

export const FORM_PRESETS = [
  'file-error',
  'cis',
  'direct',
  'errors',
  'draft-no-name',
  'filled',
  'quiet',
  'dnd-rules',
  'end',
  'large-file',
  'confirm',
  'submitting',
  'fail-dialog',
  'leave',
] as const
export type FormPreset = (typeof FORM_PRESETS)[number]

export const LIST_PRESETS = ['submitted', 'draft-saved'] as const
export type ListPreset = (typeof LIST_PRESETS)[number]

export const formPreset = (s?: string) =>
  (FORM_PRESETS as readonly string[]).includes(s ?? '') ? (s as FormPreset) : undefined
export const listPreset = (s?: string) =>
  (LIST_PRESETS as readonly string[]).includes(s ?? '') ? (s as ListPreset) : undefined

export const LIST_TOAST: Record<ListPreset, ListToast> = {
  submitted: { name: 'October Customer Campaign', draft: false },
  'draft-saved': { name: 'October Customer Campaign', draft: true },
}

/* ── the Create form's seeds — `formSeed` in the original build ─────────── */


export const CIS_CSV = `CIS_ID,CUSTOMER_NAME,ACCOUNT_NO,AMOUNT,PROMOTION_CODE
100001,Somchai Yimdee,1234567890,1250.00,OCT24
100002,Araya Chaisri,9876543210,860.50,OCT24
100003,Nattapong Wongsa,4567891230,2100.00,OCT24
100004,Siriporn Klaykeaw,3216549870,750.25,OCT24
100005,Thanapol Suksai,1597534860,433.00,OCT24
100006,Kanya Thongdee,7531598520,1999.00,OCT24
100007,Piti Chaiyo,8524569630,320.00,OCT24
100008,Mana Deejai,9638527410,1500.75,OCT24
`

export const DIRECT_CSV = `MOBILE_NO,EMAIL,CUSTOMER_NAME,AMOUNT,PROMOTION_CODE
0812345678,somchai@email.com,Somchai Yimdee,1250.00,OCT24
0898765432,araya@email.com,Araya Chaisri,860.50,OCT24
0611122233,nattapong@email.com,Nattapong Wongsa,2100.00,OCT24
0812345678,siriporn@email,Siriporn Klaykeaw,750.25,OCT24
08-1234,,Thanapol Suksai,433.00,OCT24
+66812223333,kanya@email.com,Kanya Thongdee,1999.00,OCT24
`

/** A file too big for the preview box: 100 recipients × 25 columns, so the
 *  preview scrolls both ways (`#/broadcast/create/large-file`). Made up,
 *  repeating from short lists. */
const LARGE_COLUMNS = [
  'CIS_ID', 'CUSTOMER_NAME', 'ACCOUNT_NO', 'AMOUNT', 'PROMOTION_CODE', 'MOBILE_NO', 'EMAIL',
  'FIRST_NAME', 'LAST_NAME', 'TIER', 'BRANCH', 'PRODUCT', 'CARD_TYPE', 'CARD_LAST4', 'DUE_DATE',
  'MIN_PAYMENT', 'POINTS', 'POINTS_EXPIRY', 'SEGMENT', 'PREFERRED_LANG', 'CITY', 'PROVINCE',
  'POSTCODE', 'OPEN_DATE', 'RM_NAME',
]
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
  LARGE_COLUMNS.join(','),
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
    ].join(',')
  }),
  '',
].join('\n')

export const MESSAGE = `Dear {{CUSTOMER_NAME}},
Your payment of THB {{AMOUNT}} was successful.
Reference: {{ACCOUNT_NO}}.`

export const SUBJECT = 'Special offer for {{CUSTOMER_NAME}}'

/** What a preset (or a reopened Draft) puts into the form before it renders. */
export type FormSeed = {
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
  /** Broadcast End: days from today, and HH:mm. */
  end?: { inDays: number; time: string }
  dnd?: Dnd
  /** A dialog open on arrival. */
  open?: 'confirm' | 'submitting' | 'fail' | 'leave'
  /** A button pressed on arrival, to show what it does on this state. */
  press?: 'submit' | 'draft'
}

export const filled: FormSeed = {
  file: { name: 'audience-cis.csv', text: CIS_CSV },
  recipientType: 'cis',
  column: 'CIS_ID',
  channels: ['Email', 'SMS'],
  name: 'October Customer Campaign',
  description: 'Send payment confirmation and special offer to selected customers in October.',
  content: { smsMessage: MESSAGE, emailSubject: SUBJECT, emailBody: MESSAGE, pushTitle: SUBJECT, pushBody: MESSAGE },
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

export function formSeed(preset: FormPreset): FormSeed {
  switch (preset) {
    case 'file-error':
      return { file: { name: 'recipients.txt', text: 'CIS_ID\n100001\n' } }
    case 'cis':
      return { file: filled.file, recipientType: 'cis', column: 'CIS_ID' }
    case 'direct':
      return {
        file: { name: 'audience-direct.csv', text: DIRECT_CSV },
        recipientType: 'direct',
        column: 'MOBILE_NO',
        channels: ['SMS'],
      }
    case 'errors':
      return { press: 'submit' }
    case 'draft-no-name':
      return { press: 'draft' }
    case 'filled':
      return filled
    case 'quiet':
      return { ...filled, mode: 'schedule', start: { inDays: nextWeekday(), time: '21:00' }, dnd: DEFAULT_DND }
    case 'dnd-rules':
      return { ...filled, mode: 'schedule', start: { inDays: nextSaturday(), time: '10:00' }, dnd: BA_DND }
    case 'end':
      return {
        ...filled,
        mode: 'schedule',
        start: { inDays: nextWeekday(), time: '10:00' },
        end: { inDays: nextWeekday(), time: '12:00' },
      }
    case 'large-file':
      return { ...filled, file: { name: 'audience-cis-large.csv', text: LARGE_CSV } }
    case 'confirm':
      return { ...filled, open: 'confirm' }
    case 'submitting':
      return { ...filled, open: 'submitting' }
    case 'fail-dialog':
      return { ...filled, open: 'fail' }
    case 'leave':
      return { ...filled, open: 'leave' }
  }
}
