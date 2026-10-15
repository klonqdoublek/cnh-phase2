import { useState } from 'react'
import { UploadZone } from '@/components/upload/UploadZone'
import { UploadedFile } from '@/components/upload/UploadedFile'
import { DateTimeInput } from '@/components/fields/DateTimeInput'
import { TimeInput } from '@/components/fields/TimeInput'
import { Alert } from '@/bbl/alert'
import { CardSurface } from '@/bbl/building-block-card-surface'
import { Divider } from '@/bbl/divider'
import { GhostButton } from '@/bbl/ghost-button'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { InlineMessage } from '@/bbl/inline-message'
import { PillChip } from '@/bbl/pill-chip'
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

const n = (v: number) => v.toLocaleString('en-US')
const sizeLabel = (bytes: number) =>
  bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

/** One "Step N" — webds `FormStep`, its note under the heading. The step's
 *  card is the caller's: a titled `FormSectionCard` or a plain `StepSurface`. */
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

/** A step's card with no title of its own (Delivery). */
function StepSurface({ children }: { children: React.ReactNode }) {
  return (
    <CardSurface
      tabIndex={-1}
      className="flex h-auto w-full flex-col items-stretch gap-[var(--space-6)] p-[var(--space-6)] hover:bg-[var(--color-surface-primary-default)] active:bg-[var(--color-surface-primary-default)]"
    >
      {children}
    </CardSurface>
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
        onChange={f.edit('name', f.setName)}
      />
      <Text
        id="description"
        label="Description"
        value={f.description}
        max={250}
        error={f.errors.description}
        placeholder="What this broadcast is for"
        onChange={f.edit('description', f.setDescription)}
      />
    </FormSectionCard>
  )
}

/* ── Step 2 ─────────────────────────────────────────────────────────────── */

/** Recipient type, then the file beside its ID column. The upload is the
 *  CMS prototype's zone and file slot (components/upload) — webds ships no
 *  upload control (gap). */
export function AudienceFile({ f }: F) {
  return (
    <FormSectionCard title="Upload Audience file">
      <RecipientType f={f} />
      <div className="flex items-start gap-[var(--space-6)]">
        <div className="flex w-[672px] min-w-0 shrink-0 flex-col gap-[var(--space-2)]">
          <span className={LABEL}>Upload File*</span>
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
          <div className="flex flex-wrap gap-[var(--space-6)] pt-[var(--space-2)]">
            <SampleLink href="/samples/audience-cis.csv">Sample file · CIS</SampleLink>
            <SampleLink href="/samples/audience-direct.csv">Sample file · Direct recipient</SampleLink>
          </div>
        </div>
        <ColumnSelect f={f} />
      </div>
    </FormSectionCard>
  )
}

function SampleLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-[var(--space-1)] type-label-m-emphasized text-[var(--color-text-link-default)] no-underline hover:text-[var(--color-text-link-hovered)] hover:underline"
    >
      <Icon slug="download" size={16} color="currentColor" />
      {children}
    </a>
  )
}

function FileResult({ f }: F) {
  const file = f.file!
  const bad = !!f.read && !f.read.ok
  const invalidRows = f.check ? f.check.rows.filter((r) => r.errors.length) : []
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <UploadedFile
        name={file.name}
        error={bad}
        meta={
          f.read
            ? f.read.ok
              ? `${sizeLabel(file.size)} · ${n(f.read.audience.rows.length)} rows`
              : f.read.message
            : BROADCAST_COPY.checking
        }
        status={
          f.audience && (
            <span className="inline-flex shrink-0 items-center gap-[var(--space-1)] type-label-m-emphasized text-[var(--color-text-positive-default)]">
              <Icon slug="tick-circle" size={16} color="var(--color-icon-positive-default)" />
              {BROADCAST_COPY.validated}
            </span>
          )
        }
        onRemove={f.clearFile}
      />
      {f.checking && (
        <div className="flex justify-center p-[var(--space-4)]">
          <SpinnerLoader size="m" appearance="brand" />
        </div>
      )}
      {f.audience && <Preview f={f} />}
      {f.check && (
        <>
          <p className="type-label-m-emphasized text-[var(--color-text-primary-default)]">
            {BROADCAST_COPY.rowsSummary(f.check.rows.length, f.check.valid)}
            {f.check.invalid > 0 && (
              <span className="text-[var(--color-text-negative-default)]">
                {' · '}
                {BROADCAST_COPY.invalidCount(f.check.invalid)}
              </span>
            )}
            <span className="text-[var(--color-text-secondary-default)]">
              {' · by '}
              {f.column}
            </span>
          </p>
          {f.check.invalid > 0 && (
            <>
              <p className={NOTE}>{BROADCAST_COPY.invalidNote}</p>
              <MiniTable
                columns={['Row', f.column, 'Problem']}
                widths="80px 200px 1fr"
                rows={invalidRows.map((r) => [String(r.line), r.id || '–', r.errors.join(' · ')])}
                negativeLast
                maxHeight
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

/** The whole file in a box five rows tall at the column's width; the rest
 *  scrolls, both ways, under a header that stays put. The ID column is marked. */
function Preview({ f }: F) {
  const a = f.audience!
  const idIndex = a.headers.indexOf(f.column)
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <span className="flex items-baseline gap-[var(--space-4)]">
        <span className={LABEL}>{BROADCAST_COPY.previewTitle}</span>
        <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">
          {BROADCAST_COPY.previewSize(a.rows.length, a.headers.length)}
        </span>
      </span>
      <MiniTable
        columns={a.headers}
        widths={a.headers.map((_, i) => (i === a.headers.length - 1 ? 'minmax(max-content,1fr)' : 'max-content')).join(' ')}
        rows={a.rows.map((r) => a.headers.map((_, i) => r[i] ?? ''))}
        highlight={idIndex}
        visibleRows={5}
      />
    </div>
  )
}

/** Bars that always show and can be dragged, drawn as webds Scroll Bar
 *  (12 track, 8 pill thumb, Component/Scroll Bar fills). webds' `ScrollBar`
 *  only draws a position, it cannot be dragged (gap), and the browser's own
 *  overlay bar on macOS stays hidden until a scroll starts — with a mouse
 *  wheel, nothing says the table goes on to the right. */
const SCROLL_BARS = cn(
  '[&::-webkit-scrollbar]:size-[12px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-corner]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:rounded-[var(--radius-full)] [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-padding',
  '[&::-webkit-scrollbar-thumb]:bg-[var(--color-component-scroll-bar-default)] [&::-webkit-scrollbar-thumb:active]:bg-[var(--color-component-scroll-bar-pressed)]',
  /* A 100-row file makes a 200-tall box's thumb about 11 long — too short to
     see. Both axes get a floor. */
  '[&::-webkit-scrollbar-thumb:vertical]:min-h-[40px] [&::-webkit-scrollbar-thumb:horizontal]:min-w-[40px]',
)

/** webds Table Header / Data Cells at a compact row height in a bordered grid.
 *  The cells' own 64 row is the data grid's; a validation list inside a card
 *  reads at 36 — the original's own reason for not using its Table. */
function MiniTable({
  columns,
  rows,
  widths,
  highlight = -1,
  negativeLast,
  maxHeight,
  visibleRows,
}: {
  columns: string[]
  rows: string[][]
  widths: string
  highlight?: number
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
            /* Highlight Subtle is 10% blue: lay it over the opaque header fill,
               or the rows scrolling under the header show through. */
            i === highlight &&
              'bg-[image:linear-gradient(var(--color-surface-highlight-subtle-default),var(--color-surface-highlight-subtle-default))]',
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
              ci === highlight && 'bg-[var(--color-surface-highlight-subtle-default)]',
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
  /* A row is a Body S line, py 8 and a 1px rule; the header is one more row,
     and the 12 under them is the horizontal bar's track. */
  return (
    <div
      className={cn('min-w-0 overflow-auto rounded-[var(--radius-2)] border border-[var(--color-border-primary-default)]', SCROLL_BARS)}
      style={{
        maxHeight: `calc(${visibleRows + 1} * (var(--type-body-s-line-height) + 2 * var(--space-2) + 1px) + 12px)`,
      }}
    >
      {table}
    </div>
  )
}

function RecipientType({ f }: F) {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <span className={LABEL}>Select Recipient type*</span>
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
      onChange={(v) => {
        f.setColumn(v)
        f.clear('column', 'file')
      }}
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

/** The chips over one card per channel offered, three across. Each card is
 *  switched on its own title row (webds `form-section-card`): off keeps what
 *  was typed and disables it. Direct recipient offers Email and SMS, one at a
 *  time. */
export function MessageContent({ f, focus }: F & { focus: FocusRef }) {
  const invalid = !!f.errors.channels
  return (
    <StepSurface>
      <FieldChips f={f} focus={focus} />
      <ChannelAlert f={f} />
      <div
        data-error={invalid ? 'true' : undefined}
        className="grid grid-cols-3 items-stretch gap-[var(--space-8)]"
        onFocusCapture={(e) => {
          const el = e.target as HTMLInputElement | HTMLTextAreaElement
          const key = el.closest('[data-field]')?.getAttribute('data-field')
          if (key && key in f.content) focus.current = { key, el }
        }}
      >
        {f.offered.map((c) => {
          const on = f.channels.includes(c)
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
    </StepSurface>
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
      {/* Schedule delivery only: End on the left, Start on the right (draft
          2.2; kept by the requester, 15 Oct 2026). Send as soon as possible
          has no end (requester, 15 Oct 2026). */}
      {f.mode === 'schedule' && (
        <div className="grid grid-cols-2 items-start gap-[var(--space-6)]">
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
            onChange={(v) => {
              f.setEnd(v)
              f.clear('end')
            }}
          />
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
              f.clear('startDate', 'startTime', 'end')
            }}
          />
        </div>
      )}
      <Outlook f={f} />
      <DndBlock f={f} />
    </FormSectionCard>
  )
}

/** When sending actually starts, given the quiet period. */
function Outlook({ f }: F) {
  if (!f.start || !f.first) return null
  return (
    <div className="flex items-start gap-[var(--space-3)] rounded-[var(--radius-2)] bg-[var(--color-surface-highlight-subtle-default)] px-[var(--space-4)] py-[var(--space-3)] type-body-m text-[var(--color-text-primary-default)]">
      <Icon slug="time" size={24} color="var(--color-icon-highlight-default)" />
      <span>
        {f.waits
          ? `${f.mode === 'now' ? 'Now' : 'The start'} is inside the quiet period. Sending starts at ${fmtDateTime(f.first)}.`
          : f.mode === 'now'
            ? 'Sending starts right after you submit.'
            : `Sending starts at ${fmtDateTime(f.start)}.`}
        {f.dnd.enabled && ' Sending pauses during the quiet period and resumes after it.'}
        {f.end && ` Sending stops at ${fmtDateTime(new Date(f.end))}; recipients not sent by then are counted as Not sent.`}
      </span>
    </div>
  )
}

/* ── DND (inside Delivery Date) ────────────────────────────────────────────────────────── */

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
            label="Quiet period from"
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

/** Do Not Disturb, inside the Delivery Date card (Figma 89:4665): the
 *  switch and title, the quiet periods divided by a rule, Add period, and the
 *  one time zone there is, shown as text. */
function DndBlock({ f }: F) {
  const dnd = f.dnd
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-6)]">
      <span className="flex flex-col gap-[var(--space-1)]">
        <span className="type-heading-xs-emphasized text-[var(--color-text-primary-default)]">Select DND</span>
        <span className={NOTE}>Prevent sending messages during quiet hours.</span>
      </span>
      <span className="flex items-center gap-[var(--space-3)]">
        <ToggleSwitch toggled={dnd.enabled} aria-label="Do Not Disturb" onClick={() => f.setDndEnabled(!dnd.enabled)} />
        <span className="type-heading-xs-emphasized text-[var(--color-text-primary-default)]">Do Not Disturb (DND)</span>
      </span>
      {/* Any number of quiet periods (BA, 2026-10-14): each its own days and
          hours, divided by a rule; a day may sit in more than one. */}
      {dnd.rules.map((rule, i) => (
        <div key={rule.id} className="flex flex-col gap-[var(--space-6)]">
          {i > 0 && <Divider />}
          <DndRuleRow f={f} rule={rule} index={i} />
        </div>
      ))}
      <span className="flex">
        <GhostButton appearance="highlight" padding="none" disabled={!dnd.enabled} onClick={f.addDndRule}>
          <Icon slug="plus" size={16} color="currentColor" />
          Add period
        </GhostButton>
      </span>
      {/* One time zone only, so no select (Figma 89:4665). */}
      <span className="flex flex-col gap-[var(--space-1)]">
        <span className="type-label-xl text-[var(--color-text-tertiary-default)]">Time zone</span>
        <span className="type-body-m text-[var(--color-text-primary-default)]">
          {TIME_ZONES.find((z) => z.value === dnd.timeZone)?.label ?? dnd.timeZone}
        </span>
      </span>
    </div>
  )
}
