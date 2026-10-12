import { useState } from 'react'
import { Checkbox } from '@/bbl/checkbox'
import { RadioButton } from '@/bbl/radio-button'
import { TextArea } from '@/bbl/text-area'
import { FormField } from '@/patterns/form-field'
import { TIMES, smsInfo } from '@/data/broadcast'
import { cn } from '@/lib/cn'

/* The Create form's fields. Text, text area and select are webds `form-field`
 * (the CNH pattern); the rest are composed from webds parts where the library
 * draws no editable control. */

/** Body S, Text/Secondary — the original's `cnh-bc__note`. */
export const NOTE = 'type-body-s text-[var(--color-text-secondary-default)]'
/** Label L Emphasized, Text/Primary — the original's `cnh-bc__label`. */
export const LABEL = 'type-label-l-emphasized text-[var(--color-text-primary-default)]'

/** One text or text-area field. `data-field` lets Step 4's chips find the
 *  message box the cursor was last in; `data-error` is what Submit scrolls to. */
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
  disabled,
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
  disabled?: boolean
  className?: string
}) {
  return (
    <div
      data-field={id}
      data-error={error ? 'true' : undefined}
      /* A disabled text area renders its value as a span; keep its line breaks. */
      className={cn('min-w-0', multiline && 'whitespace-pre-line', className)}
    >
      <FormField
        spec={{ label, kind: multiline ? 'textarea' : 'text', required, max, placeholder: placeholder ?? '' }}
        value={value}
        error={error}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  )
}

/** SMS message — a text area whose counter is characters and SMS parts, not a max. */
export function SmsField({
  value,
  error,
  onChange,
  disabled,
}: {
  value: string
  error?: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const info = smsInfo(value)
  const state = disabled
    ? 'Disabled'
    : error
      ? value
        ? 'Error - Completed'
        : 'Error'
      : focused
        ? value
          ? 'Typing'
          : 'Focused'
        : value
          ? 'Completed'
          : 'Default'
  return (
    <div data-field="smsMessage" data-error={error ? 'true' : undefined}>
      <label className="flex w-full flex-col" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
        <TextArea
          state={state}
          label="SMS message"
          required
          value={value}
          onChange={disabled ? undefined : onChange}
          placeholder=""
          message={error ?? (info.unicode ? 'Thai · 70 per SMS' : 'English · 160 per SMS')}
          counter={`${info.length} characters · ${info.segments} SMS`}
        />
      </label>
    </div>
  )
}

/** Select — webds `form-field`'s select. The menu is capped so the 48 half-hour
 *  times do not run off the screen (Select List has no height of its own). */
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

export function TimeSelect(props: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
}) {
  return <Select {...props} options={TIMES} placeholder="HH:mm" className="w-[220px]" />
}

/** A bordered radio option with a title and a note — recipient type, delivery. */
export function ModeOption({
  on,
  label,
  description,
  onSelect,
}: {
  on: boolean
  label: string
  description: string
  onSelect: () => void
}) {
  return (
    <label
      className={cn(
        'flex flex-1 cursor-pointer items-start gap-[var(--space-2)] rounded-[var(--radius-2)] border border-[var(--color-border-primary-default)] px-[var(--space-4)] py-[var(--space-3)]',
        on && 'border-[var(--color-border-highlight-default)] bg-[var(--color-surface-highlight-subtle-default)]',
      )}
    >
      <RadioButton selected={on} onClick={onSelect} aria-label={label} />
      <span className="flex flex-col pt-[var(--space-2)]">
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
