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
      return { file: filled.file, recipientType: 'cis' }
    case 'direct':
      return {
        file: { name: 'audience-direct.csv', text: DIRECT_CSV },
        recipientType: 'direct',
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
