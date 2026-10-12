/* Notification templates — the Phase 1 list's records.
 * Ported from the cnh-tm-phase2 build (.reference/cnh-tm-phase2/app-extract.js,
 * `CHANNELS` … `toJsonl`). Values are transcribed, not composed. */

export const CHANNELS = ['Push notification', 'Email', 'SMS'] as const
export type Channel = (typeof CHANNELS)[number]

export const STATUSES = ['Inactive', 'Published', 'Draft'] as const
export type TemplateStatus = (typeof STATUSES)[number]

export const SERVICE_CODE_LOV = ['NANOTI', 'NAOTP', 'NABATCH', 'NAMKTNOTI', 'NAMKTBATCH']
export const NOTIFICATION_GROUP_LOV = [
  'Transactions',
  'Promotions',
  'Services',
  'Security',
  'System updates',
  'Reminders',
  'Customer engagement',
]

export type TemplateDetail = {
  templateRefCode: string
  serviceCode: string
  notificationGroup: string
  remark: string
  pushTitleTh: string
  pushTitleEn: string
  pushBodyTh: string
  pushBodyEn: string
  pushDeeplink: string
  emailSubjectTh: string
  emailSubjectEn: string
  emailBodyTh: string
  emailBodyEn: string
  emailDisplayNameTh: string
  emailDisplayNameEn: string
  emailFromAddress: string
  emailTemplateName: string
  smsMessageTh: string
  smsMessageEn: string
  createdBy: string
  updatedBy: string
  lastUpdated: string
}

export type Template = {
  id: string
  name: string
  description: string
  productName: string
  serviceCode: string
  channels: Channel[]
  status: TemplateStatus
  detail: TemplateDetail
}

const SEED: [string, string, Channel[], TemplateStatus, string][] = [
  ['Promotion offer', 'แจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่ พร้อมเวลาและสถานที่', ['Push notification', 'Email'], 'Draft', 'M Credit Card'],
  ['Limit exceeded', 'แจ้งเตือนเมื่อชำระเงินไม่สำเร็จ พร้อมสาเหตุและวิธีแก้ไข', ['SMS'], 'Inactive', 'AIA'],
  ['Device registered', 'แจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่ พร้อมเวลาและสถานที่ พร้อมเวลาและสถานที่', ['SMS'], 'Published', 'AIA'],
  ['Login alert', 'แจ้งเตือนเมื่อเปิดใช้งานบัตรใหม่สำเร็จ', ['Email'], 'Draft', 'M Credit Card'],
  ['Limit exceeded', 'แจ้งเตือนเมื่อมีการผูกอุปกรณ์ใหม่เข้ากับบัญชี', ['Push notification', 'Email', 'SMS'], 'Draft', 'M Credit Card'],
  ['Device registered', 'แจ้งเตือนเมื่อเปิดใช้งานบัตรใหม่สำเร็จ', ['Email'], 'Draft', 'M Credit Card'],
  ['Promotion offer', 'แจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่ พร้อมเวลาและสถานที่', ['Email'], 'Draft', 'M Credit Card'],
  ['Transfer success', 'แจ้งเตือนเมื่อมีการผูกอุปกรณ์ใหม่เข้ากับบัญชี', ['SMS'], 'Draft', 'M Credit Card'],
  ['Promotion offer', 'แจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่ พร้อมเวลาและสถานที่', ['Push notification', 'Email'], 'Published', 'M Credit Card'],
  ['Transfer success', 'แจ้งเตือนเมื่อชำระเงินไม่สำเร็จ พร้อมสาเหตุและวิธีแก้ไข', ['Push notification', 'Email'], 'Draft', 'M Credit Card'],
  ['Transfer success', 'แจ้งเตือนเมื่อชำระเงินไม่สำเร็จ พร้อมสาเหตุและวิธีแก้ไข', ['Push notification', 'Email'], 'Draft', 'M Credit Card'],
]

export const SERVICE_CODE = 'NACVS'

export const TEMPLATES: Template[] = Array.from({ length: 200 }, (_, i) => {
  const [name, description, channels, status, productName] = SEED[i % SEED.length]
  const running = String(i + 1).padStart(4, '0')
  return {
    id: `TPL-${running}`,
    name,
    description,
    productName,
    serviceCode: SERVICE_CODE,
    channels,
    status,
    detail: {
      templateRefCode: `20260827${running}`,
      serviceCode: SERVICE_CODE_LOV[i % SERVICE_CODE_LOV.length],
      notificationGroup: 'Transactions',
      remark: 'สำหรับลูกค้า Postpaid ทุกแพ็กเกจ',
      pushTitleTh: `แจ้งเตือน${name}`,
      pushTitleEn: `${name} Notification`,
      pushBodyTh: description,
      pushBodyEn: `Notification body in English for ${name}.`,
      pushDeeplink: 'bualuang://notification/detail',
      emailSubjectTh: `แจ้งเตือน${name}`,
      emailSubjectEn: name,
      emailBodyTh: description,
      emailBodyEn: 'NABKG',
      emailDisplayNameTh: 'https://cdn.bbl/th/0700123430.html',
      emailDisplayNameEn: 'https://cdn.bbl/th/0700123430.html',
      emailFromAddress: '',
      emailTemplateName: name.slice(0, 20),
      smsMessageTh: description,
      smsMessageEn: `Notification body in English for ${name}.`,
      createdBy: 'Paratchaporn U.',
      updatedBy: 'Paratchaporn U.',
      lastUpdated: '05 Mar 2026',
    },
  }
})

export const EMPTY_DETAIL: TemplateDetail = {
  templateRefCode: '',
  serviceCode: '',
  notificationGroup: '',
  remark: '',
  pushTitleTh: '',
  pushTitleEn: '',
  pushBodyTh: '',
  pushBodyEn: '',
  pushDeeplink: '',
  emailSubjectTh: '',
  emailSubjectEn: '',
  emailBodyTh: '',
  emailBodyEn: '',
  emailDisplayNameTh: '',
  emailDisplayNameEn: '',
  emailFromAddress: '',
  emailTemplateName: '',
  smsMessageTh: '',
  smsMessageEn: '',
  createdBy: '',
  updatedBy: '',
  lastUpdated: '',
}

/* The export format — the record the list downloads and Import reads back. */
export const CHANNEL_CODE: Record<string, Channel> = { PUSH: 'Push notification', EMAIL: 'Email', SMS: 'SMS' }
export const CODE_OF = Object.fromEntries(
  Object.entries(CHANNEL_CODE).map(([code, channel]) => [channel, code]),
) as Record<Channel, string>

export type TemplateLanguage = {
  language: 'en' | 'th'
  smsMessage: string | null
  emailFrom: string | null
  emailFromDisplayName: string | null
  emailSubject: string | null
  emailBody: string | null
  emailAttachmentURL: null
  pushGroup: null
  pushTitle: string | null
  pushMessage: string | null
  pushDeepLink: string | null
  alertReferenceName: null
}

export type TemplateExport = {
  recordType: 'TEMPLATE'
  templateRefCode: string
  serviceCodes: string[]
  notificationGroupName: string | null
  templateName: string
  channels: string[]
  productName: string | null
  status: string
  description: string
  remark: string | null
  templateLanguages: TemplateLanguage[]
  templateMaskingFields: unknown[]
  templateDefaultFields: unknown[]
}

export function toExport(t: Template): TemplateExport {
  const d = t.detail
  const orNull = (v: string) => v || null
  const lang = (language: 'en' | 'th'): TemplateLanguage => ({
    language,
    smsMessage: orNull(language === 'th' ? d.smsMessageTh : d.smsMessageEn),
    emailFrom: orNull(d.emailFromAddress),
    emailFromDisplayName: orNull(language === 'th' ? d.emailDisplayNameTh : d.emailDisplayNameEn),
    emailSubject: orNull(language === 'th' ? d.emailSubjectTh : d.emailSubjectEn),
    emailBody: orNull(language === 'th' ? d.emailBodyTh : d.emailBodyEn),
    emailAttachmentURL: null,
    pushGroup: null,
    pushTitle: orNull(language === 'th' ? d.pushTitleTh : d.pushTitleEn),
    pushMessage: orNull(language === 'th' ? d.pushBodyTh : d.pushBodyEn),
    pushDeepLink: orNull(d.pushDeeplink),
    alertReferenceName: null,
  })
  return {
    recordType: 'TEMPLATE',
    templateRefCode: d.templateRefCode,
    serviceCodes: [d.serviceCode || t.serviceCode],
    notificationGroupName: orNull(d.notificationGroup),
    templateName: t.name,
    channels: t.channels.map((c) => CODE_OF[c]),
    productName: orNull(t.productName),
    status: t.status === 'Published' ? 'ACTIVE' : t.status.toUpperCase(),
    description: t.description,
    remark: orNull(d.remark),
    templateLanguages: [lang('en'), lang('th')],
    templateMaskingFields: [],
    templateDefaultFields: [],
  }
}

export const FILE_EXT = '.jsonl'
export const toJsonl = (records: unknown[]) => records.map((r) => JSON.stringify(r)).join('\n') + '\n'
