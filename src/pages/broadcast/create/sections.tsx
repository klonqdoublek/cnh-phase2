import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { UploadZone } from '@/components/upload/UploadZone'
import { UploadedFile } from '@/components/upload/UploadedFile'
import { DateTimeInput } from '@/components/fields/DateTimeInput'
import { TimeInput } from '@/components/fields/TimeInput'
import { Alert } from '@/bbl/alert'
import { CardSurface } from '@/bbl/building-block-card-surface'
import { ContainedIconButton } from '@/bbl/contained-icon-button'
import { Divider } from '@/bbl/divider'
import { GhostButton } from '@/bbl/ghost-button'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { InlineMessage } from '@/bbl/inline-message'
import { OutlineButton } from '@/bbl/outline-button'
import { PillChip } from '@/bbl/pill-chip'
import { RadioButton } from '@/bbl/radio-button'
import { ScrollBar } from '@/bbl/scroll-bar'
import { TableDataCell } from '@/bbl/table-data-cell'
import { TableHeaderCell } from '@/bbl/table-header-cell'
import { ToggleSwitch } from '@/bbl/toggle-switch'
import { DropdownMenu } from '@/patterns/dropdown-menu'
import { PickerDialog } from '@/patterns/picker-dialog'
import { FormSectionCard } from '@/patterns/form-section-card'
import { FormStep } from '@/patterns/console-page'
import { BROADCAST_COPY, DAYS, ID_LABEL, TIME_ZONES, fmtDateTime, type BroadcastContent, type DndRule } from '@/data/broadcast'
import type { Channel } from '@/data/templates'
import { cn } from '@/lib/cn'
import type { Concept } from '@/prototype/dynamic-field'
import { Choice, LABEL, ModeOption, NOTE, Select, Text } from './fields'
import { triggerMark, useFieldShortcut } from './shortcut'
import { CONTENT_MAX, ymd, type BroadcastForm } from './useBroadcastForm'

/* The Create broadcast steps, laid out as draft 2.2 webds-matched (Figma
 * 85:19401, 15 Oct 2026): the audience step carries the message content —
 * the file's fields and the channel cards, drawn as the dynamic field draft
 * the Concept panel picks — and channels are switched on their own cards. */

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

/** Each channel's message boxes, in order — where a per-channel picker
 *  inserts when the cursor is not in one of that channel's boxes. */
const CHANNEL_BOXES: Record<Channel, (keyof BroadcastContent)[]> = {
  'Push notification': ['pushTitle', 'pushBody'],
  Email: ['emailSubject', 'emailBody'],
  SMS: ['smsMessage'],
}

/** Inserts `{{COLUMN}}` at the caret of the message box the cursor was last
 *  in. Scoped to a channel, it falls back to that channel's first box. False
 *  when there is no box to insert into. */
function useInsertField(f: BroadcastForm, focus: FocusRef) {
  return (token: string, channel?: Channel) => {
    type Target = NonNullable<FocusRef['current']>
    const usable = (t: Target | null): t is Target => !!t && !t.el.disabled && t.el.isConnected
    let target = focus.current
    if (channel && !(usable(target) && CHANNEL_BOXES[channel].includes(target.key as keyof BroadcastContent))) {
      const key = CHANNEL_BOXES[channel][0]
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        `[data-field="${key}"] input, [data-field="${key}"] textarea`,
      )
      target = el ? { key, el } : null
    }
    if (!usable(target)) return false
    const { el, key } = target
    const from = el.selectionStart ?? el.value.length
    const to = el.selectionEnd ?? el.value.length
    f.setC(key as keyof BroadcastContent)(el.value.slice(0, from) + token + el.value.slice(to))
    focus.current = { key, el }
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(from + token.length, from + token.length)
    })
    return true
  }
}

type Insert = (token: string) => void

/** Idea 1 / 1.2: the file's columns as chips, always on show. */
function FieldPills({ f, onInsert, disabled }: F & { onInsert: Insert; disabled?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <span className={LABEL}>Available fields</span>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {f.fields.map((field) => (
          /* mousedown would blur the message box and lose the caret first */
          <span key={field.column} onMouseDown={(e) => e.preventDefault()}>
            <PillChip
              appearance="highlight"
              state={disabled ? 'disabled' : 'default'}
              aria-label={`Insert ${field.token}`}
              onClick={() => onInsert(field.token)}
            >
              {field.column}
            </PillChip>
          </span>
        ))}
      </div>
    </div>
  )
}

/** Idea 2 / 2.2: a button that opens the file's columns as a webds Dropdown
 *  Menu. The drafts draw the button only; the menu is composed (gap).
 *  Idea 3 / 3.2 (`dialog`): the same button opens webds `picker-dialog`
 *  instead, single pick, as CMS's Link Document Type (requester, 20 Oct 2026). */
function FieldMenuButton({
  f,
  onInsert,
  icon,
  dialog,
  braces,
  disabled,
  label,
}: F & { onInsert: Insert; icon?: boolean; dialog?: boolean; braces?: boolean; disabled?: boolean; label: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open || dialog) return
    const away = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open, dialog])
  const off = disabled || !f.fields.length
  const options = f.fields.map((field) => ({ value: field.token, label: field.column }))
  const color = icon && off ? 'var(--color-icon-disabled-default)' : icon ? 'var(--color-icon-highlight-default)' : 'currentColor'
  /* `{ }` — webds ships no brace icon (gap), so it is the label face, at the
     16 box the plus takes. */
  const mark = braces ? (
    <span aria-hidden className="inline-flex h-[16px] items-center type-label-l-emphasized" style={{ color }}>
      {'{ }'}
    </span>
  ) : (
    <Icon slug="plus" size={16} color={color} />
  )
  return (
    <span ref={root} className="relative inline-flex">
      {/* mousedown would blur the message box and lose the caret first */}
      <span className="inline-flex" onMouseDown={(e) => e.preventDefault()}>
        {icon ? (
          <ContainedIconButton
            label={label}
            aria-expanded={open}
            disabled={off}
            icon={mark}
            onClick={() => setOpen(!open)}
          />
        ) : (
          <OutlineButton aria-expanded={open} disabled={off} onClick={() => setOpen(!open)}>
            {label}
            {mark}
          </OutlineButton>
        )}
      </span>
      {open && !dialog && (
        <span onMouseDown={(e) => e.preventDefault()}>
          <DropdownMenu
            width={240}
            className="absolute right-0 top-full z-[10] mt-[var(--space-2)] max-h-[320px] overflow-y-auto"
            options={options}
            onSelect={(token) => {
              onInsert(token)
              setOpen(false)
            }}
          />
        </span>
      )}
      {open && dialog && (
        <PickerDialog
          title="Dynamic field"
          single
          options={options}
          empty={['No fields in the audience file.', 'Upload a file with more columns.']}
          onClose={() => setOpen(false)}
          onConfirm={([token]) => {
            setOpen(false)
            if (token) onInsert(token)
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

/** The message area under the audience file, drawn as one of the dynamic
 *  field drafts (Figma 324:35732, 20 Oct 2026) — the Concept panel picks:
 *
 *    picker     pills always on show (Idea 1, 1.2) · a button and its menu (2, 2.2)
 *               · a button and a picker dialog (3, 3.2 — CMS's)
 *               · a character typed in the box, menu at the caret (4, ./shortcut.tsx)
 *    placement  one for every channel (1, 2) · one on each card (1.2, 2.2);
 *               a shortcut is in every box, so it has none
 *    layout     cards three across (1, 2, 2.2) · stacked full width as CNH (1.2)
 *
 *  Each card is switched on its own title row (webds `form-section-card`):
 *  off keeps what was typed and disables it. Direct recipient offers Email
 *  and SMS, one at a time. */
export function MessageContent({ f, focus, concept }: F & { focus: FocusRef; concept: Concept }) {
  const invalid = !!f.errors.channels
  const insert = useInsertField(f, focus)
  const [needsField, setNeedsField] = useState(false)
  const shared = concept.placement === 'shared'
  const direct = f.recipientType === 'direct'
  const hasFields = f.fields.length > 0
  const insertShared: Insert = (token) => setNeedsField(!insert(token))
  const typed = concept.picker === 'shortcut'
  const shortcut = useFieldShortcut(f, concept.trigger, typed)
  /* Composed (21 Oct 2026), as Clay's "Type '/' to …" under each box. */
  const hint = typed && hasFields ? `Type ${triggerMark(concept.trigger)} to add a dynamic field` : undefined

  /* Idea 2, 2.2 and the dialog head the area "Broadcast Message"; Idea 1.2
     "Select", as drawn; Idea 1 and the shortcut have no heading. */
  const menu = concept.picker === 'button' || concept.picker === 'dialog'
  const heading = menu ? 'Broadcast Message' : concept.picker === 'pills' && concept.layout === 'stacked' ? 'Select' : null
  const sharedButton = shared && menu && (
    <FieldMenuButton
      f={f}
      label="Add dynamic field"
      dialog={concept.picker === 'dialog'}
      braces={concept.mark === 'braces'}
      onInsert={insertShared}
    />
  )

  const cards = (
    <div
      data-error={invalid ? 'true' : undefined}
      className={cn(
        'grid items-stretch',
        concept.layout === 'stacked'
          ? 'grid-cols-1 gap-[var(--space-6)]'
          : direct
            ? 'grid-cols-2 gap-[var(--space-8)]'
            : 'grid-cols-3 gap-[var(--space-8)]',
      )}
      {...shortcut.handlers}
      onFocusCapture={(e) => {
        const el = e.target as HTMLInputElement | HTMLTextAreaElement
        const key = el.closest('[data-field]')?.getAttribute('data-field')
        if (key && key in f.content) {
          focus.current = { key, el }
          setNeedsField(false)
        }
      }}
    >
      {f.offered.map((c) => {
        const on = f.channels.includes(c)
        /* Direct draws its fields live on both cards (Figma 325:62582). */
        const editable = direct || on
        const perCard = !shared && hasFields
        const cardButton = perCard && menu && (
          <FieldMenuButton
            f={f}
            icon
            dialog={concept.picker === 'dialog'}
            braces={concept.mark === 'braces'}
            label={`Add dynamic field to ${c}`}
            disabled={!editable}
            onInsert={(t) => insert(t, c)}
          />
        )
        const body = (
          <>
            {perCard && concept.picker === 'pills' && (
              <FieldPills f={f} disabled={!editable} onInsert={(t) => insert(t, c)} />
            )}
            <ChannelFields f={f} channel={c} on={editable} hint={hint} />
          </>
        )
        if (direct)
          return (
            <DirectChannelCard
              key={c}
              channel={c}
              selected={on}
              invalid={invalid}
              action={cardButton}
              onSelect={() => f.setChannel(c, true)}
            >
              {body}
            </DirectChannelCard>
          )
        return (
          <FormSectionCard
            key={c}
            className="min-w-0 border border-[var(--color-border-primary-default)] [&_.webds-pattern-form-section-card-3]:flex-1"
            title={
              cardButton ? (
                <span className="flex items-center justify-between gap-[var(--space-4)]">
                  {c}
                  {cardButton}
                </span>
              ) : (
                c
              )
            }
            toggle={{ on, onToggle: (v) => f.setChannel(c, v) }}
            invalid={invalid}
            rowGap={4}
          >
            {body}
          </FormSectionCard>
        )
      })}
    </div>
  )

  const top = (
    <>
      {shared && concept.picker === 'pills' && hasFields && <FieldPills f={f} onInsert={insertShared} />}
      {!hasFields && (
        <p className={NOTE}>
          {typed
            ? 'Dynamic fields can be added once the audience file is uploaded.'
            : 'Available fields appear here once the audience file is uploaded.'}
        </p>
      )}
      {needsField && (
        <InlineMessage appearance="negative" size="xs">
          {BROADCAST_COPY.pickField}
        </InlineMessage>
      )}
      <ChannelAlert f={f} />
      {shortcut.menu}
    </>
  )

  if (!heading)
    return (
      <StepSurface>
        {top}
        {cards}
      </StepSurface>
    )
  return (
    <FormSectionCard
      className="[&_.webds-pattern-form-section-card-3]:flex-1"
      title={
        <span className="flex min-h-[44px] items-center justify-between gap-[var(--space-4)]">
          {heading}
          {sharedButton}
        </span>
      }
      rowGap={6}
    >
      {top}
      {cards}
    </FormSectionCard>
  )
}

/** Direct recipient's channel card (Figma 325:62582, 20 Oct 2026): Email and
 *  SMS two across, one picked at a time by the radio in its title row. The
 *  picked card is Card Surface `State=Selected` (Border/Highlight); both
 *  cards' fields stay live, as drawn. The rule "pick a channel" strokes both
 *  cards negative, as `form-section-card` does. */
function DirectChannelCard({
  channel,
  selected,
  invalid,
  action,
  onSelect,
  children,
}: {
  channel: Channel
  selected: boolean
  invalid: boolean
  action?: React.ReactNode
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
      <span className="flex items-center gap-[var(--space-4)]">
        <label className="flex flex-1 cursor-pointer items-center gap-[var(--space-3)]">
          <RadioButton selected={selected} aria-label={channel} onClick={onSelect} />
          <span className="type-heading-xs-emphasized text-[var(--color-text-primary-default)]">{channel}</span>
        </label>
        {action}
      </span>
      <div className="flex flex-col gap-[var(--space-4)]">{children}</div>
    </CardSurface>
  )
}

/** A channel's message boxes — the Template form's TH fields. */
function ChannelFields({ f, channel, on, hint }: F & { channel: Channel; on: boolean; hint?: string }) {
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
      hint={hint}
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
