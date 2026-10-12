/* Create / Edit notification — the form's values and how a record maps to
 * and from them. Ported from the cnh-tm-phase2 build's App (`toValues`,
 * `togglesOf`, `fromValues`, `stampImported`). */

import { CHANNELS, type Template, type TemplateStatus } from './templates'

export type FormValues = {
  templateName?: string
  templateDescription?: string
  productName?: string
  serviceCode?: string
  notificationGroup?: string
  status?: TemplateStatus
  remark?: string
  pushTitleTh?: string
  pushTitleEn?: string
  pushBodyTh?: string
  pushBodyEn?: string
  pushDeeplink?: string
  emailSubjectTh?: string
  emailSubjectEn?: string
  emailBodyTh?: string
  emailBodyEn?: string
  emailDisplayNameTh?: string
  emailDisplayNameEn?: string
  emailFromAddress?: string
  emailTemplateName?: string
  smsMessageTh?: string
  smsMessageEn?: string
}

/** Which channel cards are switched on. */
export type Toggles = { push: boolean; email: boolean; sms: boolean }

export const toValues = (t: Template): FormValues => ({
  templateName: t.name,
  templateDescription: t.description,
  productName: t.productName,
  serviceCode: t.detail.serviceCode,
  notificationGroup: t.detail.notificationGroup,
  status: t.status,
  remark: t.detail.remark,
  pushTitleTh: t.detail.pushTitleTh,
  pushTitleEn: t.detail.pushTitleEn,
  pushBodyTh: t.detail.pushBodyTh,
  pushBodyEn: t.detail.pushBodyEn,
  pushDeeplink: t.detail.pushDeeplink,
  emailSubjectTh: t.detail.emailSubjectTh,
  emailSubjectEn: t.detail.emailSubjectEn,
  emailBodyTh: t.detail.emailBodyTh,
  emailBodyEn: t.detail.emailBodyEn,
  emailDisplayNameTh: t.detail.emailDisplayNameTh,
  emailDisplayNameEn: t.detail.emailDisplayNameEn,
  emailFromAddress: t.detail.emailFromAddress,
  emailTemplateName: t.detail.emailTemplateName,
  smsMessageTh: t.detail.smsMessageTh,
  smsMessageEn: t.detail.smsMessageEn,
})

export const togglesOf = (t: Template): Toggles => ({
  push: t.channels.includes('Push notification'),
  email: t.channels.includes('Email'),
  sms: t.channels.includes('SMS'),
})

const stampsFor = (n: number) => {
  const running = String(n).padStart(4, '0')
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return {
    running,
    ymd: `${now.getFullYear()}${mm}${dd}`,
    dmy: `${dd} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`,
  }
}

/** An imported record gets the next running id and today's stamps. */
export const stampImported = (t: Template, n: number): Template => {
  const { running, ymd, dmy } = stampsFor(n)
  return {
    ...t,
    id: `TPL-${running}`,
    detail: {
      ...t.detail,
      templateRefCode: `${ymd}${running}`,
      createdBy: 'Panisa R.',
      updatedBy: 'Panisa R.',
      lastUpdated: dmy,
    },
  }
}

export const fromValues = (v: FormValues, toggles: Toggles, status: TemplateStatus, n: number): Template => {
  const { running, ymd, dmy } = stampsFor(n)
  const on = [toggles.push, toggles.email, toggles.sms]
  return {
    id: `TPL-${running}`,
    name: v.templateName ?? '',
    description: v.templateDescription ?? '',
    productName: v.productName ?? '',
    serviceCode: 'NACVS',
    channels: CHANNELS.filter((_, i) => on[i]),
    status,
    detail: {
      templateRefCode: `${ymd}${running}`,
      serviceCode: v.serviceCode ?? '',
      notificationGroup: v.notificationGroup ?? '',
      remark: v.remark ?? '',
      pushTitleTh: v.pushTitleTh ?? '',
      pushTitleEn: v.pushTitleEn ?? '',
      pushBodyTh: v.pushBodyTh ?? '',
      pushBodyEn: v.pushBodyEn ?? '',
      pushDeeplink: v.pushDeeplink ?? '',
      emailSubjectTh: v.emailSubjectTh ?? '',
      emailSubjectEn: v.emailSubjectEn ?? '',
      emailBodyTh: v.emailBodyTh ?? '',
      emailBodyEn: v.emailBodyEn ?? '',
      emailDisplayNameTh: v.emailDisplayNameTh ?? '',
      emailDisplayNameEn: v.emailDisplayNameEn ?? '',
      emailFromAddress: v.emailFromAddress ?? '',
      emailTemplateName: v.emailTemplateName ?? '',
      smsMessageTh: v.smsMessageTh ?? '',
      smsMessageEn: v.smsMessageEn ?? '',
      createdBy: 'Panisa R.',
      updatedBy: 'Panisa R.',
      lastUpdated: dmy,
    },
  }
}
