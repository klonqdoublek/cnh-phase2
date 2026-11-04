import { Checkbox } from '@/bbl/checkbox'
import { RadioButton } from '@/bbl/radio-button'
import { Divider } from '@/bbl/divider'
import { FIELD_TEXT, FieldBox, FieldHint, FieldLabel, FieldRoot } from '@/bbl/field'
import { FormField } from '@/patterns/form-field'
import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { FieldTint, hasField, type Tint } from './highlight'

/* The Create form's fields. Text, text area and select are webds `form-field`
 * (the CNH pattern); the rest are composed from webds parts where the library
 * draws no editable control. */

/** Body S, Text/Secondary — the original's `cnh-bc__note`. */
export const NOTE = 'type-body-s text-[var(--color-text-secondary-default)]'
/** Label L Emphasized, Text/Primary — the original's `cnh-bc__label`. */
export const LABEL = 'type-label-l-emphasized text-[var(--color-text-primary-default)]'

/** One text or text-area field. `data-field` lets the field chips find the
 *  message box the cursor was last in; `data-error` is what Submit scrolls to.
 *  `boxHeight` is the Template form's taller one-line box (Push message). */
export function Text({
  id,
  label,
  value,
  onChange,
  max,
  error,
  placeholder,
  required,
  multiline,
  boxHeight,
  disabled,
  hint,
  tint,
  className,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  max?: number
  error?: string
  placeholder?: string
  required?: boolean
  multiline?: boolean
  boxHeight?: 77
  disabled?: boolean
  /** Helper text under the box, where an error is not. */
  hint?: string
  /** The file's columns: their `${COLUMN}` tokens are drawn as tinted chips
   *  and erased whole (./highlight.tsx). The box's own text goes transparent
   *  under the layer. */
  tint?: Tint
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const tinted = !!tint && !disabled && hasField(value, tint.columns)
  return (
    <div
      ref={root}
      data-field={id}
      data-error={error ? 'true' : undefined}
      /* A disabled text area renders its value as a span; keep its line breaks. */
      className={cn(
        'relative min-w-0',
        multiline && 'whitespace-pre-line',
        tinted &&
          '[&_input]:text-transparent [&_input]:[caret-color:var(--color-text-primary-default)] [&_textarea]:text-transparent [&_textarea]:[caret-color:var(--color-text-primary-default)]',
        className,
      )}
    >
      <FormField
        spec={{ label, kind: multiline ? 'textarea' : 'text', required, max, boxHeight, hint, placeholder: placeholder ?? '' }}
        value={value}
        error={error}
        disabled={disabled}
        onChange={onChange}
      />
      {tint && !disabled && <FieldTint root={root} value={value} tint={tint} onChange={onChange} />}
    </div>
  )
}

/** A message box that takes dynamic fields, composed after Core's Rich Text
 *  Editor (Figma kAh4cyaNvmdz5yNYP2uv2i 11002:22606; webds ships none, gap): a
 *  12-radius box with a 48 toolbar, a divider and the text. Only the toolbar and
 *  the divider are borrowed. There is no formatting and the bottom 48 full-view
 *  row is gone, so the text area takes that height (requester, 4 Nov 2026). The
 *  label and the counter stay the fields' own. `data-field` wraps the text alone,
 *  not the toolbar, so the tint layer, `$` and the button never take the pop-up's
 *  search box for the message box. */
export function MessageEditor({
  id,
  label,
  value,
  onChange,
  max,
  error,
  placeholder,
  required,
  multiline,
  disabled,
  tint,
  toolbar,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  max?: number
  error?: string
  placeholder?: string
  required?: boolean
  multiline?: boolean
  disabled?: boolean
  tint?: Tint
  toolbar: React.ReactNode
}) {
  const root = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const tinted = !!tint && !disabled && hasField(value, tint.columns)
  const control = {
    value,
    disabled,
    placeholder,
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': !!error,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    /* The padding is the control's, so all of the text area takes the caret. */
    className: cn(
      'webds-text-area-2 min-h-0 resize-none rounded-b-[var(--radius-3)] p-[var(--space-4)]',
      FIELD_TEXT[disabled ? 'disabled' : value ? 'primary' : 'placeholder'],
      tinted && 'text-transparent [caret-color:var(--color-text-primary-default)]',
    ),
  }
  const tone = disabled ? 'disabled' : error ? 'error' : focused ? 'focused' : 'default'
  return (
    <div data-error={error ? 'true' : undefined} className="min-w-0">
      <FieldRoot>
        <FieldLabel colour={disabled ? 'disabled' : 'tertiary'} required={required}>
          {label}
        </FieldLabel>
        <FieldBox
          part="Message editor"
          tone={tone}
          className={cn('flex-col gap-0 rounded-[var(--radius-3)]', multiline ? 'h-[218px]' : 'h-[105px]')}
        >
          <div className="flex shrink-0 items-center p-[var(--space-3)]">{toolbar}</div>
          <Divider className="shrink-0" />
          <div ref={root} data-field={id} className="relative flex min-h-0 flex-1 flex-col">
            {multiline ? (
              <textarea {...control} onChange={(e) => onChange(e.target.value)} />
            ) : (
              <input {...control} onChange={(e) => onChange(e.target.value)} />
            )}
            {tint && !disabled && <FieldTint root={root} value={value} tint={tint} onChange={onChange} />}
          </div>
        </FieldBox>
        <FieldHint message={error} counter={max ? `${value.length}/${max}` : undefined} tone={tone} />
      </FieldRoot>
    </div>
  )
}

/** Select — webds `form-field`'s select. The menu is capped so a long list
 *  does not run off the screen (Select List has no height of its own). */
export function Select({
  label,
  value,
  options,
  onChange,
  error,
  hint,
  required,
  disabled,
  placeholder,
  className,
}: {
  label: string
  value: string
  options: string[] | { value: string; label: string }[]
  onChange: (v: string) => void
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}) {
  /* form-field carries a select's value as the label it shows; map back on pick. */
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const shown = items.find((o) => o.value === value)?.label ?? value
  return (
    <div
      data-error={error ? 'true' : undefined}
      className={cn(
        'min-w-0 [&_.webds-pattern-form-field-4]:max-h-[280px] [&_.webds-pattern-form-field-4]:overflow-y-auto',
        className,
      )}
    >
      <FormField
        spec={{ label, kind: 'select', required, hint, options: items.map((o) => o.label) }}
        value={shown}
        error={error}
        disabled={disabled}
        selectPlaceholder={placeholder ?? ''}
        selectOutsideLabel="xl"
        onChange={(l) => onChange(items.find((o) => o.label === l)?.value ?? l)}
      />
    </div>
  )
}

/** A radio with a title and a note under it — recipient type, delivery.
 *  Plain, no box around it (draft 2.2 webds-matched, Figma 85:19401). */
export function ModeOption({
  on,
  label,
  description,
  onSelect,
  className,
}: {
  on: boolean
  label: string
  description: string
  onSelect: () => void
  className?: string
}) {
  return (
    <label className={cn('flex min-w-0 cursor-pointer items-start gap-[var(--space-2)]', className)}>
      <RadioButton selected={on} onClick={onSelect} aria-label={label} />
      <span className="flex flex-col">
        <span className={LABEL}>{label}</span>
        <span className={NOTE}>{description}</span>
      </span>
    </label>
  )
}

/** A checkbox or radio with its label beside it — clicking the label toggles. */
export function Choice({
  kind,
  on,
  onChange,
  label,
  ariaLabel,
  disabled,
}: {
  kind: 'checkbox' | 'radio'
  on: boolean
  onChange: (on: boolean) => void
  label: React.ReactNode
  ariaLabel: string
  disabled?: boolean
}) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-[var(--space-2)] type-body-s text-[var(--color-text-primary-default)]',
        disabled ? 'cursor-default text-[var(--color-text-disabled-default)]' : 'cursor-pointer',
      )}
    >
      {kind === 'checkbox' ? (
        <Checkbox
          selection={on ? 'selected' : 'none'}
          disabled={disabled}
          aria-label={ariaLabel}
          onClick={() => onChange(!on)}
        />
      ) : (
        <RadioButton selected={on} disabled={disabled} aria-label={ariaLabel} onClick={() => onChange(true)} />
      )}
      {label}
    </label>
  )
}
