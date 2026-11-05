import { useEffect, useMemo, useRef, useState } from 'react'
import { UploadZone } from '@/components/upload/UploadZone'
import { UploadedFile } from '@/components/upload/UploadedFile'
import { DateTimeInput } from '@/components/fields/DateTimeInput'
import { QUIET_PERIOD_LABEL, TimeInput } from '@/components/fields/TimeInput'
import { Alert } from '@/bbl/alert'
import { CardSurface } from '@/bbl/building-block-card-surface'
import { FieldLabel, FieldRoot } from '@/bbl/field'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { InlineMessage } from '@/bbl/inline-message'
import { OutlineButton } from '@/bbl/outline-button'
import { TableDataCell } from '@/bbl/table-data-cell'
import { TableHeaderCell } from '@/bbl/table-header-cell'
import { ToggleSwitch } from '@/bbl/toggle-switch'
import { FormField } from '@/patterns/form-field'
import { PICKER_DIALOG_COPY_EN } from '@/patterns/picker-dialog'
import { SelectList } from '@/patterns/select-list'
import { FormSectionCard } from '@/patterns/form-section-card'
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
import { Choice, LABEL, MessageEditor, ModeOption, NOTE, Select, Text } from './fields'
import { editBox, type Tint } from './highlight'
import { MessagePreview } from './preview'
import { ScrollBox } from './scroll-box'
import { useFieldShortcut } from './shortcut'
import { CONTENT_MAX, ymd, type BroadcastForm } from './useBroadcastForm'

/* The Create broadcast steps, laid out as draft 2.2 webds-matched (Figma
 * 85:19401, 15 Oct 2026): the audience step carries the message content —
 * the channel cards, each message box with its dynamic field button — and
 * channels are switched on their own cards. */

type F = { f: BroadcastForm }
/** The message box the cursor was last in, so a picked field keeps its caret. */
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

/** The file's first five rows at the column's width; the rows stop there
 *  (requester, 4 Nov 2026), every column scrolls sideways. The selected ID
 *  column is not marked (requirement update, 21 Oct 2026). */
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
  /** Show only this many rows under the header; the columns scroll sideways. */
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
      {(visibleRows ? rows.slice(0, visibleRows) : rows).map((r, ri) =>
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
  return <ScrollBox>{table}</ScrollBox>
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

/** Inserts `${COLUMN}` into the message box whose button was pressed, at its
 *  caret (the box keeps its selection while unfocused, so this is also where
 *  the cursor last left it). */
function useInsertField(f: BroadcastForm, focus: FocusRef) {
  return (token: string, key: keyof BroadcastContent) => {
    const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[data-field="${key}"] input, [data-field="${key}"] textarea`,
    )
    if (!el || el.disabled) return
    const from = el.selectionStart ?? el.value.length
    const to = el.selectionEnd ?? el.value.length
    focus.current = { key, el }
    /* The browser's own edit, so ⌘Z takes the picked field back (./highlight.tsx). */
    editBox(el, from, to, token, f.setC(key))
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

/** The pop-up under a message box's dynamic field button: webds `select-list`, the pattern that puts
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
      className="absolute left-0 top-full z-[10] mt-[var(--space-2)] max-h-[360px] [&>.webds-pattern-select-list-3]:min-h-0 [&>.webds-pattern-select-list-3]:overflow-y-auto"
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

/** The dynamic field button, in the toolbar of each `MessageEditor`, which
 *  opens the file's columns in `FieldMenu`. Core's Rich Text Editor toggle
 *  (10923:13655), on webds `icon-button`, which draws its is Selected=No row:
 *  no fill and a secondary icon, hovered 5%, clicked 10%. While the menu is open
 *  it is is Selected=Yes: Highlight at 10%, hovered 15%, clicked 20%, a highlight
 *  icon. webds has no token for Highlight at 20% (gap), so it is mixed from
 *  Surface/Highlight/Default. The `{ }` icon is drawn for CNH: the library ships
 *  none (gap). Requester, 4 Nov 2026; before, Contained Icon Button 44 in the
 *  box's top-right corner. The pop-up is composed (gap). With no audience file
 *  there is nothing to pick, so it stays and is disabled. */
function FieldMenuButton({ f, onInsert, disabled, label }: F & { onInsert: (token: string) => void; disabled?: boolean; label: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLSpanElement>(null)
  useDismiss(open, setOpen, root)
  const off = disabled || !f.fields.length
  return (
    <span ref={root} className="relative inline-flex">
      {/* mousedown would blur the message box and lose the caret first */}
      <span className="inline-flex" onMouseDown={(e) => e.preventDefault()}>
        <IconButton
          size={24}
          selected={open}
          label={label}
          aria-expanded={open}
          disabled={off}
          className={cn(
            'rounded-[var(--radius-1)]',
            open &&
              'hover:bg-[var(--color-surface-highlight-subtle-inverse-default)] active:bg-[color-mix(in_srgb,var(--color-surface-highlight-default)_20%,transparent)]',
          )}
          icon={
            <Icon
              dir="cnh-icons"
              slug="field-braces"
              size={24}
              color={
                off
                  ? 'var(--color-icon-disabled-default)'
                  : open
                    ? 'var(--color-icon-highlight-default)'
                    : 'var(--color-icon-secondary-default)'
              }
            />
          }
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
 *  ways (BA & Dev feedback, 30 Oct 2026, "Option 2 + 3"): the button in each
 *  message box's top-right corner opens the file's columns (Idea 2.2, moved
 *  into the box 3 Nov 2026), and typing
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
            /* Name to first field 24, the pattern's 32 read too far (Korarit, 4 Nov 2026). */
            className="min-w-0 gap-[var(--space-6)] border border-[var(--color-border-primary-default)] [&_.webds-pattern-form-section-card-3]:flex-1"
            title={c}
            toggle={single ? undefined : { on, onToggle: (v) => f.setChannel(c, v) }}
            invalid={invalid}
            rowGap={4}
          >
            {/* Fields left, the preview right, as the deck draws Email (30 Oct 2026). */}
            <div className="grid grid-cols-2 items-stretch gap-[var(--space-6)]">
              <div className="flex min-w-0 flex-col gap-[var(--space-4)]">
                <ChannelFields f={f} channel={c} on={on} tint={tint} insert={hasFields ? insert : undefined} />
              </div>
              <MessagePreview channel={c} content={f.content} audience={f.audience} on={on} />
            </div>
          </FormSectionCard>
        )
      })}
    </div>
  )

  return (
    <FormSectionCard
      className="[&_.webds-pattern-form-section-card-3]:flex-1"
      /* Every idea titled the card "Create broadcast message" (requester, 21
         Oct 2026). No `$` note: the shortcut is easy to learn (requester, 4 Nov
         2026). */
      title={<span className="flex min-h-[44px] items-center">Create broadcast message</span>}
      rowGap={6}
    >
      {/* Sits 8 under the title and 32 over the cards (Korarit, 4 Nov 2026). */}
      {!hasFields && (
        <p className={cn(NOTE, 'mt-[calc(var(--space-2)-var(--space-8))] mb-[var(--space-2)]')}>
          Dynamic fields can be added once the audience file is uploaded.
        </p>
      )}
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
function ChannelFields({
  f,
  channel,
  on,
  tint,
  insert,
}: F & { channel: Channel; on: boolean; tint?: Tint; insert?: (token: string, key: keyof BroadcastContent) => void }) {
  const box = (
    id: keyof BroadcastContent,
    label: string,
    placeholder: string,
    extra?: { multiline?: boolean; optional?: boolean; hint?: string; className?: string },
  ) => {
    const { optional, ...rest } = extra ?? {}
    if (isMessageBox(id))
      return (
        <MessageEditor
          id={id}
          label={label}
          required={!optional}
          disabled={!on}
          value={f.content[id]}
          max={CONTENT_MAX[id]}
          error={f.fieldError(id, on)}
          placeholder={placeholder}
          onChange={f.setC(id)}
          multiline={rest.multiline}
          tint={tint}
          toolbar={<FieldMenuButton f={f} label={`Add dynamic field to ${label}`} disabled={!on} onInsert={(t) => insert?.(t, id)} />}
        />
      )
    return (
      <Text
        id={id}
        label={label}
        required={!optional}
        disabled={!on}
        value={f.content[id]}
        max={CONTENT_MAX[id]}
        error={f.fieldError(id, on)}
        placeholder={placeholder}
        onChange={f.setC(id)}
        {...rest}
      />
    )
  }
  if (channel === 'Push notification')
    return (
      <>
        {box('pushTitle', 'Push title', 'Enter push title')}
        {box('pushBody', 'Push message', 'Enter push message')}
        {box('pushDeeplink', 'Deep link', 'Enter a deep link URL (optional)', {
          multiline: true,
          optional: true,
          hint: 'A deep link will take customers to your specific destination when tapping the push notification',
          /* Box to helper text 8, webds's 4 read too tight (Korarit, 4 Nov 2026). */
          className: '[&_.webds-field-hint]:pt-[var(--space-1)]',
        })}
      </>
    )
  if (channel === 'Email')
    return (
      <>
        {box('emailSubject', 'Email subject', 'Enter email subject')}
        {box('emailBody', 'Email content', 'Enter email content', { multiline: true })}
        {/* One under the other at one box height (the Template's Sender name is
            77 tall): the preview takes the card's right half, so a pair side by
            side cut the address placeholder short (30 Oct 2026). */}
        {box('emailSenderName', 'Sender name', 'Enter sender name')}
        {box('emailSenderAddress', 'Sender email address', 'Enter sender email address (optional)', { optional: true })}
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

/** One quiet period on one row: its days, and its hours or All day (draft
 *  2.2, Figma 89:4665). Its trash is the card's, in the top-right corner. */
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
        <div className="flex items-start gap-[var(--space-4)]">
          <TimeInput
            label={`Quiet period from (${TIME_ZONES.find((z) => z.value === f.dnd.timeZone)?.offset ?? f.dnd.timeZone})`}
            value={rule.allDay ? '' : rule.from}
            disabled={off || rule.allDay}
            onChange={(v) => f.setDndRule(rule.id, { from: v })}
          />
          <BesideField>
            <span className="type-body-m text-[var(--color-text-secondary-default)]">to</span>
          </BesideField>
          {/* The original draws no label here, only the room for one, so the two
              boxes share a line. */}
          <TimeInput
            label=" "
            value={rule.allDay ? '' : rule.to}
            disabled={off || rule.allDay}
            onChange={(v) => f.setDndRule(rule.id, { to: v })}
            /* The end falls on the next day (BA, 2026-10-19), said under the
               box so the row keeps its width. */
            hint={endsNextDay(rule) ? 'Next Day' : undefined}
          />
          <BesideField>
            <Choice
              kind="checkbox"
              label="All day"
              ariaLabel={`Quiet period${which} all day`}
              disabled={off}
              on={rule.allDay}
              onChange={(allDay) => f.setDndRule(rule.id, { allDay })}
            />
          </BesideField>
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

/** What sits beside the time boxes, set under an empty label on a 56-tall line
 *  so it stays level with the boxes when the To box carries a hint under it. */
function BesideField({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <FieldRoot className="w-auto shrink-0">
      <FieldLabel className={QUIET_PERIOD_LABEL}> </FieldLabel>
      <span className={cn('flex h-[56px] items-center', className)}>{children}</span>
    </FieldRoot>
  )
}

function RemoveRule({ f, id, which }: F & { id: string; which: string }) {
  const off = !f.dnd.enabled
  return (
    <span className="ml-auto flex shrink-0">
      <IconButton
        size={24}
        label={`Remove quiet period${which}`}
        disabled={off}
        icon={
          <Icon slug="trash" size={24} color={off ? 'var(--color-icon-disabled-default)' : 'var(--color-icon-highlight-default)'} />
        }
        onClick={() => f.removeDndRule(id)}
      />
    </span>
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
          {/* When there is more than one, the trash sits in the card's top-right
              corner (design critique with the lead design team, 3 Nov 2026; was
              at the end of the hours row, after All day). */}
          {dnd.rules.length > 1 && <RemoveRule f={f} id={rule.id} which={` ${i + 1}`} />}
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
