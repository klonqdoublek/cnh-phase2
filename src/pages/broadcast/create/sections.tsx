import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { UploadZone } from '@/components/upload/UploadZone'
import { UploadedFile } from '@/components/upload/UploadedFile'
import { DateTimeInput } from '@/components/fields/DateTimeInput'
import { TimeInput } from '@/components/fields/TimeInput'
import { Alert } from '@/bbl/alert'
import { CardSurface } from '@/bbl/building-block-card-surface'
import { FieldLabel } from '@/bbl/field'
import { OutlineButton } from '@/bbl/outline-button'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { InlineMessage } from '@/bbl/inline-message'
import { PillChip } from '@/bbl/pill-chip'
import { RadioButton } from '@/bbl/radio-button'
import { ScrollBar } from '@/bbl/scroll-bar'
import { TableDataCell } from '@/bbl/table-data-cell'
import { TableHeaderCell } from '@/bbl/table-header-cell'
import { ToggleSwitch } from '@/bbl/toggle-switch'
import { FormSectionCard } from '@/patterns/form-section-card'
import { FormStep } from '@/patterns/console-page'
import { BROADCAST_COPY, DAYS, ID_LABEL, TIME_ZONES, fmtDateTime, type BroadcastContent, type DndRule } from '@/data/broadcast'
import type { Channel } from '@/data/templates'
import { cn } from '@/lib/cn'
import { Choice, LABEL, ModeOption, NOTE, Select, Text } from './fields'
import { CONTENT_MAX, ymd, type BroadcastForm } from './useBroadcastForm'

/* The Create broadcast steps, laid out as draft 2.2 webds-matched (Figma
 * 85:19401, 15 Oct 2026): the audience step carries the message content —
 * one set of field chips over three channel cards — and channels are
 * switched on their own cards. */

type F = { f: BroadcastForm }
/** The message box the cursor was last in, so a field chip knows where to insert. */
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

/** Recipient type, the upload (its preview under the file) and the ID
 *  column, one under the other at full width (requester, 22 Oct 2026: top to
 *  bottom). The upload is the CMS prototype's zone and file slot
 *  (components/upload) — webds ships no upload control (gap). */
export function AudienceFile({ f }: F) {
  return (
    <FormSectionCard title="Upload Audience file">
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
            error={!!f.errors.file}
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

function RecipientType({ f }: F) {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <FieldLabel required>Select Recipient type</FieldLabel>
      <div role="radiogroup" aria-label="Recipient type" className="flex gap-[var(--space-2)] py-[var(--space-3)]">
        <ModeOption
          on={f.recipientType === 'cis'}
          label="CIS"
          description="Send to customers using CIS ID from file"
          className="w-[377px]"
          onSelect={() => f.setRecipientType('cis')}
        />
        <ModeOption
          on={f.recipientType === 'direct'}
          label="Direct recipient"
          description="Send to phone / email from file · Email or SMS only"
          className="w-[377px]"
          onSelect={() => f.setRecipientType('direct')}
        />
      </div>
    </div>
  )
}

function ColumnSelect({ f }: F) {
  const label = f.kind ? `${ID_LABEL[f.kind]} column` : 'Recipient column'
  const hint = f.audience
    ? f.kind
      ? `Select the column that contains ${ID_LABEL[f.kind].toLowerCase().replace('cis id', 'CIS ID')}`
      : 'Choose Email or SMS first'
    : 'Upload the file first'
  return (
    <Select
      label={label}
      className="w-[456px]"
      required
      value={f.column}
      options={f.audience?.headers ?? []}
      disabled={!f.audience || !f.kind}
      error={f.errors.column}
      hint={hint}
      placeholder="Select column"
      onChange={f.setColumn}
    />
  )
}

/* ── Message content (under the audience step) ─────────────────────────── */

/** The file's columns as chips that insert `{{COLUMN}}` into the message box
 *  the cursor was last in. */
export function FieldChips({ f, focus }: F & { focus: FocusRef }) {
  const [needsField, setNeedsField] = useState(false)
  if (!f.fields.length) return <p className={NOTE}>Available fields appear here once the audience file is uploaded.</p>
  const insert = (token: string) => {
    const target = focus.current
    if (!target || target.el.disabled || !target.el.isConnected) return setNeedsField(true)
    setNeedsField(false)
    const { el, key } = target
    const from = el.selectionStart ?? el.value.length
    const to = el.selectionEnd ?? el.value.length
    f.setC(key as never)(el.value.slice(0, from) + token + el.value.slice(to))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(from + token.length, from + token.length)
    })
  }
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <span className={LABEL}>Available fields</span>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {f.fields.map((field) => (
          /* mousedown would blur the message box and lose the caret first */
          <span key={field.column} onMouseDown={(e) => e.preventDefault()}>
            <PillChip appearance="highlight" aria-label={`Insert ${field.token}`} onClick={() => insert(field.token)}>
              {field.column}
            </PillChip>
          </span>
        ))}
      </div>
      {needsField && (
        <InlineMessage appearance="negative" size="xs">
          {BROADCAST_COPY.pickField}
        </InlineMessage>
      )}
    </div>
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

/** "Create broadcast message" (requester, 21 Oct 2026; draft 2.2 has no
 *  title here): the chips over one card per channel offered, stacked in one
 *  column as the Template form stacks its channel cards (requester, 27 Oct
 *  2026; was three across). Each card is
 *  switched on its own title row (webds `form-section-card`): off keeps what
 *  was typed and disables it. Direct recipient offers Email and SMS, one at a
 *  time, picked by a radio (`DirectChannelCard`). */
export function MessageContent({ f, focus }: F & { focus: FocusRef }) {
  const invalid = !!f.errors.channels
  const direct = f.recipientType === 'direct'
  return (
    <FormSectionCard title="Create broadcast message">
      <FieldChips f={f} focus={focus} />
      <ChannelAlert f={f} />
      <div
        data-error={invalid ? 'true' : undefined}
        className="flex flex-col gap-[var(--space-8)]"
        onFocusCapture={(e) => {
          const el = e.target as HTMLInputElement | HTMLTextAreaElement
          const key = el.closest('[data-field]')?.getAttribute('data-field')
          if (key && key in f.content) focus.current = { key, el }
        }}
      >
        {f.offered.map((c) => {
          const on = f.channels.includes(c)
          if (direct)
            return (
              <DirectChannelCard key={c} channel={c} selected={on} invalid={invalid} onSelect={() => f.setChannel(c, true)}>
                {/* Both cards' fields stay live, as drawn (Figma 325:62582). */}
                <ChannelFields f={f} channel={c} on />
              </DirectChannelCard>
            )
          return (
            <FormSectionCard
              key={c}
              className="min-w-0 border border-[var(--color-border-primary-default)]"
              title={c}
              toggle={{ on, onToggle: (v) => f.setChannel(c, v) }}
              invalid={invalid}
              rowGap={4}
            >
              <ChannelFields f={f} channel={c} on={on} />
            </FormSectionCard>
          )
        })}
      </div>
    </FormSectionCard>
  )
}

/** Direct recipient's channel card (Figma 325:62582, 20 Oct 2026; ported from
 *  `add/dynamic-field-concepts` e64e5e8): one picked at a time by the radio in
 *  its title row. The picked card is Card Surface `State=Selected`
 *  (Border/Highlight); both cards' fields stay live, as drawn. The rule "pick
 *  a channel" strokes both cards negative, as `form-section-card` does. */
function DirectChannelCard({
  channel,
  selected,
  invalid,
  onSelect,
  children,
}: {
  channel: Channel
  selected: boolean
  invalid: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <CardSurface
      tabIndex={-1}
      state={selected ? 'selected' : 'default'}
      data-invalid={invalid ? 'true' : undefined}
      className={cn(
        'flex h-auto min-w-0 flex-col items-stretch gap-[var(--space-8)] p-[var(--space-6)] hover:bg-[var(--color-surface-primary-default)] active:bg-[var(--color-surface-primary-default)]',
        /* Same 1px on both, so picking one does not move its content; the
           Selected stroke is drawn inside it. */
        'border',
        selected ? 'border-transparent' : 'border-[var(--color-border-primary-default)]',
        invalid && 'webds-pattern-form-section-card--s1',
      )}
    >
      <label className="flex cursor-pointer items-center gap-[var(--space-3)]">
        <RadioButton selected={selected} aria-label={channel} onClick={onSelect} />
        <span className="type-heading-xs-emphasized text-[var(--color-text-primary-default)]">{channel}</span>
      </label>
      <div className="flex flex-col gap-[var(--space-4)]">{children}</div>
    </CardSurface>
  )
}

/** A channel's message boxes — the Template form's TH fields. */
function ChannelFields({ f, channel, on }: F & { channel: Channel; on: boolean }) {
  const box = (id: keyof BroadcastContent, label: string, placeholder: string, extra?: { multiline?: boolean; boxHeight?: 77 }) => (
    <Text
      id={id}
      label={label}
      required
      disabled={!on}
      value={f.content[id]}
      max={CONTENT_MAX[id]}
      error={f.errors[id]}
      placeholder={placeholder}
      onChange={f.setC(id)}
      {...extra}
    />
  )
  if (channel === 'Push notification')
    return (
      <>
        {box('pushTitle', 'Push title (TH)', 'Enter push title in Thai')}
        {box('pushBody', 'Push message (TH)', 'Enter push message in Thai', { boxHeight: 77 })}
      </>
    )
  if (channel === 'Email')
    return (
      <>
        {box('emailSubject', 'Email subject (TH)', 'Enter email subject')}
        {box('emailBody', 'Email content (TH)', 'Enter email content', { multiline: true })}
      </>
    )
  return box('smsMessage', 'SMS message (TH)', 'Enter SMS message in Thai', { multiline: true })
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
            f.clear('startDate', 'startTime', 'end')
          }}
        />
        <ModeOption
          on={f.mode === 'schedule'}
          label="Schedule delivery"
          description="Choose a date and time to start sending."
          onSelect={() => f.setMode('schedule')}
        />
      </div>
      {/* Schedule delivery only: Start on the left, End on the right
          (requester, 20 Oct 2026; draft 2.2 drew End first). Send as soon
          as possible has no end (requester, 15 Oct 2026). */}
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
          {/* Broadcast End (BA, 2026-10-14): optional, with Clear, as CMS's
              Expiry date. Sending stops here; whoever is left is Not sent. */}
          <DateTimeInput
            label="End date and time"
            optional
            clearable
            className="w-full"
            value={f.end}
            min={f.startDate || ymd(new Date())}
            minuteStep={5}
            error={!!f.errors.end}
            message={f.errors.end}
            onChange={f.setEnd}
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
        {f.end && ` Sending stops at ${fmtDateTime(new Date(f.end))}; recipients not sent by then are counted as Not sent.`}
      </>}
    />
  )
}

/* ── DND (its own card under Delivery Date) ──────────────────────────────── */

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
      <span className="flex">
        <OutlineButton disabled={!dnd.enabled} onClick={f.addDndRule}>
          Add more period
          <Icon slug="plus" size={16} color="currentColor" />
        </OutlineButton>
      </span>
    </FormSectionCard>
  )
}
