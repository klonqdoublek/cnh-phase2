import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { SelectField } from '@/bbl/select-field'
import { GhostButton } from '@/bbl/ghost-button'
import { RemovableChip } from '@/bbl/removable-chip'
import { FieldBox, FieldLabel } from '@/bbl/field'
import { MultiSelectPanel, type MultiSelectState } from './multi-select-panel'

/* Multi Select Dropdown — the *behavior* of the Activity Group picker, measured
 * on the C&D board `7188:58787` ("C&D - Activity Group / Type") in the
 * Centralize Log file. The pieces were already here — Select Field is a
 * verified component and the panel is `multi-select-panel` (`7036:44521`) —
 * but both are drawings; nothing composed them into the dropdown the board
 * specifies. This does, and every rule below cites the frame it comes from.
 *
 *   open       the panel sits 8 under the field (measured on the `No item`
 *              screen: panel y 320, field bottom 312) and the field flips to
 *              its Selected state — chevron up, Border/Highlight. The search
 *              field takes focus on open (the screen draws its caret).
 *   value      Selected names joined ", ", clipped with an ellipsis in the
 *              fixed-width field ("Add Account, Cashle…" on the Selected 2
 *              groups frame). Empty + open shows `placeholder` — the Clear
 *              screen draws "Input option". All selected shows `allLabel`.
 *   chips      One Removable Chip per selection, only while the selection is
 *              partial: the All Selected and No item frames draw no chip row.
 *   search     Local filter over the option labels. A query with no match is
 *              the panel's `no-results` Empty State; `searching` is for a
 *              remote lookup and wins over both (the Loading frame).
 *   select all annotation on `7188:58846`: the dropdown does not close, and
 *              the options grey to Selected+Disabled — a single one cannot be
 *              pressed back out; the way to see change again is Clear All.
 *   clear all  annotation on `7188:58850`: reset to zero, panel stays open.
 *              Whether a zero selection disables the consumer's Search button
 *              is the consumer's call — it hears about it through `onChange`.
 *
 * Selection is uncontrolled by default; pass `value` + `onChange` to control
 * it. Labels are plain strings because the same text is the filter haystack,
 * the chip label, and the field's summary run. */

export type MultiSelectDropdownOption = {
  value: string
  label: string
}

export type MultiSelectDropdownProps = {
  /** The field's Label M run — "Activity Group" on the board. */
  label: string
  options: MultiSelectDropdownOption[]
  /** Controlled selection. Omit and the dropdown keeps its own. */
  value?: string[]
  defaultValue?: string[]
  onChange?: (value: string[]) => void
  /** The field's value once every option is selected — "All Group". */
  allLabel?: React.ReactNode
  /** The field's value while open and empty — the file draws "Input option". */
  placeholder?: React.ReactNode
  searchLabel?: React.ReactNode
  selectAllLabel?: React.ReactNode
  clearAllLabel?: React.ReactNode
  /** A remote lookup in flight — draws the panel's searching Empty State. */
  searching?: boolean
  /** Hands the query up when the filtering is not local. */
  onSearchChange?: (query: string) => void
  /** The list viewport maximum, as on the panel. The file draws 520. */
  listHeight?: number
  /** 399 in the file. `'fill'` makes the panel the field's own width, which is
   *  what a form card needs — the menu belongs to the field, not to a fixed
   *  measurement taken on another screen. */
  panelWidth?: number | 'fill'
  /**
   * With every option selected, the file this was measured on locks the rows:
   * annotation `7188:58846` — "Selected+Disabled, a row cannot be pressed back
   * out", and the only way back is Clear All. Default follows that file.
   *
   * A second product must turn it OFF, and the reason is worth keeping: its
   * filters OPEN with everything ticked, so the field can read "All". Under the
   * lock every option in every dropdown loaded disabled and the board's own
   * interaction — "Unselect checkbox to filter" — was impossible. A rule that is
   * an affordance in one file is a dead end in another; that is why this is a
   * prop and not a correction in either direction.
   */
  lockWhenAllSelected?: boolean
  /**
   * The panel's search row. Drawn in the 399 panel this was measured on, and
   * NOT in a second platform's 291 one (`JjvzdUwg5LlKHDQvo2fny0` · 1:72242),
   * whose lists are two and three options long — a search box over three rows
   * is furniture. Without this a consumer could only get that panel by
   * composing Select Field and Multi Select Panel by hand, which is what the
   * first one did.
   */
  showSearch?: boolean
  /**
   * The chip row. Drawn in the 399 panel this was measured on, where the chips
   * are the only place a partial selection is legible — the field there clips
   * to one line.
   *
   * NOT drawn in the second platform's 291 panel: `JjvzdUwg5LlKHDQvo2fny0`
   * holds that panel at **291 x 281 in every frame it appears** — the two
   * expand frames (`1:136265`, `1:136267`), which differ only in what is
   * ticked. A panel whose height is constant across a changing selection has
   * no row that appears with one. There the field itself carries the summary
   * ("NANOTI, NAOTP" on `1:136268`), so the chips would be a second copy that
   * also moves the footer down the screen on every tick.
   */
  showChips?: boolean
  /**
   * The field's box height, where a consuming file does not draw the set's 56.
   * A filter bar measured at 291 x 64 is why this exists, and it reached the
   * component as a CSS rule in the consumer before it was a prop.
   */
  fieldBoxClassName?: string
  /**
   * Disables a footer action that can no longer do anything — Select all with
   * everything ticked, Clear All with nothing. **This is a product decision,
   * not a measurement**: both files draw `Select all` as `State=Selected`
   * there, which looks pressed and stays pressable. Off by default for that
   * reason, and recorded here rather than quietly made true.
   */
  disableSpentActions?: boolean
  /**
   * The field's own Select Field props, for the second place this dropdown
   * appears: INSIDE A FORM. The filter bar draws the label in the box; a form
   * card lifts it to its own row with the `*` and an error message under it
   * (`JjvzdUwg5LlKHDQvo2fny0` · 1:172832, Service Code — 394 x 84 with the
   * label outside, over a 394 x 281 panel of checkboxes). Without these the
   * only way to get that was to compose Select Field and Multi Select Panel by
   * hand beside the form's own single-select branch.
   */
  labelPosition?: 'Inside' | 'Outside'
  outsideLabel?: 'shrunk' | 'xl'
  required?: boolean
  message?: React.ReactNode
  /** Same four-face matrix the single Select carries: a disabled field cannot
   *  open, and an error one reads `Error - Empty`. */
  disabled?: boolean
  error?: boolean
  /** Width of the field itself — the consuming screens draw it at 220. */
  className?: string
}

/* `Icon/16px/General Icon/Close-Circle`, verbatim from
   public/webds-icons/close-circle-16.svg — the mark on the Clear All button. */
const CLOSE_CIRCLE_16 =
  'M8.00039 2.60039C5.01805 2.60039 2.60039 5.01805 2.60039 8.00039C2.60039 10.9827 5.01805 13.4004 8.00039 13.4004C10.9827 13.4004 13.4004 10.9827 13.4004 8.00039C13.4004 5.01805 10.9827 2.60039 8.00039 2.60039ZM1.40039 8.00039C1.40039 4.35531 4.35531 1.40039 8.00039 1.40039C11.6455 1.40039 14.6004 4.35531 14.6004 8.00039C14.6004 11.6455 11.6455 14.6004 8.00039 14.6004C4.35531 14.6004 1.40039 11.6455 1.40039 8.00039ZM8 7.15147L9.97574 5.17574L10.8243 6.02426L8.84853 8L10.8243 9.97574L9.97574 10.8243L8 8.84853L6.02426 10.8243L5.17574 9.97574L7.15147 8L5.17574 6.02426L6.02426 5.17574L8 7.15147Z'

/* The 24px BBL magnifier, verbatim from public/webds-icons/search-24.svg. */
const SEARCH_24 =
  'M22.0282 20.8282L15.4282 14.2282C16.4567 12.9424 17.1424 11.2282 17.1424 9.42815C17.1424 5.14244 13.7139 1.71387 9.42815 1.71387C5.14244 1.71387 1.71387 5.14244 1.71387 9.42815C1.71387 13.7139 5.14244 17.1424 9.42815 17.1424C11.2282 17.1424 12.9424 16.5424 14.2282 15.4282L20.8282 22.0282L22.0282 20.8282ZM9.42815 15.4282C6.0853 15.4282 3.42815 12.771 3.42815 9.42815C3.42815 6.0853 6.0853 3.42815 9.42815 3.42815C12.771 3.42815 15.4282 6.0853 15.4282 9.42815C15.4282 12.771 12.771 15.4282 9.42815 15.4282Z'

export function MultiSelectDropdown({
  label,
  options,
  value,
  defaultValue = [],
  onChange,
  allLabel = 'All Group',
  placeholder = 'Input option',
  searchLabel = 'Search',
  selectAllLabel = 'Select all channel',
  clearAllLabel = 'Clear All',
  searching = false,
  onSearchChange,
  listHeight,
  panelWidth = 399,
  lockWhenAllSelected = true,
  showSearch = true,
  showChips = true,
  fieldBoxClassName,
  disableSpentActions = false,
  labelPosition,
  outsideLabel,
  required,
  message,
  disabled = false,
  error = false,
  className,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [own, setOwn] = useState<string[]>(defaultValue)
  const selected = value ?? own
  const root = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  const set = (next: string[]) => {
    if (value === undefined) setOwn(next)
    onChange?.(next)
  }

  /* The board's close affordances: the field again, Escape, or anywhere
     outside. Select all and Clear All are explicitly not on this list — both
     annotations keep the panel open so the change stays visible. */
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  useEffect(() => {
    if (open) input.current?.focus()
    else {
      setQuery('')
      onSearchChange?.('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const allSelected = options.length > 0 && selected.length === options.length
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const panelState: MultiSelectState = searching
    ? 'searching'
    : query.trim() && filtered.length === 0
      ? 'no-results'
      : 'list'

  /* The field's four faces, straight off the frames: closed reads Default or
     Completed, open reads Selected - Empty or Selected - Completed. */
  const fieldState = disabled
    ? selected.length
      ? 'Disabled - Completed'
      : 'Disabled - Default'
    : error
      ? 'Error - Empty'
      : open
        ? selected.length
          ? 'Selected - Completed'
          : 'Selected - Empty'
        : selected.length
          ? 'Completed'
          : 'Default'

  const summary = allSelected
    ? allLabel
    : options
        .filter((o) => selected.includes(o.value))
        .map((o) => o.label)
        .join(', ')

  const toggle = (v: string) => {
    /* Annotation `7188:58846`: with everything selected the options are
       Selected+Disabled — a row cannot be pressed back out. See
       `lockWhenAllSelected`; a second file needs this off. */
    if (lockWhenAllSelected && allSelected) return
    set(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v])
  }

  return (
    <div ref={root} className={cn('webds-pattern-multi-select-dropdown', className)}>
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className={cn('webds-pattern-multi-select-dropdown-2', disabled ? 'webds-pattern-multi-select-dropdown-2--s1' : 'webds-pattern-multi-select-dropdown-2--s2')}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(!open)
          }
          if (e.key === 'Escape') setOpen(false)
        }}
      >
        <SelectField
          state={fieldState}
          label={label}
          labelPosition={labelPosition}
          outsideLabel={outsideLabel}
          required={required}
          message={message}
          boxClassName={fieldBoxClassName}
          value={
            /* The placeholder shows whenever the field is EMPTY, not only while
               it is open. Closed-and-empty drew nothing at all — a blank box,
               which no source draws: `1:171893` (Create template / Default)
               holds `Option` = "Input option" on `Text/Placeholder/Default`
               with the panel shut, and the single Select Field has always read
               `value || placeholder`. */
            !selected.length ? (
              placeholder
            ) : (
              <span className="webds-pattern-multi-select-dropdown-3">{summary}</span>
            )
          }
        />
      </div>

      {open && !disabled && (
        /* 🔴 The positioning is on a WRAPPER, not on the panel. `MultiSelectPanel`
           carries `stroke-inside`, and that utility is `position: relative`.
           Tailwind emits it after `absolute`, both are utilities of the same
           specificity, and `tailwind-merge` does not know the two conflict — so
           `absolute` survives in the class list and loses in the cascade. The
           panel then stays IN FLOW and the field's own row grows by its height.
           Any component carrying `stroke-inside` has this trap. */
        <div
          className={cn(
            'webds-pattern-multi-select-dropdown-4',
            panelWidth === 'fill' && 'webds-pattern-multi-select-dropdown-4--s1',
          )}
        >
        <MultiSelectPanel
          width={panelWidth === 'fill' ? '100%' : panelWidth}
          listHeight={listHeight}
          state={panelState}
          search={
            !showSearch ? undefined : (
            /* The panel's search row is the file's Text Field with the
               magnifier in Left Content (`7036:45739`) — always shrunk, label
               over a real input. The Typing Indicator the file draws is the
               caret, so the native caret takes its token. */
            <div className="webds-pattern-multi-select-dropdown-5">
              <FieldBox
                part="Text Field"
                tone={searchFocused ? 'focused' : 'default'}
                className="webds-pattern-multi-select-dropdown-6"
              >
                <div className="webds-pattern-multi-select-dropdown-7">
                  <FieldLabel shrunk>{searchLabel}</FieldLabel>
                  <div className="webds-pattern-multi-select-dropdown-8">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="webds-pattern-multi-select-dropdown-9">
                      <path d={SEARCH_24} className="webds-pattern-multi-select-dropdown-10" />
                    </svg>
                    <input
                      ref={input}
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value)
                        onSearchChange?.(e.target.value)
                      }}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
                      className="webds-pattern-multi-select-dropdown-11"
                    />
                  </div>
                </div>
              </FieldBox>
            </div>
            )
          }
          chips={
            /* Chips only while the selection is partial — the All Selected and
               No item frames draw no chip row — and only where the panel has a
               chip row at all (see `showChips`). */
            showChips && selected.length && !allSelected
              ? options
                  .filter((o) => selected.includes(o.value))
                  .map((o) => (
                    <RemovableChip key={o.value} onRemove={() => toggle(o.value)}>
                      {o.label}
                    </RemovableChip>
                  ))
              : undefined
          }
          options={filtered.map((o) => ({
            value: o.value,
            label: o.label,
            selected: selected.includes(o.value),
            disabled: lockWhenAllSelected && allSelected,
          }))}
          onToggle={toggle}
          footer={
            <>
              <GhostButton
                appearance="highlight"
                padding="none"
                disabled={disableSpentActions && allSelected}
                onClick={() => set(options.map((o) => o.value))}
              >
                {selectAllLabel}
              </GhostButton>
              <GhostButton
                appearance="highlight"
                padding="none"
                disabled={disableSpentActions && selected.length === 0}
                onClick={() => set([])}
              >
                {clearAllLabel}
                {/* `fill-current`, not the highlight token. Ghost Button puts
                    its state colour on the BUTTON as `text-*` — one class each
                    for rest, hover, pressed and disabled — so a hard-coded fill
                    only ever matches the resting one. With `disableSpentActions`
                    on, Clear All greys its label at zero selection and the mark
                    beside it stayed Icon/Highlight: half the control disabled.
                    Measured: label #939399, icon #0064FF. */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d={CLOSE_CIRCLE_16}
                    className="webds-pattern-multi-select-dropdown-12"
                  />
                </svg>
              </GhostButton>
            </>
          }
        />
        </div>
      )}
    </div>
  )
}
