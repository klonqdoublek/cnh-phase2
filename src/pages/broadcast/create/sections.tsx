import { useState } from 'react'
import { UploadZone } from '@/components/upload/UploadZone'
import { UploadedFile } from '@/components/upload/UploadedFile'
import { DateTimeInput } from '@/components/fields/DateTimeInput'
import { TimeInput } from '@/components/fields/TimeInput'
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
import { BROADCAST_COPY, DAYS, ID_LABEL, TIME_ZONES, fmtDateTime, type DndRule } from '@/data/broadcast'
import type { Channel } from '@/data/templates'
import { cn } from '@/lib/cn'
import { Choice, LABEL, ModeOption, NOTE, Select, SmsField, Text } from './fields'
import { ymd, type BroadcastForm } from './useBroadcastForm'

type F = { f: BroadcastForm }
/** The message box the cursor was last in, so a field chip knows where to insert. */
export type FocusRef = React.MutableRefObject<{ key: string; el: HTMLInputElement | HTMLTextAreaElement } | null>

const sizeLabel = (bytes: number) =>
  bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

const CHANNEL_ICON: Record<Channel, string> = { Email: 'mail', SMS: 'message', 'Push notification': 'alert' }

/** One "Step N" — webds `FormStep` over a white card (or bare, for Step 4). */
export function Section({ title, bare, children }: { title: string; bare?: boolean; children: React.ReactNode }) {
  return (
    <FormStep title={title}>
      {bare ? (
        children
      ) : (
        <CardSurface
          tabIndex={-1}
          className="flex h-auto w-full flex-col items-stretch gap-[var(--space-6)] p-[var(--space-6)] hover:bg-[var(--color-surface-primary-default)] active:bg-[var(--color-surface-primary-default)]"
        >
          {children}
        </CardSurface>
      )}
    </FormStep>
  )
}

/* ── Step 1 ─────────────────────────────────────────────────────────────── */

export function BasicInfo({ f }: F) {
  return (
    <div className="flex w-full items-start gap-[var(--space-6)]">
      <Text
        id="name"
        label="Broadcast name"
        required
        value={f.name}
        max={100}
        error={f.errors.name}
        placeholder="e.g. October Customer Campaign"
        onChange={f.edit('name', f.setName)}
        className="flex-1"
      />
      <Text
        id="description"
        label="Description"
        value={f.description}
        max={250}
        error={f.errors.description}
        placeholder="What this broadcast is for"
        onChange={f.edit('description', f.setDescription)}
        className="flex-1"
      />
    </div>
  )
}

/* ── Step 2 ─────────────────────────────────────────────────────────────── */

/** The CMS prototype's upload zone and file slot (components/upload) —
 *  webds ships no upload control (gap). */
export function AudienceFile({ f }: F) {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-4)]">
      {f.file ? (
        <FileResult f={f} />
      ) : (
        <UploadZone
          buttonLabel={BROADCAST_COPY.browse}
          hint={[BROADCAST_COPY.dropTitle, BROADCAST_COPY.dropHint]}
          accept=".csv,.xlsx,text/csv"
          error={!!f.errors.file}
          onFiles={f.pick}
        />
      )}
      {f.errors.file && (
        <InlineMessage appearance="negative" size="s">
          {f.errors.file}
        </InlineMessage>
      )}
      <div className="flex flex-wrap gap-[var(--space-6)]">
        <SampleLink href="/samples/audience-cis.csv">Sample file · CIS</SampleLink>
        <SampleLink href="/samples/audience-direct.csv">Sample file · Direct recipient</SampleLink>
      </div>
    </div>
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
              ? sizeLabel(file.size)
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
      {f.check && f.check.invalid > 0 && (
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
    </div>
  )
}

/** The first five rows of the file, the ID column marked. */
function Preview({ f }: F) {
  const a = f.audience!
  const idIndex = a.headers.indexOf(f.column)
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <span className={LABEL}>{BROADCAST_COPY.previewTitle}</span>
      <div className="overflow-x-auto">
        <MiniTable
          columns={a.headers}
          widths={a.headers.map((_, i) => (i === a.headers.length - 1 ? 'minmax(max-content,1fr)' : 'max-content')).join(' ')}
          rows={a.rows.slice(0, 5).map((r) => a.headers.map((_, i) => r[i] ?? ''))}
          highlight={idIndex}
        />
      </div>
    </div>
  )
}

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
}: {
  columns: string[]
  rows: string[][]
  widths: string
  highlight?: number
  negativeLast?: boolean
  maxHeight?: boolean
}) {
  const cell =
    'h-auto min-h-0 whitespace-nowrap border-b border-[var(--color-border-primary-default)] px-[var(--space-4)] py-[var(--space-2)] [&>span]:type-body-s'
  return (
    <div
      role="table"
      className={cn(
        'grid min-w-full rounded-[var(--radius-2)] border border-[var(--color-border-primary-default)]',
        maxHeight && 'max-h-[280px] overflow-y-auto',
      )}
      style={{ gridTemplateColumns: widths }}
    >
      {columns.map((c, i) => (
        <TableHeaderCell
          key={`h${i}`}
          className={cn(
            cell,
            'sticky top-0 bg-[var(--color-surface-secondary-default)] [&>span]:text-[var(--color-text-tertiary-default)]',
            i === highlight && 'bg-[var(--color-surface-highlight-subtle-default)]',
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
}

/* ── Step 3 ─────────────────────────────────────────────────────────────── */

export function Mapping({ f }: F) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)] items-start gap-[var(--space-6)]">
      <RecipientType f={f} />
      <ColumnSelect f={f} />
      <ChannelPicker f={f} />
    </div>
  )
}

function RecipientType({ f }: F) {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <span className={LABEL}>Recipient type*</span>
      <div role="radiogroup" aria-label="Recipient type" className="flex flex-col gap-[var(--space-4)]">
        <ModeOption
          on={f.recipientType === 'cis'}
          label="CIS"
          description="Send to customers using CIS ID from file"
          onSelect={() => f.setRecipientType('cis')}
        />
        <ModeOption
          on={f.recipientType === 'direct'}
          label="Direct recipient"
          description="Send to phone / email from file · Email or SMS only"
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

function ChannelPicker({ f }: F) {
  const direct = f.recipientType === 'direct'
  return (
    <div data-error={f.errors.channels ? 'true' : undefined} className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <span className={LABEL}>Channels*</span>
      <div role={direct ? 'radiogroup' : 'group'} aria-label="Channels" className="flex flex-col gap-[var(--space-2)]">
        {f.offered.map((c) => (
          <Choice
            key={c}
            kind={direct ? 'radio' : 'checkbox'}
            on={f.channels.includes(c)}
            ariaLabel={c}
            onChange={(on) => (direct ? f.chooseDirect(c) : f.toggleChannel(c, on))}
            label={
              <span className="inline-flex items-center gap-[var(--space-2)]">
                <Icon slug={CHANNEL_ICON[c]} size={16} color="var(--color-icon-secondary-default)" />
                {c}
              </span>
            }
          />
        ))}
      </div>
      {f.errors.channels && (
        <InlineMessage appearance="negative" size="xs">
          {f.errors.channels}
        </InlineMessage>
      )}
    </div>
  )
}

/* ── Step 4 ─────────────────────────────────────────────────────────────── */

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

/** One card per channel offered — webds `form-section-card`. A channel not
 *  ticked in Step 3 keeps its card, disabled, and says why. */
export function ChannelCards({ f, focus }: F & { focus: FocusRef }) {
  return (
    <div
      className={cn('grid items-stretch gap-[var(--space-6)]', f.offered.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}
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
            className="h-full min-w-0"
            title={
              <span className="flex items-center gap-[var(--space-4)]">
                <Icon
                  slug={CHANNEL_ICON[c]}
                  size={24}
                  color={on ? 'var(--color-icon-highlight-default)' : 'var(--color-icon-disabled-default)'}
                />
                <span className="flex min-w-0 flex-col">
                  <span>{c}</span>
                  {!on && <span className={NOTE}>Not selected in step 3</span>}
                </span>
              </span>
            }
          >
            {c === 'Push notification' && (
              <>
                <Text
                  id="pushTitle"
                  label="Push title"
                  required
                  disabled={!on}
                  value={f.content.pushTitle}
                  max={100}
                  error={f.errors.pushTitle}
                  onChange={f.setC('pushTitle')}
                />
                <Text
                  id="pushBody"
                  label="Push message"
                  required
                  multiline
                  disabled={!on}
                  value={f.content.pushBody}
                  max={250}
                  error={f.errors.pushBody}
                  onChange={f.setC('pushBody')}
                />
              </>
            )}
            {c === 'Email' && (
              <>
                <Text
                  id="emailSubject"
                  label="Email subject"
                  required
                  disabled={!on}
                  value={f.content.emailSubject}
                  max={100}
                  error={f.errors.emailSubject}
                  onChange={f.setC('emailSubject')}
                />
                <Text
                  id="emailBody"
                  label="Email body"
                  required
                  multiline
                  disabled={!on}
                  value={f.content.emailBody}
                  max={1000}
                  error={f.errors.emailBody}
                  onChange={f.setC('emailBody')}
                />
              </>
            )}
            {c === 'SMS' && (
              <SmsField disabled={!on} value={f.content.smsMessage} error={f.errors.smsMessage} onChange={f.setC('smsMessage')} />
            )}
          </FormSectionCard>
        )
      })}
    </div>
  )
}

/* ── Step 5 ─────────────────────────────────────────────────────────────── */

export function Delivery({ f }: F) {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-4)]">
      <div role="radiogroup" aria-label="When to send" className="flex gap-[var(--space-4)]">
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
      {/* Start under Schedule delivery, End under the second card's column:
          each field is one mode card wide. */}
      <div className="flex items-start gap-[var(--space-4)]">
        {f.mode === 'schedule' ? (
          /* One field, as CMS's Effective date: webds' Date Time Picker. The
             form still keeps the date and the time apart. */
          <DateTimeInput
            label="Start date and time"
            required
            className="w-[604px]"
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
        ) : (
          <span className="w-[604px] shrink-0" />
        )}
        {/* Broadcast End (BA, 2026-10-14): optional, with Clear, as CMS's
            Expiry date. Sending stops here; whoever is left is Not sent. */}
        <DateTimeInput
          label="End date and time"
          optional
          clearable
          className="w-[604px]"
          value={f.end}
          min={f.mode === 'schedule' && f.startDate ? f.startDate : ymd(new Date())}
          minuteStep={5}
          error={!!f.errors.end}
          message={f.errors.end}
          onChange={(v) => {
            f.setEnd(v)
            f.clear('end')
          }}
        />
      </div>
      <Outlook f={f} />
    </div>
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

/* ── Step 6 ─────────────────────────────────────────────────────────────── */

/** One quiet period: its days, its hours or All day, and — when there is more
 *  than one — a trash to remove it. */
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

export function DndPanel({ f }: F) {
  const dnd = f.dnd
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="flex items-start gap-[var(--space-3)]">
        <ToggleSwitch toggled={dnd.enabled} aria-label="Do Not Disturb" onClick={() => f.setDndEnabled(!dnd.enabled)} />
        <div className="flex flex-col pt-[var(--space-2)]">
          <span className={LABEL}>{dnd.enabled ? 'Enabled' : 'Disabled'}</span>
          <span className={NOTE}>Prevent sending messages during quiet hours.</span>
        </div>
      </div>
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
      <Select
        label="Time zone"
        className="w-[260px]"
        value={dnd.timeZone}
        options={TIME_ZONES}
        disabled={!dnd.enabled}
        onChange={f.setDndTimeZone}
      />
    </div>
  )
}
