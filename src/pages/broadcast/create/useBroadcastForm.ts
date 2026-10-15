import { useEffect, useMemo, useState } from 'react'
import {
  BROADCAST_COPY,
  DEFAULT_DND,
  dndRule,
  checkRecipients,
  fieldsOf,
  firstSend,
  guessColumn,
  idKind,
  readAudience,
  readAudienceFile,
  type AudienceResult,
  type Broadcast,
  type BroadcastContent,
  type BroadcastStatus,
  type Dnd,
  type DndRule,
  type RecipientType,
} from '@/data/broadcast'
import { formSeed, type FormPreset, type FormSeed } from '@/data/broadcast-presets'
import { CHANNELS, type Channel } from '@/data/templates'
import type { SaveKind } from '../BroadcastWizard'

/* The Create / Edit broadcast form's state and rules — `useBroadcastForm` in the
 * original build, ported as is. Waits are the original's: the file is "checked"
 * for 600 ms, a submit takes 900 ms. */

const CHECK_MS = 600
const CREATE_MS = 900

export const CHANNEL_FIELDS: Record<Channel, (keyof BroadcastContent)[]> = {
  'Push notification': ['pushTitle', 'pushBody'],
  Email: ['emailSubject', 'emailBody'],
  SMS: ['smsMessage'],
}
export const DIRECT_CHANNELS: Channel[] = ['Email', 'SMS']
/** Each message box's maximum — the Template form's TH fields, which draft 2.2
 *  (Figma 70:6699, 15 Oct 2026) copies into the channel cards. */
export const CONTENT_MAX: Record<keyof BroadcastContent, number> = {
  pushTitle: 255,
  pushBody: 2048,
  emailSubject: 255,
  emailBody: 2048,
  smsMessage: 800,
}

const EMPTY_CONTENT: BroadcastContent = { smsMessage: '', emailSubject: '', emailBody: '', pushTitle: '', pushBody: '' }

export type FormErrors = Partial<
  Record<
    | 'name'
    | 'description'
    | 'file'
    | 'channels'
    | 'column'
    | keyof BroadcastContent
    | 'startDate'
    | 'startTime'
    | 'end'
    | `dndDays:${string}`
    | `dndTime:${string}`,
    string
  >
>
export type ErrorKey = keyof FormErrors

const pad = (n: number) => String(n).padStart(2, '0')
/** `YYYY-MM-DD` of a local date. */
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const iso = (d: Date) => `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
/** A `YYYY-MM-DD` date and an `HH:mm` time, as a local moment. */
const combine = (date: string, time: string) => {
  if (!date || !time) return null
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm, 0, 0)
}

const fromDraft = (b: Broadcast): FormSeed => ({
  file: b.audienceText === undefined ? undefined : { name: b.audienceFile, text: b.audienceText },
  recipientType: b.recipientType,
  column: b.recipientColumn,
  channels: b.channels,
  name: b.name,
  description: b.description,
  content: b.content,
  mode: b.startMode,
  dnd: b.dnd,
})

export function useBroadcastForm({
  onCreate,
  failNext,
  preset,
  initial,
}: {
  onCreate: (broadcast: Omit<Broadcast, 'id'>, kind: SaveKind) => void
  failNext?: boolean
  preset?: FormPreset
  initial?: Broadcast
}) {
  const [seed] = useState<FormSeed>(() => (initial ? fromDraft(initial) : preset ? formSeed(preset) : {}))
  const [errors, setErrors] = useState<FormErrors>({})
  const [name, setName] = useState(seed.name ?? '')
  const [description, setDescription] = useState(seed.description ?? '')
  const [file, setFile] = useState<File | null>(() =>
    seed.file ? new File([seed.file.text], seed.file.name, { type: 'text/csv' }) : null,
  )
  const [read, setRead] = useState<AudienceResult | null>(() =>
    seed.file ? readAudience(seed.file.name, seed.file.text) : null,
  )
  const [fileText, setFileText] = useState(seed.file?.text ?? '')
  const [recipientType, setType] = useState<RecipientType>(seed.recipientType ?? 'cis')
  const [column, setColumn] = useState(seed.column ?? '')
  const [channels, setChannels] = useState<Channel[]>(seed.channels ?? [])
  const [content, setContent] = useState<BroadcastContent>(seed.content ?? EMPTY_CONTENT)
  const [mode, setMode] = useState<'now' | 'schedule'>(seed.mode ?? 'now')
  const draftStart = initial?.startMode === 'schedule' ? new Date(initial.start) : null
  const [startDate, setStartDate] = useState(() => {
    if (draftStart) return ymd(draftStart)
    if (seed.start) {
      const d = new Date()
      d.setDate(d.getDate() + seed.start.inDays)
      return ymd(d)
    }
    return ''
  })
  const [startTime, setStartTime] = useState(() =>
    draftStart ? `${pad(draftStart.getHours())}:${pad(draftStart.getMinutes())}` : (seed.start?.time ?? ''),
  )
  /** Broadcast End, `YYYY-MM-DDTHH:mm` or '' for none. */
  const [end, setEnd] = useState(() => {
    if (initial) return initial.end ?? ''
    if (!seed.end) return ''
    const d = new Date()
    d.setDate(d.getDate() + seed.end.inDays)
    return `${ymd(d)}T${seed.end.time}`
  })
  const [dnd, setDnd] = useState<Dnd>(seed.dnd ?? DEFAULT_DND)
  const [leaveOpen, setLeaveOpen] = useState(seed.open === 'leave')
  const [confirmOpen, setConfirmOpen] = useState(seed.open === 'confirm')
  const [creating, setCreating] = useState(seed.open === 'submitting')
  const [failed, setFailed] = useState(seed.open === 'fail')
  const [failPending, setFailPending] = useState(!!failNext)

  const audience = read && read.ok ? read.audience : null
  const kind = idKind(recipientType, channels)
  const check = useMemo(
    () => (audience && column && kind ? checkRecipients(audience, column, kind) : null),
    [audience, column, kind],
  )
  const fields = useMemo(() => fieldsOf(audience, column), [audience, column])
  const checking = file !== null && read === null
  const dirty = !!(file || name || description || channels.length || Object.values(content).some(Boolean))
  const offered = recipientType === 'direct' ? DIRECT_CHANNELS : [...CHANNELS]

  const clear = (...keys: ErrorKey[]) =>
    setErrors((prev) => {
      const next = { ...prev }
      for (const k of keys) delete next[k]
      return next
    })
  /** A setter that also clears its own error. */
  const edit =
    <T,>(key: ErrorKey, set: (v: T) => void) =>
    (v: T) => {
      set(v)
      clear(key)
    }
  const setC = (key: keyof BroadcastContent) => edit<string>(key, (v) => setContent((c) => ({ ...c, [key]: v })))

  const pick = (list: FileList | null | undefined) => {
    const f = list?.[0]
    if (!f) return
    setFile(f)
    setRead(null)
    setFileText('')
    f.text().then(setFileText, () => setFileText(''))
    clear('file', 'column')
    readAudienceFile(f).then((result) =>
      window.setTimeout(() => {
        setRead(result)
        setColumn(result.ok && kind ? guessColumn(result.audience.headers, kind) : '')
      }, CHECK_MS),
    )
  }
  const clearFile = () => {
    setFile(null)
    setRead(null)
    setFileText('')
    setColumn('')
  }

  const setRecipientType = (type: RecipientType) => {
    setType(type)
    const next = type === 'direct' ? channels.filter((c) => DIRECT_CHANNELS.includes(c)).slice(0, 1) : channels
    setChannels(next)
    const k = idKind(type, next)
    setColumn(audience && k ? guessColumn(audience.headers, k) : '')
    clear('channels', 'column', 'file')
  }
  const toggleChannel = (channel: Channel, on: boolean) => {
    setChannels((prev) => (on ? CHANNELS.filter((c) => c === channel || prev.includes(c)) : prev.filter((c) => c !== channel)))
    clear('channels', ...(on ? [] : CHANNEL_FIELDS[channel]))
  }
  const chooseDirect = (channel: Channel) => {
    setChannels([channel])
    const k = idKind('direct', [channel])
    if (audience && k) setColumn(guessColumn(audience.headers, k) || column)
    clear('channels', 'column', 'file', ...CHANNEL_FIELDS[channel === 'SMS' ? 'Email' : 'SMS'])
  }
  /** A channel card's switch. Direct recipient sends by Email or SMS, never
   *  both, so switching one on there switches the other off. */
  const setChannel = (channel: Channel, on: boolean) =>
    recipientType === 'direct' && on ? chooseDirect(channel) : toggleChannel(channel, on)

  const start = mode === 'now' ? new Date() : combine(startDate, startTime)
  const first = start ? firstSend(start, dnd) : null
  const waits = !!(start && first && first.getTime() !== start.getTime())

  const setDndEnabled = (enabled: boolean) => {
    setDnd((d) => ({ ...d, enabled }))
    clear(...dnd.rules.flatMap((r) => [`dndDays:${r.id}`, `dndTime:${r.id}`] as ErrorKey[]))
  }
  const setDndTimeZone = (timeZone: string) => setDnd((d) => ({ ...d, timeZone }))
  const setDndRule = (id: string, part: Partial<DndRule>) => {
    setDnd((d) => ({ ...d, rules: d.rules.map((r) => (r.id === id ? { ...r, ...part } : r)) }))
    clear(`dndDays:${id}`, `dndTime:${id}`)
  }
  const addDndRule = () => setDnd((d) => ({ ...d, rules: [...d.rules, dndRule()] }))
  const removeDndRule = (id: string) => {
    setDnd((d) => ({ ...d, rules: d.rules.filter((r) => r.id !== id) }))
    clear(`dndDays:${id}`, `dndTime:${id}`)
  }

  const validate = () => {
    const e: FormErrors = {}
    if (!name.trim()) e.name = BROADCAST_COPY.required
    else if (name.length > 100) e.name = BROADCAST_COPY.msgMax(100)
    if (description.length > 250) e.description = BROADCAST_COPY.msgMax(250)
    if (!file) e.file = BROADCAST_COPY.noFile
    else if (read && !read.ok) e.file = read.message
    if (recipientType === 'direct' && !channels.length) e.channels = BROADCAST_COPY.noDirectChannel
    else if (!channels.length) e.channels = BROADCAST_COPY.noChannel
    if (audience && kind && !column) e.column = BROADCAST_COPY.noColumn
    if (check && check.valid === 0) e.file = BROADCAST_COPY.noValidRows
    for (const c of channels)
      for (const k of CHANNEL_FIELDS[c])
        if (!content[k].trim()) e[k] = BROADCAST_COPY.required
        else if (content[k].length > CONTENT_MAX[k]) e[k] = BROADCAST_COPY.msgMax(CONTENT_MAX[k])
    if (mode === 'schedule') {
      if (!startDate) e.startDate = BROADCAST_COPY.required
      if (!startTime) e.startTime = BROADCAST_COPY.required
      if (start && start <= new Date()) e.startDate = BROADCAST_COPY.startPast
    }
    if (end && start && new Date(end) <= start) e.end = BROADCAST_COPY.endBeforeStart
    if (dnd.enabled)
      for (const rule of dnd.rules) {
        if (!rule.days.length) e[`dndDays:${rule.id}`] = BROADCAST_COPY.dndNoDay
        if (!rule.allDay && rule.from === rule.to) e[`dndTime:${rule.id}`] = BROADCAST_COPY.dndSame
      }
    return e
  }

  const scrollToError = (root: HTMLElement | null) =>
    requestAnimationFrame(() =>
      root?.querySelector('[data-error="true"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
    )

  const submit = (root: HTMLElement | null) => {
    if (checking) return
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return scrollToError(root)
    setConfirmOpen(true)
  }

  const record = (status: BroadcastStatus): Omit<Broadcast, 'id'> => ({
    name: name.trim(),
    description: description.trim(),
    channels: CHANNELS.filter((c) => channels.includes(c)),
    audienceFile: file?.name ?? '',
    audienceText: file ? fileText : undefined,
    recipients: check?.valid ?? 0,
    recipientType,
    recipientColumn: column,
    startMode: mode,
    start: iso(start ?? new Date()),
    end: end || undefined,
    dnd,
    status,
    success: 0,
    failed: 0,
    content,
    createdBy: initial?.createdBy ?? 'Panisa R.',
    createdAt: initial?.createdAt ?? iso(new Date()),
  })

  const create = () => {
    setConfirmOpen(false)
    setCreating(true)
    window.setTimeout(() => {
      setCreating(false)
      if (failPending) {
        setFailPending(false)
        setFailed(true)
        return
      }
      onCreate(record(mode === 'now' && !waits ? 'Sending' : 'Scheduled'), 'submit')
    }, CREATE_MS)
  }

  const saveDraft = (root: HTMLElement | null) => {
    if (!name.trim()) {
      setErrors({ name: BROADCAST_COPY.draftNeedsName })
      return scrollToError(root)
    }
    onCreate(record('Draft'), 'draft')
  }

  useEffect(() => {
    if (seed.press === 'submit') submit(null)
    if (seed.press === 'draft') saveDraft(null)
    // Runs once: a preset presses its button on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    editing: !!initial,
    errors,
    clear,
    edit,
    setC,
    name,
    setName,
    description,
    setDescription,
    file,
    read,
    audience,
    check,
    checking,
    pick,
    clearFile,
    recipientType,
    setRecipientType,
    column,
    setColumn,
    kind,
    offered,
    channels,
    toggleChannel,
    chooseDirect,
    setChannel,
    content,
    fields,
    mode,
    setMode,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    start,
    first,
    waits,
    end,
    setEnd,
    dnd,
    setDndEnabled,
    setDndTimeZone,
    setDndRule,
    addDndRule,
    removeDndRule,
    dirty,
    leaveOpen,
    setLeaveOpen,
    confirmOpen,
    setConfirmOpen,
    creating,
    failed,
    setFailed,
    submit,
    create,
    saveDraft,
  }
}

export type BroadcastForm = ReturnType<typeof useBroadcastForm>
