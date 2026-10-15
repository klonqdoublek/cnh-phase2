import { Checkbox } from '@/bbl/checkbox'
import { RadioButton } from '@/bbl/radio-button'
import { FormField } from '@/patterns/form-field'
import { cn } from '@/lib/cn'

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
        spec={{ label, kind: multiline ? 'textarea' : 'text', required, max, boxHeight, placeholder: placeholder ?? '' }}
        value={value}
        error={error}
        disabled={disabled}
        onChange={onChange}
      />
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
