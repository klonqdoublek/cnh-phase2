import { useEffect, useMemo, useState } from 'react'
import {
  BROADCAST_COPY,
  DEFAULT_DND,
  dndRule,
  checkAudience,
  columnHolds,
  fieldsOf,
  dndNeverSends,
  firstSend,
  idKind,
  readAudience,
  readAudienceFile,
  type AudienceResult,
  type Broadcast,
  type BroadcastContent,
  type BroadcastStatus,
  type Dnd,
  type DndRule,
  type RecipientCheck,
  type RecipientType,
} from '@/data/broadcast'
import { formSeed, type FormPreset, type FormSeed } from '@/data/broadcast-presets'
import { CHANNELS, type Channel } from '@/data/templates'
import type { SaveKind } from '../BroadcastWizard'

/* The Create / Edit broadcast form's state and rules — `useBroadcastForm` in the
 * original build, ported as is. Waits are the original's: the file is "checked"
 * for 600 ms, a submit takes 900 ms. Since 19 Oct 2026 (BA) a pick checks only
 * type and size; Submit reads the whole file, for the same 600 ms, before the
 * confirm dialog. */

const CHECK_MS = 600
const CREATE_MS = 900

export const CHANNEL_FIELDS: Record<Channel, (keyof BroadcastContent)[]> = {
  'Push notification': ['pushTitle', 'pushBody'],
  Email: ['emailSubject', 'emailBody'],
  SMS: ['smsMessage'],
}
export const DIRECT_CHANNELS: Channel[] = ['Email', 'SMS']
/** Each message box's maximum — the Template form's TH fields, which draft 2.2
 *  (Figma 85:19401, 15 Oct 2026) copies into the channel cards. */
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
  adaptSeed = (s) => s,
}: {
  onCreate: (broadcast: Omit<Broadcast, 'id'>, kind: SaveKind) => void
  failNext?: boolean
  preset?: FormPreset
  initial?: Broadcast
  /** Prototype only: lets the Prototype control swap the seeded file. */
  adaptSeed?: (seed: FormSeed) => FormSeed
}) {
  const [seed] = useState<FormSeed>(() => adaptSeed(initial ? fromDraft(initial) : preset ? formSeed(preset) : {}))
  /* Errors are the last Submit's (or Save draft's) and stay until the next
   * one, while the user types or switches a channel on: CNH Phase 1 "Error
   * behavior" (Figma JjvzdUwg5LlKHDQvo2fny0 123:95723, requester 22 Oct 2026).
   * Only a field that goes away (a channel switched off, a quiet period
   * removed, Send as soon as possible) drops its error. */
  const [errors, setErrors] = useState<FormErrors>(() => (seed.errors as FormErrors) ?? {})
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
  // New broadcasts start with Do Not Disturb off; its default period waits, disabled, under the switch (requester, 22 Oct 2026).
  const [dnd, setDnd] = useState<Dnd>(seed.dnd ?? { ...DEFAULT_DND, enabled: false })
  const [leaveOpen, setLeaveOpen] = useState(seed.open === 'leave')
  const [confirmOpen, setConfirmOpen] = useState(seed.open === 'confirm')
  const [creating, setCreating] = useState(seed.open === 'submitting')
  const [failed, setFailed] = useState(seed.open === 'fail')
  const [failPending, setFailPending] = useState(!!failNext)

  const audience = read && read.ok ? read.audience : null
  const kind = idKind(recipientType, channels)
  /** The full read on Submit; a preset that opens on its result runs it on arrival. */
  const [arrival] = useState(() =>
    (seed.open === 'confirm' || seed.open === 'blocked') && audience && column && kind
      ? checkAudience(audience, column, kind)
      : null,
  )
  const [check, setCheck] = useState<RecipientCheck | null>(arrival?.ok ? arrival.check : null)
  const [readingFile, setReadingFile] = useState(seed.open === 'checking')
  const [blocked, setBlocked] = useState<string | null>(arrival && !arrival.ok ? arrival.message : null)
  const [checkFailed, setCheckFailed] = useState(seed.open === 'check-fail')
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
  const setC = (key: keyof BroadcastContent) => (v: string) => setContent((c) => ({ ...c, [key]: v }))

  const pick = (list: FileList | null | undefined) => {
    const f = list?.[0]
    if (!f) return
    setFile(f)
    setRead(null)
    setFileText('')
    setColumn('')
    f.text().then(setFileText, () => setFileText(''))
    readAudienceFile(f).then((result) => window.setTimeout(() => setRead(result), CHECK_MS))
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
    setColumn('')
    /* The channel message names the recipient type ("Select Email or SMS"). */
    clear('channels')
  }
  const toggleChannel = (channel: Channel, on: boolean) => {
    setChannels((prev) => (on ? CHANNELS.filter((c) => c === channel || prev.includes(c)) : prev.filter((c) => c !== channel)))
    if (!on) clear(...CHANNEL_FIELDS[channel])
  }
  const chooseDirect = (channel: Channel) => {
    setChannels([channel])
    if (idKind('direct', [channel]) !== kind) setColumn('')
    clear(...CHANNEL_FIELDS[channel === 'SMS' ? 'Email' : 'SMS'])
  }
  /** A channel card's switch. Direct recipient sends by Email or SMS, never
   *  both, so switching one on there switches the other off. */
  const setChannel = (channel: Channel, on: boolean) =>
    recipientType === 'direct' && on ? chooseDirect(channel) : toggleChannel(channel, on)

  const start = mode === 'now' ? new Date() : combine(startDate, startTime)
  /** Broadcast End belongs to Schedule delivery only (requester, 15 Oct 2026):
   *  Send as soon as possible has no end. The typed value is kept, so
   *  switching back to Schedule delivery brings it back. */
  const endUsed = mode === 'schedule' ? end : ''
  const first = start ? firstSend(start, dnd) : null
  const waits = !!(start && first && first.getTime() !== start.getTime())
  /** Do Not Disturb leaves no time to send: a warning only, Submit still goes ahead. */
  const neverSends = useMemo(() => dndNeverSends(dnd), [dnd])

  const setDndEnabled = (enabled: boolean) => {
    setDnd((d) => ({ ...d, enabled }))
    clear(...dnd.rules.flatMap((r) => [`dndDays:${r.id}`, `dndTime:${r.id}`] as ErrorKey[]))
  }
  const setDndTimeZone = (timeZone: string) => setDnd((d) => ({ ...d, timeZone }))
  const setDndRule = (id: string, part: Partial<DndRule>) => {
    setDnd((d) => ({ ...d, rules: d.rules.map((r) => (r.id === id ? { ...r, ...part } : r)) }))
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
    if (audience?.headers.length && kind && !column) e.column = BROADCAST_COPY.noColumn
    for (const c of channels)
      for (const k of CHANNEL_FIELDS[c])
        if (!content[k].trim()) e[k] = BROADCAST_COPY.required
        else if (content[k].length > CONTENT_MAX[k]) e[k] = BROADCAST_COPY.msgMax(CONTENT_MAX[k])
    if (mode === 'schedule') {
      if (!startDate) e.startDate = BROADCAST_COPY.required
      if (!startTime) e.startTime = BROADCAST_COPY.required
      if (start && start <= new Date()) e.startDate = BROADCAST_COPY.startPast
    }
    if (endUsed && start && new Date(endUsed) <= start) e.end = BROADCAST_COPY.endBeforeStart
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

  /** Read the whole file: a file that cannot be used blocks the broadcast,
   *  otherwise its result goes into the confirm dialog. */
  const readFile = () => {
    if (!audience || !kind) return
    setCheck(null)
    setReadingFile(true)
    window.setTimeout(() => {
      setReadingFile(false)
      /* PROPOSAL, pending BA (Q15): a Direct column that holds the other channel's
       * contacts, such as SMS with the email column, is a wrong column, not a bad file. */
      const holds = columnHolds(audience, column)
      if (holds && (kind === 'mobile' || kind === 'email') && holds !== kind) {
        setErrors((prev) => ({ ...prev, column: BROADCAST_COPY.wrongColumn(column, holds, kind) }))
        return scrollToError(document.body)
      }
      const result = checkAudience(audience, column, kind)
      if (!result.ok) return setBlocked(result.message)
      setCheck(result.check)
      setConfirmOpen(true)
    }, CHECK_MS)
  }

  /** Close on the blocked dialog: the reason stays on Step 2, scrolled to. */
  const closeBlocked = () => {
    if (blocked) setErrors((prev) => ({ ...prev, file: blocked }))
    setBlocked(null)
    scrollToError(document.body)
  }

  const submit = (root: HTMLElement | null) => {
    if (checking || readingFile) return
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return scrollToError(root)
    readFile()
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
    end: endUsed || undefined,
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
      onCreate(record(mode === 'now' && !waits ? 'Processing' : 'Queue'), 'submit')
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
    neverSends,
    waits,
    end: endUsed,
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
    readingFile,
    readFile,
    blocked,
    closeBlocked,
    checkFailed,
    setCheckFailed,
    creating,
    failed,
    setFailed,
    submit,
    create,
    saveDraft,
  }
}

export type BroadcastForm = ReturnType<typeof useBroadcastForm>
