import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { UploadZone } from '@/components/upload/UploadZone'
import { UploadedFile } from '@/components/upload/UploadedFile'
import { DateTimeInput } from '@/components/fields/DateTimeInput'
import { TimeInput } from '@/components/fields/TimeInput'
import { Alert } from '@/bbl/alert'
import { CardSurface } from '@/bbl/building-block-card-surface'
import { ContainedIconButton } from '@/bbl/contained-icon-button'
import { FieldLabel } from '@/bbl/field'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { InlineMessage } from '@/bbl/inline-message'
import { OutlineButton } from '@/bbl/outline-button'
import { ScrollBar } from '@/bbl/scroll-bar'
import { TableDataCell } from '@/bbl/table-data-cell'
import { TableHeaderCell } from '@/bbl/table-header-cell'
import { ToggleSwitch } from '@/bbl/toggle-switch'
import { FormField } from '@/patterns/form-field'
import { PICKER_DIALOG_COPY_EN } from '@/patterns/picker-dialog'
import { SelectList } from '@/patterns/select-list'
import { FormSectionCard } from '@/patterns/form-section-card'
import { InfoNote } from '@/patterns/info-note'
import { FormStep } from '@/patterns/console-page'
import {
  BROADCAST_COPY,
  DAYS,
  ID_LABEL,
  RECIPIENT_TYPE_LABEL,
  TIME_ZONES,
  endsNextDay,
  fmtDateTime,
  isMessageBox,
  type BroadcastContent,
  type DndRule,
  type RecipientType as RecipientTypeValue,
} from '@/data/broadcast'
import { SERVICE_CODE_LOV, type Channel } from '@/data/templates'
import { cn } from '@/lib/cn'
import { Choice, LABEL, ModeOption, NOTE, Select, Text } from './fields'
import type { Tint } from './highlight'
import { TRIGGER, useFieldShortcut } from './shortcut'
import { CONTENT_MAX, ymd, type BroadcastForm } from './useBroadcastForm'

/* The Create broadcast steps, laid out as draft 2.2 webds-matched (Figma
 * 85:19401, 15 Oct 2026): the audience step carries the message content —
 * the channel cards, each with its `+` for a dynamic field — and channels are
 * switched on their own cards. */

type F = { f: BroadcastForm }
/** The message box the cursor was last in, so a card's `+` knows where to insert. */
export type FocusRef = React.MutableRefObject<{ key: string; el: HTMLInputElement | HTMLTextAreaElement } | null>

const sizeLabel = (bytes: number) =>
  bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

/** One "Step N" — webds `FormStep`, its note under the heading. The step's
 *  card is the caller's: a titled `FormSectionCard`. */
export function Section({
  title,
  note,
  alert,
  children,
}: {
  title: string
  note?: string
  alert?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <FormStep
      title={
        note ? (
          <span className="flex flex-col gap-[var(--space-1)]">
            <span>{title}</span>
            <span className={NOTE}>{note}</span>
          </span>
        ) : (
          title
        )
      }
      alert={alert}
    >
      {children}
    </FormStep>
  )
}

/* ── Step 1 ─────────────────────────────────────────────────────────────── */

export function BasicInfo({ f }: F) {
  return (
    <FormSectionCard title="General information" rowGap={4}>
      <Text
        id="name"
        label="Broadcast name"
        required
        value={f.name}
        max={100}
        error={f.errors.name}
        placeholder="e.g. October Customer Campaign"
        onChange={f.setName}
      />
      <Text
        id="description"
        label="Description"
        value={f.description}
        max={250}
        error={f.errors.description}
        placeholder="What this broadcast is for"
        onChange={f.setDescription}
      />
    </FormSectionCard>
  )
}

/* ── Step 2 ─────────────────────────────────────────────────────────────── */

/** Service code, recipient type, the upload (its preview under the file) and
 *  the ID column, one under the other at full width (requester, 22 Oct 2026:
 *  top to bottom). The upload is the CMS prototype's zone and file slot
 *  (components/upload) — webds ships no upload control (gap). */
export function AudienceFile({ f }: F) {
  return (
    <FormSectionCard title="Upload Audience file">
      <ServiceCode f={f} />
      <RecipientType f={f} />
      <div data-error={f.errors.file ? 'true' : undefined} className="flex min-w-0 flex-col gap-[var(--space-2)]">
        <FieldLabel required>Upload File</FieldLabel>
        {f.file ? (
          <FileResult f={f} />
        ) : (
          <UploadZone
            buttonLabel={BROADCAST_COPY.browse}
            hint={[BROADCAST_COPY.dropTitle, BROADCAST_COPY.dropHint]}
            accept=".csv,.xlsx,text/csv"
            /* One file at a time (BA MoM, 29 Oct 2026): a drag of two or more turns the
               zone Negative with "1 File Only", held after the drop, as Import's zone. */
            maxFiles={1}
            tooManyHint={BROADCAST_COPY.oneFile}
            error={f.tooMany || !!f.errors.file}
            errorHint={f.tooMany ? BROADCAST_COPY.oneFile : undefined}
            onFiles={f.pick}
            className="min-h-[164px]"
          />
        )}
        {f.errors.file && (
          <InlineMessage appearance="negative" size="s">
            {f.errors.file}
          </InlineMessage>
        )}
      </div>
      <ColumnSelect f={f} />
    </FormSectionCard>
  )
}

/** The file row and its preview. A pick checks type and size only (BA,
 *  19 Oct 2026), so nothing here counts rows; the full read is on Submit.
 *  No "File validated" beside the size (design critique, 27 Oct 2026): a
 *  file that fails the pick is never placed, so the tick said nothing. */
function FileResult({ f }: F) {
  const file = f.file!
  const bad = !!f.read && !f.read.ok
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <UploadedFile
        name={file.name}
        error={bad}
        meta={
          f.read
            ? f.read.ok
              ? sizeLabel(file.size)
              : f.read.message
            : BROADCAST_COPY.checking
        }
        onRemove={f.clearFile}
      />
      {f.checking && (
        <div className="flex justify-center p-[var(--space-4)]">
          <SpinnerLoader size="m" appearance="brand" />
        </div>
      )}
      {f.audience && <Preview f={f} />}
    </div>
  )
}

/** The whole file in a box five rows tall at the column's width; the rest
 *  scrolls, both ways, under a header that stays put. The selected ID column
 *  is not marked (requirement update, 21 Oct 2026). */
function Preview({ f }: F) {
  const a = f.audience!
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <span className={LABEL}>{BROADCAST_COPY.previewTitle}</span>
      <MiniTable
        columns={a.headers}
        widths={a.headers.map((_, i) => (i === a.headers.length - 1 ? 'minmax(max-content,1fr)' : 'max-content')).join(' ')}
        rows={a.rows.map((r) => a.headers.map((_, i) => r[i] ?? ''))}
        visibleRows={5}
      />
    </div>
  )
}

/** A box that scrolls both ways under the library's Scroll Bars instead of
 *  the browser's. The browser's are hidden: on macOS they are overlays that
 *  stay out of sight until a scroll starts, so a freshly uploaded preview
 *  said nothing about the rows below or the columns to the right. The bars
 *  show as soon as the content overflows. webds' `ScrollBar` only draws a
 *  position (gap), so pressing or dragging a track is wired here: the thumb
 *  centres on the pointer. */
function ScrollBox({ maxHeight, children }: { maxHeight: string; children: React.ReactNode }) {
  const view = useRef<HTMLDivElement>(null)
  type Thumb = { size: number; offset: number } | null
  const [bars, setBars] = useState<{ x: Thumb; y: Thumb }>({ x: null, y: null })

  const measure = useCallback(() => {
    const el = view.current
    if (!el) return
    const thumb = (client: number, total: number, pos: number): Thumb => {
      if (total <= client + 1) return null
      /* A floor of 15%, or a 100-row file draws a thumb too short to see. */
      const size = Math.max(15, (client / total) * 100)
      return { size, offset: (pos / (total - client)) * (100 - size) }
    }
    setBars({
      x: thumb(el.clientWidth, el.scrollWidth, el.scrollLeft),
      y: thumb(el.clientHeight, el.scrollHeight, el.scrollTop),
    })
  }, [])

  useLayoutEffect(() => {
    const el = view.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => {
      el.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [measure])

  const press = (axis: 'x' | 'y') => (e: React.PointerEvent<HTMLDivElement>) => {
    const track = e.currentTarget
    const el = view.current
    if (!el) return
    e.preventDefault()
    track.setPointerCapture(e.pointerId)
    const to = (ev: PointerEvent) => {
      const r = track.getBoundingClientRect()
      if (axis === 'x') el.scrollLeft = ((ev.clientX - r.left) / r.width) * el.scrollWidth - el.clientWidth / 2
      else el.scrollTop = ((ev.clientY - r.top) / r.height) * el.scrollHeight - el.clientHeight / 2
    }
    to(e.nativeEvent)
    const up = () => {
      track.removeEventListener('pointermove', to)
      track.removeEventListener('pointerup', up)
    }
    track.addEventListener('pointermove', to)
    track.addEventListener('pointerup', up)
  }

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-[var(--radius-2)] border border-[var(--color-border-primary-default)]">
      <div
        ref={view}
        className="min-w-0 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maxHeight }}
      >
        {children}
      </div>
      {bars.y ? (
        <div className="flex cursor-pointer touch-none" onPointerDown={press('y')}>
          <ScrollBar appearance="thick" orientation="vertical" thumbSize={`${bars.y.size}%`} thumbOffset={`${bars.y.offset}%`} />
        </div>
      ) : (
        <span />
      )}
      {bars.x && (
        <div className="flex cursor-pointer touch-none flex-col" onPointerDown={press('x')}>
          <ScrollBar appearance="thick" orientation="horizontal" thumbSize={`${bars.x.size}%`} thumbOffset={`${bars.x.offset}%`} />
        </div>
      )}
    </div>
  )
}

/** webds Table Header / Data Cells at a compact row height in a bordered grid.
 *  The cells' own 64 row is the data grid's; a validation list inside a card
 *  reads at 36 — the original's own reason for not using its Table. */
export function MiniTable({
  columns,
  rows,
  widths,
  negativeLast,
  maxHeight,
  visibleRows,
}: {
  columns: string[]
  rows: string[][]
  widths: string
  negativeLast?: boolean
  maxHeight?: boolean
  /** Show this many rows under the header and scroll the rest, both ways. */
  visibleRows?: number
}) {
  const cell =
    'h-auto min-h-0 whitespace-nowrap border-b border-[var(--color-border-primary-default)] px-[var(--space-4)] py-[var(--space-2)] [&>span]:type-body-s'
  const table = (
    <div
      role="table"
      className={cn(
        'grid',
        visibleRows
          ? 'w-max min-w-full'
          : 'min-w-full rounded-[var(--radius-2)] border border-[var(--color-border-primary-default)]',
        maxHeight && 'max-h-[280px] overflow-y-auto',
      )}
      style={{ gridTemplateColumns: widths }}
    >
      {columns.map((c, i) => (
        <TableHeaderCell
          key={`h${i}`}
          className={cn(
            cell,
            'sticky top-0 z-[1] bg-[var(--color-surface-secondary-default)] [&>span]:text-[var(--color-text-tertiary-default)]',
          )}
        >
          {c}
        </TableHeaderCell>
      ))}
      {rows.map((r, ri) =>
        r.map((v, ci) => (
          <TableDataCell
            key={`${ri}-${ci}`}
            className={cn(
              cell,
              negativeLast && ci === r.length - 1 && '[&>span]:text-[var(--color-text-negative-default)]',
            )}
          >
            {v}
          </TableDataCell>
        )),
      )}
    </div>
  )
  if (!visibleRows) return table
  /* A row is a Body S line, py 8 and a 1px rule; the header is one more row. */
  return (
    <ScrollBox maxHeight={`calc(${visibleRows + 1} * (var(--type-body-s-line-height) + 2 * var(--space-2) + 1px))`}>
      {table}
    </ScrollBox>
  )
}

/* Three types since the BA / Dev sync (28 Oct 2026), was CIS / Direct
   recipient. The CIS ID line is the original build's; Email and SMS are composed. */
const RECIPIENT_TYPES: { value: RecipientTypeValue; description: string }[] = [
  { value: 'cis', description: 'Send to customers using CIS ID from file' },
  { value: 'email', description: 'Send email to addresses from file' },
  { value: 'sms', description: 'Send SMS to mobile numbers from file' },
]

function RecipientType({ f }: F) {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <FieldLabel required>Select Recipient type</FieldLabel>
      <div role="radiogroup" aria-label="Recipient type" className="flex gap-[var(--space-2)] py-[var(--space-3)]">
        {RECIPIENT_TYPES.map((t) => (
          <ModeOption
            key={t.value}
            on={f.recipientType === t.value}
            label={RECIPIENT_TYPE_LABEL[t.value]}
            description={t.description}
            className="w-[377px]"
            onSelect={() => f.setRecipientType(t.value)}
          />
        ))}
      </div>
    </div>
  )
}

/** Service code (BA & Dev feedback, 30 Oct 2026): one of Phase 1's codes, a
 *  dropdown at the top of the card, as wide as the ID column's. Label and
 *  placeholder are the Template form's; there it is a multi-select. */
function ServiceCode({ f }: F) {
  return (
    <Select
      label="Service code"
      className="w-[456px]"
      required
      value={f.serviceCode}
      options={SERVICE_CODE_LOV}
      error={f.errors.serviceCode}
      placeholder="Select service code"
      onChange={f.setServiceCode}
    />
  )
}

function ColumnSelect({ f }: F) {
  const label = `${ID_LABEL[f.kind]} column`
  const hint = f.audience
    ? `Select the column that contains ${ID_LABEL[f.kind].toLowerCase().replace('cis id', 'CIS ID')}`
    : 'Upload the file first'
  return (
    <Select
      label={label}
      className="w-[456px]"
      required
      value={f.column}
      options={f.audience?.headers ?? []}
      disabled={!f.audience}
      error={f.errors.column}
      hint={hint}
      placeholder="Select column"
      onChange={f.setColumn}
    />
  )
}

/* ── Message content (under the audience step) ─────────────────────────── */

/** Each channel's message boxes, in order — where the card's `+` inserts
 *  when the cursor is not in one of that channel's boxes. */
const CHANNEL_BOXES: Record<Channel, (keyof BroadcastContent)[]> = {
  'Push notification': ['pushTitle', 'pushBody'],
  Email: ['emailSubject', 'emailBody'],
  SMS: ['smsMessage'],
}

/** Inserts `${COLUMN}` at the caret of the channel's message box the cursor
 *  was last in, or into the channel's first box. */
function useInsertField(f: BroadcastForm, focus: FocusRef) {
  return (token: string, channel: Channel) => {
    type Target = NonNullable<FocusRef['current']>
    const usable = (t: Target | null): t is Target => !!t && !t.el.disabled && t.el.isConnected
    let target = focus.current
    if (!(usable(target) && CHANNEL_BOXES[channel].includes(target.key as keyof BroadcastContent))) {
      const key = CHANNEL_BOXES[channel][0]
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        `[data-field="${key}"] input, [data-field="${key}"] textarea`,
      )
      target = el ? { key, el } : null
    }
    if (!usable(target)) return
    const { el, key } = target
    const from = el.selectionStart ?? el.value.length
    const to = el.selectionEnd ?? el.value.length
    f.setC(key as keyof BroadcastContent)(el.value.slice(0, from) + token + el.value.slice(to))
    focus.current = { key, el }
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(from + token.length, from + token.length)
    })
  }
}

/** Closes a pop-up on a click outside `root` or on Esc. */
function useDismiss(open: boolean, setOpen: (open: boolean) => void, root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open, setOpen, root])
}

/** The pop-up under a card's `+`: webds `select-list`, the pattern that puts
 *  the library's Search Field above a single-pick list (requester, 28 Oct
 *  2026; was Dropdown Menu, which has no search). The columns go in as one
 *  unlabelled group and only that group scrolls: scrolling the root moved the
 *  pattern's `::after` stroke with the rows and let them show above a sticky
 *  search. A search that matches nothing reads Picker Dialog's own line, as a
 *  disabled row. */
function FieldMenu({ options, onSelect }: { options: { value: string; label: string }[]; onSelect: (token: string) => void }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const shown = options.filter((o) => !q || o.label.toLowerCase().includes(q))
  return (
    <SelectList
      width={240}
      className="absolute right-0 top-full z-[10] mt-[var(--space-2)] max-h-[360px] [&>.webds-pattern-select-list-3]:min-h-0 [&>.webds-pattern-select-list-3]:overflow-y-auto"
      search={<FormField spec={{ label: PICKER_DIALOG_COPY_EN.search, kind: 'search', autoFocus: true }} value={query} onChange={setQuery} />}
      groups={[
        {
          options: shown.length
            ? shown
            : [{ value: '', label: PICKER_DIALOG_COPY_EN.noResult[0], disabled: true }],
        },
      ]}
      onSelect={onSelect}
    />
  )
}

/** Idea 2.2's `+` on a card's title row (Figma 359:112101), which opens the
 *  file's columns in `FieldMenu`. The draft draws the button only; the
 *  pop-up is composed (gap). */
function FieldMenuButton({ f, onInsert, disabled, label }: F & { onInsert: (token: string) => void; disabled?: boolean; label: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLSpanElement>(null)
  useDismiss(open, setOpen, root)
  const off = disabled || !f.fields.length
  return (
    <span ref={root} className="relative inline-flex">
      {/* mousedown would blur the message box and lose the caret first */}
      <span className="inline-flex" onMouseDown={(e) => e.preventDefault()}>
        <ContainedIconButton
          label={label}
          aria-expanded={open}
          disabled={off}
          icon={<Icon slug="plus" size={16} color={off ? 'var(--color-icon-disabled-default)' : 'var(--color-icon-highlight-default)'} />}
          onClick={() => setOpen(!open)}
        />
      </span>
      {/* The search box takes the focus; the message box keeps its caret
          (`useInsertField` reads the last box's selection). */}
      {open && (
        <FieldMenu
          options={f.fields.map((field) => ({ value: field.token, label: field.column }))}
          onSelect={(token) => {
            onInsert(token)
            setOpen(false)
          }}
        />
      )}
    </span>
  )
}

/** "Turn on at least one channel" has no field of its own: the cards carry
 *  the stroke and this Alert carries the message (webds `form-section-card`). */
function ChannelAlert({ f }: F) {
  if (!f.errors.channels) return null
  return (
    <Alert
      appearance="negative"
      title={f.errors.channels}
      icon={<Icon slug="close-circle" size={24} color="var(--color-icon-negative-default)" />}
    />
  )
}

/** The message area under the audience file. A dynamic field goes in two
 *  ways (BA & Dev feedback, 30 Oct 2026, "Option 2 + 3"): the `+` on each
 *  channel card's title row opens the file's columns (Idea 2.2), and typing
 *  `$` in a message box opens them at the caret (Idea 4, ./shortcut.tsx). A
 *  picked field reads `${COLUMN}`, tinted as a chip (./highlight.tsx). The
 *  cards are stacked full width, as the CNH Template form (requester, 27 Oct
 *  2026).
 *
 *  Each card is switched on its own title row (webds `form-section-card`):
 *  off keeps what was typed and disables it. An Email or SMS broadcast has
 *  that one card, always on, with no switch (BA / Dev sync, 28 Oct 2026). */
export function MessageContent({ f, focus }: F & { focus: FocusRef }) {
  const invalid = !!f.errors.channels
  const insert = useInsertField(f, focus)
  const single = f.recipientType !== 'cis'
  const hasFields = f.fields.length > 0
  const shortcut = useFieldShortcut(f)
  const columns = f.fields.map((field) => field.column).join('\n')
  const tint = useMemo<Tint>(() => ({ columns: new Set(columns.split('\n')) }), [columns])

  const cards = (
    <div
      data-error={invalid ? 'true' : undefined}
      className="grid grid-cols-1 items-stretch gap-[var(--space-8)]"
      {...shortcut.handlers}
      onFocusCapture={(e) => {
        const el = e.target as HTMLInputElement | HTMLTextAreaElement
        const key = el.closest('[data-field]')?.getAttribute('data-field')
        if (key && isMessageBox(key)) focus.current = { key, el }
      }}
    >
      {f.offered.map((c) => {
        const on = f.channels.includes(c)
        return (
          <FormSectionCard
            key={c}
            className="min-w-0 border border-[var(--color-border-primary-default)] [&_.webds-pattern-form-section-card-3]:flex-1"
            title={
              hasFields ? (
                <span className="flex items-center justify-between gap-[var(--space-4)]">
                  {c}
                  <FieldMenuButton f={f} label={`Add dynamic field to ${c}`} disabled={!on} onInsert={(t) => insert(t, c)} />
                </span>
              ) : (
                c
              )
            }
            toggle={single ? undefined : { on, onToggle: (v) => f.setChannel(c, v) }}
            invalid={invalid}
            rowGap={4}
          >
            <ChannelFields f={f} channel={c} on={on} tint={tint} />
          </FormSectionCard>
        )
      })}
    </div>
  )

  return (
    <FormSectionCard
      className="[&_.webds-pattern-form-section-card-3]:flex-1"
      title={
        /* Every idea titled the card "Create broadcast message" (requester, 21
           Oct 2026). The `$` note sits on the right of the title (requester,
           28 Oct 2026): webds `info-note`, icon and text, no surface. */
        <span className="flex min-h-[44px] items-center justify-between gap-[var(--space-4)]">
          Create broadcast message
          {hasFields && <InfoNote>Type {TRIGGER} to add a dynamic field</InfoNote>}
        </span>
      }
      rowGap={6}
    >
      {!hasFields && <p className={NOTE}>Dynamic fields can be added once the audience file is uploaded.</p>}
      <ChannelAlert f={f} />
      {shortcut.menu}
      {cards}
    </FormSectionCard>
  )
}

/** A channel's message boxes — the Template form's TH fields, without the
 *  (TH): one broadcast is written in one language, Thai or English (BA / Dev
 *  sync, 28 Oct 2026). Push's Deep link and Email's sender are the Template
 *  form's too (BA & Dev feedback, 30 Oct 2026); they take no dynamic field. */
function ChannelFields({ f, channel, on, tint }: F & { channel: Channel; on: boolean; tint?: Tint }) {
  const box = (
    id: keyof BroadcastContent,
    label: string,
    placeholder: string,
    extra?: { multiline?: boolean; boxHeight?: 77; optional?: boolean; hint?: string },
  ) => {
    const { optional, ...rest } = extra ?? {}
    return (
      <Text
        id={id}
        label={label}
        required={!optional}
        disabled={!on}
        value={f.content[id]}
        max={CONTENT_MAX[id]}
        error={f.errors[id]}
        placeholder={placeholder}
        onChange={f.setC(id)}
        tint={isMessageBox(id) ? tint : undefined}
        {...rest}
      />
    )
  }
  if (channel === 'Push notification')
    return (
      <>
        {box('pushTitle', 'Push title', 'Enter push title')}
        {box('pushBody', 'Push message', 'Enter push message', { boxHeight: 77 })}
        {box('pushDeeplink', 'Deep link', 'Enter a deep link URL (optional)', {
          multiline: true,
          optional: true,
          hint: 'A deep link will take customers to your specific destination when tapping the push notification',
        })}
      </>
    )
  if (channel === 'Email')
    return (
      <>
        {box('emailSubject', 'Email subject', 'Enter email subject')}
        {box('emailBody', 'Email content', 'Enter email content', { multiline: true })}
        {/* Side by side, as the Template form's half-width sender fields; at one
            box height (the Template's Sender name is 77 tall) so the pair lines up. */}
        <div className="grid grid-cols-2 items-start gap-[var(--space-6)]">
          {box('emailSenderName', 'Sender name', 'Enter sender name')}
          {box('emailSenderAddress', 'Sender email address', 'Enter sender email address (optional)', { optional: true })}
        </div>
      </>
    )
  return box('smsMessage', 'SMS message', 'Enter SMS message', { multiline: true })
}

/* ── Delivery ───────────────────────────────────────────────────────────── */

export function Delivery({ f }: F) {
  return (
    <FormSectionCard title="Select Delivery Date">
      <div role="radiogroup" aria-label="When to send" className="flex flex-col gap-[var(--space-10)] py-[var(--space-3)]">
        <ModeOption
          on={f.mode === 'now'}
          label="Send as soon as possible"
          description="Start sending after you submit this broadcast."
          onSelect={() => {
            f.setMode('now')
            f.clear('startDate', 'startTime')
          }}
        />
        <ModeOption
          on={f.mode === 'schedule'}
          label="Schedule delivery"
          description="Choose a date and time to start sending."
          onSelect={() => f.setMode('schedule')}
        />
      </div>
      {/* Schedule delivery only: Start, in the left half (requester, 20 Oct
          2026). No End date (BA MoM, 29 Oct 2026; 14–29 Oct an optional End
          sat on the right, BA's Q2 answer). */}
      {f.mode === 'schedule' && (
        <div className="grid grid-cols-2 items-start gap-[var(--space-6)]">
          {/* One field, as CMS's Effective date: webds' Date Time Picker. The
              form still keeps the date and the time apart. */}
          <DateTimeInput
            label="Start date and time"
            required
            className="w-full"
            value={f.startDate && f.startTime ? `${f.startDate}T${f.startTime}` : ''}
            min={ymd(new Date())}
            minuteStep={5}
            error={!!(f.errors.startDate || f.errors.startTime)}
            message={f.errors.startDate ?? f.errors.startTime}
            onChange={(v) => {
              f.setStartDate(v.slice(0, 10))
              f.setStartTime(v.slice(11, 16))
            }}
          />
        </div>
      )}
      <Outlook f={f} />
    </FormSectionCard>
  )
}

/** When sending actually starts, given the quiet period. */
function Outlook({ f }: F) {
  if (!f.start || !f.first) return null
  /* Do Not Disturb that never ends has no start to promise; its warning is the
     Do Not Disturb card's or the confirm dialog's (28 Oct 2026). */
  if (f.neverSends) return null
  return (
    <Alert
      appearance="brand"
      icon={<Icon slug="information" size={24} color="var(--color-icon-highlight-default)" />}
      /* Title, not Description: the Figma Alert has no switch to hide its Title,
         so the board draws this note as the Title-only Alert. */
      title={<>
        {f.waits
          ? `${f.mode === 'now' ? 'Now' : 'The start'} is inside the quiet period. Sending starts at ${fmtDateTime(f.first)}.`
          : f.mode === 'now'
            ? 'Sending starts right after you submit.'
            : `Sending starts at ${fmtDateTime(f.start)}.`}
        {f.dnd.enabled && ' Sending pauses during the quiet period and resumes after it.'}
      </>}
    />
  )
}

/* ── DND (its own card under Delivery Date) ──────────────────────────────── */

/** Do Not Disturb that covers every day, all day (BA / Dev sync, 28 Oct
 *  2026): an Alert, Title only, as the Delivery card's Outlook, on the Do Not
 *  Disturb card as soon as the periods add up. Caution while editing; once
 *  Submit is pressed it is the error that blocks it and turns Negative, as the
 *  channel cards' Alert does (BA MoM and requester, 29 Oct 2026: Submit is
 *  never disabled; 28–29 Oct a warning only, on the card or in the confirm
 *  dialog, switched by a `?dndw=` Prototype control option). */
function NeverSendsAlert({ error }: { error: boolean }) {
  return error ? (
    <Alert
      appearance="negative"
      icon={<Icon slug="close-circle" size={24} color="var(--color-icon-negative-default)" />}
      title={BROADCAST_COPY.dndNeverSends}
    />
  ) : (
    <Alert
      appearance="caution"
      icon={<Icon slug="caution" size={24} color="var(--color-icon-caution-default)" />}
      title={BROADCAST_COPY.dndNeverSends}
    />
  )
}

/** One quiet period on one row: its days, its hours or All day, and — when
 *  there is more than one — a trash to remove it (draft 2.2, Figma 89:4665). */
function DndRuleRow({ f, rule, index }: F & { rule: DndRule; index: number }) {
  const off = !f.dnd.enabled
  const daysError = f.errors[`dndDays:${rule.id}`]
  const timeError = f.errors[`dndTime:${rule.id}`]
  const which = f.dnd.rules.length > 1 ? ` ${index + 1}` : ''
  return (
    <div className="flex flex-wrap items-start gap-x-[var(--space-8)] gap-y-[var(--space-6)]">
      <div data-error={daysError ? 'true' : undefined} className="flex min-w-0 flex-col gap-[var(--space-2)]">
        <span className="type-label-xl text-[var(--color-text-tertiary-default)]">Weekdays</span>
        <div className="flex h-[56px] flex-wrap items-center gap-[var(--space-6)]">
          {DAYS.map(({ day, label }) => (
            <Choice
              key={day}
              kind="checkbox"
              label={label}
              ariaLabel={`Quiet period${which} on ${label}`}
              disabled={off}
              on={rule.days.includes(day)}
              onChange={(on) =>
                f.setDndRule(rule.id, { days: on ? [...rule.days, day] : rule.days.filter((d) => d !== day) })
              }
            />
          ))}
        </div>
        {daysError && (
          <InlineMessage appearance="negative" size="xs">
            {daysError}
          </InlineMessage>
        )}
      </div>
      <div data-error={timeError ? 'true' : undefined} className="flex min-w-0 flex-col gap-[var(--space-2)]">
        <div className="flex items-end gap-[var(--space-4)]">
          <TimeInput
            label={`Quiet period from (${TIME_ZONES.find((z) => z.value === f.dnd.timeZone)?.offset ?? f.dnd.timeZone})`}
            value={rule.allDay ? '' : rule.from}
            disabled={off || rule.allDay}
            onChange={(v) => f.setDndRule(rule.id, { from: v })}
          />
          <span className="pb-[var(--space-4)] type-body-m text-[var(--color-text-secondary-default)]">to</span>
          {/* The original draws no label here, only the room for one, so the two
              boxes share a line. */}
          <TimeInput
            label=" "
            value={rule.allDay ? '' : rule.to}
            disabled={off || rule.allDay}
            onChange={(v) => f.setDndRule(rule.id, { to: v })}
          />
          {/* The end falls on the next day (BA, 2026-10-19). */}
          {endsNextDay(rule) && (
            <span
              className={cn(
                'pb-[var(--space-4)] type-body-m',
                off ? 'text-[var(--color-text-disabled-default)]' : 'text-[var(--color-text-secondary-default)]',
              )}
            >
              Next day
            </span>
          )}
          <span className="flex h-[56px] items-center">
            <Choice
              kind="checkbox"
              label="All day"
              ariaLabel={`Quiet period${which} all day`}
              disabled={off}
              on={rule.allDay}
              onChange={(allDay) => f.setDndRule(rule.id, { allDay })}
            />
          </span>
          {f.dnd.rules.length > 1 && (
            <span className="flex h-[56px] items-center pl-[var(--space-4)]">
              <IconButton
                label={`Remove quiet period${which}`}
                disabled={off}
                icon={
                  <Icon
                    slug="trash"
                    size={24}
                    color={off ? 'var(--color-icon-disabled-default)' : 'var(--color-icon-highlight-default)'}
                  />
                }
                onClick={() => f.removeDndRule(rule.id)}
              />
            </span>
          )}
        </div>
        {timeError && (
          <InlineMessage appearance="negative" size="xs">
            {timeError}
          </InlineMessage>
        )}
      </div>
    </div>
  )
}

/** Do Not Disturb, its own card under the Delivery Date card in the same
 *  step (requester, 21 Oct 2026; Figma 409:75574): the switch before the
 *  title and its note, each quiet period on its own card, Add more period.
 *  The one time zone there is follows the time label (design critique, 27 Oct
 *  2026; was a Time zone row under the periods). The switch is drawn in the
 *  title rather than through the card's `toggle`, which names the switch only
 *  from a string title. */
export function DndCard({ f }: F) {
  const dnd = f.dnd
  return (
    <FormSectionCard
      title={
        <span className="flex items-center gap-[var(--space-4)]">
          <ToggleSwitch toggled={dnd.enabled} aria-label="Do Not Disturb" onClick={() => f.setDndEnabled(!dnd.enabled)} />
          <span className="flex flex-col">
            <span>Do Not Disturb (DND)</span>
            <span className={NOTE}>Prevent sending messages during quiet hours.</span>
          </span>
        </span>
      }
    >
      {/* Any number of quiet periods (BA, 2026-10-14): each its own days and
          hours, on its own bordered card (requester, 22 Oct 2026; Figma
          436:243478); a day may sit in more than one. Card Surface draws no
          stroke at rest, so the border is the Figma override. */}
      {dnd.rules.map((rule, i) => (
        <CardSurface key={rule.id} className="h-auto items-start border border-[var(--color-border-primary-default)]">
          <DndRuleRow f={f} rule={rule} index={i} />
        </CardSurface>
      ))}
      {f.neverSends && (
        <div data-error={f.errors.dnd ? 'true' : undefined}>
          <NeverSendsAlert error={!!f.errors.dnd} />
        </div>
      )}
      <span className="flex">
        <OutlineButton disabled={!dnd.enabled} onClick={f.addDndRule}>
          Add more period
          <Icon slug="plus" size={16} color="currentColor" />
        </OutlineButton>
      </span>
    </FormSectionCard>
  )
}
