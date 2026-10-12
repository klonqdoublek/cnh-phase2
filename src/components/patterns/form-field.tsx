import { useEffect, useRef, useState } from 'react'
import { TextField } from '@/bbl/text-field'
import { TextArea } from '@/bbl/text-area'
import { SelectField } from '@/bbl/select-field'
import { SelectList } from './select-list'
import { DropdownMenu } from './dropdown-menu'
import { MultiSelectDropdown } from './multi-select-dropdown'

/* **Form Field** — one editable field, driven by a spec.
 *
 * The library's `TextField` and `SelectField` are RENDER-ONLY: they draw the
 * spec and take the value as a node, because that is all a documentation page
 * needs. `TextArea` alone has an `onChange` opt-in. A product form therefore
 * cannot use them directly, and every consumer that has tried has written the
 * same wrapper — passing an `<input>` through the `value` slot, mapping its own
 * booleans onto the set's nine state names, and getting some of them wrong.
 *
 * This is that wrapper, once. Nothing is redrawn: the control is the library's
 * component with an `<input>` in the slot the library provides for it.
 *
 * **The state names are the point.** They are not one axis across the three
 * types, and reading them off a sibling is how they go wrong:
 *
 *   Text Field / Select Field   Default · Focused · Typing · Completed ·
 *                               Error - Default · Error - Typing ·
 *                               Error - Completed · Disabled - Default ·
 *                               Disabled - Completed
 *   Text Area                   drops the Disabled-Completed pairing, so plain
 *                               `Disabled`, and names the plain error `Error`
 *   Select Field                has no Focused at all — the open menu is
 *                               `Selected - Empty` / `Selected - Completed`
 *
 * A name that is not in the set does not throw. It falls through to a default
 * and looks nearly right, which is why `Disabled - Default` on a Text Area drew
 * its value in the placeholder ink for as long as nobody measured it.
 *
 * **`Label Position=Outside` is the layout a form page wants**, and not only for
 * the label: the Inside layout does not render the value slot in its non-shrunk
 * states, so an empty field has no `<input>` in the DOM and cannot be clicked
 * into. Outside draws the value row in every state.
 *
 * Consumer-measured, like everything in this lane. */

/** How a multiselect's value is joined into the one string the form carries —
 *  ", " is what the source draws in the filled field (1:172833). */
const SEPARATOR = ', '

export type FormFieldKind = 'text' | 'textarea' | 'select' | 'multiselect'

export type FormFieldSpec = {
  label: string
  kind: FormFieldKind
  required?: boolean
  /** Drawn as the counter's denominator, and enforced by the CONSUMER — this
   *  component does not truncate, because a source that draws an over-max error
   *  is a source where typing past the limit is possible. */
  max?: number
  /** `has Hint`. False hides the row entirely — no counter, no helper — but an
   *  error message is still drawn, because a hidden error is a worse defect
   *  than an extra row. */
  hasHint?: boolean
  /** The helper text under the box, where the source draws one. */
  hint?: React.ReactNode
  placeholder?: string
  options?: string[]
  /** The box height where a source does not draw the set's fixed 56. */
  boxHeight?: number
  /** A text field's `<input type>` — `password` masks it. Text only. */
  inputType?: 'text' | 'email' | 'password'
  /** Passed to the `<input>` so a password manager can fill the field. */
  autoComplete?: string
}

export type FormFieldProps = {
  spec: FormFieldSpec
  value: string
  /** Present means error. Carry a line break to state two rules at once — the
   *  sources write them as one run, not as two messages. */
  error?: string
  disabled?: boolean
  onChange: (value: string) => void
  /** The placeholder the sources draw in an empty select. */
  selectPlaceholder?: string
  /**
   * Passed to Select Field: which measurement of its Outside label to draw.
   * The set's spec and one platform's file disagree — see the note in
   * `bbl/select-field.tsx` — and a form has to be able to say which, or its
   * Selects stand 8 shorter than the Text Fields beside them.
   */
  selectOutsideLabel?: 'shrunk' | 'xl'
  /**
   * Where a select's label sits. Outside is the form page's (see the note
   * above). A FILTER BAR draws it Inside — `Financial planning`
   * (IfUYUQApZfEDkjIho9klKw · I8002:65923): "Account no." is the placeholder
   * at rest, shrinks over the value once one is picked or the menu opens, and the
   * 240 box stays 56 either way. Same open/close wiring; only the label moves.
   */
  selectLabelPosition?: 'Inside' | 'Outside'
  /** Render a select with its menu already open — a board's "drop down
   *  expanded" frame, played as a route (I8002:65923). */
  selectDefaultOpen?: boolean
  /** Which menu a select opens: Centralize Log's Select List (the default), or
   *  the library's Dropdown Menu, which the Financial planning filter bar places. */
  selectMenu?: 'select-list' | 'dropdown-menu'
}

const BOX_HEIGHT: Record<number, string> = { 56: 'h-[56px]', 77: 'h-[77px]' }

export function FormField({
  spec,
  value,
  error,
  disabled,
  onChange,
  selectPlaceholder = 'Input option',
  selectOutsideLabel,
  selectLabelPosition = 'Outside',
  selectDefaultOpen = false,
  selectMenu = 'select-list',
}: FormFieldProps) {
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(selectDefaultOpen)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focused) inputRef.current?.focus()
  }, [focused])

  const hasHint = spec.hasHint !== false
  const counter = hasHint && spec.max ? `${value.length}/${spec.max}` : undefined
  const message = error ?? (hasHint ? spec.hint : undefined)

  if (spec.kind === 'select') {
    const state = disabled
      ? value
        ? 'Disabled - Completed'
        : 'Disabled - Default'
      : error
        ? 'Error - Empty'
        : open
          ? value
            ? 'Selected - Completed'
            : 'Selected - Empty'
          : value
            ? 'Completed'
            : 'Default'
    return (
      <div className="webds-pattern-form-field">
        <button
          type="button"
          className="webds-pattern-form-field-2"
          disabled={disabled}
          aria-label={spec.label}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <SelectField
            state={state}
            label={spec.label}
            required={spec.required}
            labelPosition={selectLabelPosition}
            outsideLabel={selectOutsideLabel}
            /* Inside, an empty field shows its label as the placeholder — no
               value run — so the placeholder string is an Outside-only thing. */
            value={selectLabelPosition === 'Inside' ? value : value || selectPlaceholder}
            message={message}
          />
        </button>
        {open && (
          <>
            <div className="webds-pattern-form-field-3" onClick={() => setOpen(false)} />
            {/* The panel opens 8 below the field — `--space-2`, drawn. */}
            <div className="webds-pattern-form-field-4">
              {selectMenu === 'dropdown-menu' ? (
                <DropdownMenu
                  value={value}
                  options={(spec.options ?? []).map((o) => ({ value: o, label: o }))}
                  onSelect={(v) => {
                    onChange(v)
                    setOpen(false)
                  }}
                />
              ) : (
              <SelectList
                elevated
                /* The menu belongs to this field, so it takes the field's
                   width — not the 415 the component was measured at. */
                width="fill"
                options={(spec.options ?? []).map((o) => ({
                  value: o,
                  label: o,
                  selected: o === value,
                }))}
                onSelect={(v) => {
                  onChange(v)
                  setOpen(false)
                }}
              />
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  if (spec.kind === 'multiselect') {
    /* The same picker the filter bar uses, wearing the form's Select Field:
       label outside with the `*`, the error message under the box.
       `JjvzdUwg5LlKHDQvo2fny0` · 1:172832 draws it at 394 x 84 over a 394 x 281
       panel — five 40-tall CHECKBOX rows, a Divider and the two Ghost Buttons.
       Its sibling in the same row (Notification Group, `1:72576`) is 5 `Menu
       Item` rows of 36 with no divider and no footer, which is the single
       Select above — the two are NOT the same control, and only the layer name
       says they are ("Activity Option1 - Multi Selection" on both).

       The value stays a STRING, joined ", " — because that is what the field
       draws when it is filled ("NANOTI, NAOTP" on 1:172833), and because the
       form's required rule reads one. Safe only while no option contains the
       separator, which is the case for every LOV this serves. */
    const picked = value ? value.split(SEPARATOR) : []
    return (
      <MultiSelectDropdown
        label={spec.label}
        options={(spec.options ?? []).map((o) => ({ value: o, label: o }))}
        value={picked}
        onChange={(v) =>
          /* Emitted in the OPTIONS' order, not click order: the field is a
             summary of a set, and a summary that reshuffles as you tick reads
             as a different value each time. */
          onChange((spec.options ?? []).filter((o) => v.includes(o)).join(SEPARATOR))
        }
        labelPosition="Outside"
        outsideLabel={selectOutsideLabel}
        required={spec.required}
        message={message}
        disabled={disabled}
        error={!!error}
        placeholder={selectPlaceholder}
        /* The panel is the field's width, and it is the 291-panel's anatomy:
           no search row over five options, and no chip row — 1:72575 is 281
           tall, which is exactly pt8 + 5x40 + pb8 + divider + footer 56 + pb8
           with nothing left for one. */
        panelWidth="fill"
        showSearch={false}
        showChips={false}
        lockWhenAllSelected={false}
        /* The pattern's default is "Select all channel", measured on a board
           whose options ARE channels. Both BBL files that draw this panel carry
           the neutral one: `1:136265` §0.1.2.0 is a Ghost Button with
           `Label: "Select all"`, and the form's own panel (`1:72575`) draws the
           two buttons at the same 119 and 82. */
        selectAllLabel="Select all"
        /* No "All" summary here: that shorthand is the filter bar's, where
           every option ticked means "not filtering". A form field with every
           code ticked is a value, so it reads as the list. */
        allLabel={(spec.options ?? []).join(SEPARATOR)}
      />
    )
  }

  if (spec.kind === 'textarea') {
    /* Text Area's own names — see the note above. */
    const state = disabled
      ? 'Disabled'
      : error
        ? focused && value
          ? 'Error - Typing'
          : value
            ? 'Error - Completed'
            : 'Error'
        : focused
          ? value
            ? 'Typing'
            : 'Focused'
          : value
            ? 'Completed'
            : 'Default'
    /* `TextArea` takes no aria-label and renders its label as a span, so the
       control has no accessible name. A wrapping <label> names it the HTML way
       — and carries the focus listeners, because React's onFocus/onBlur are
       focusin/focusout and bubble, so the library component needs no new prop. */
    return (
      <label
        className="webds-pattern-form-field-5"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <TextArea
          state={state}
          label={spec.label}
          required={spec.required}
          value={value}
          onChange={disabled ? undefined : onChange}
          placeholder={spec.placeholder ?? 'Input text'}
          message={message}
          counter={counter}
        />
      </label>
    )
  }

  const state = disabled
    ? value
      ? 'Disabled - Completed'
      : 'Disabled - Default'
    : error
      ? value
        ? 'Error - Completed'
        : 'Error - Default'
      : focused
        ? value
          ? 'Typing'
          : 'Focused'
        : value
          ? 'Completed'
          : 'Default'

  return (
    <TextField
      state={state}
      label={spec.label}
      required={spec.required}
      labelPosition="Outside"
      boxClassName={spec.boxHeight ? BOX_HEIGHT[spec.boxHeight] : undefined}
      message={message}
      counter={counter}
      value={
        <input
          ref={inputRef}
          className="webds-pattern-form-field-6"
          type={spec.inputType}
          autoComplete={spec.autoComplete}
          value={value}
          disabled={disabled}
          aria-label={spec.label}
          aria-required={spec.required}
          aria-invalid={!!error}
          placeholder={spec.placeholder ?? 'Input text'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
        />
      }
    />
  )
}
