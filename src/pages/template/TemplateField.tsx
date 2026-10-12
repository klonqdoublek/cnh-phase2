import { useState } from 'react'
import { TextArea } from '@/bbl/text-area'
import { FormField } from '@/patterns/form-field'
import { MultiSelectDropdown } from '@/patterns/multi-select-dropdown'
import type { FieldSpec } from './form-spec'

type Props = {
  spec: FieldSpec
  value: string
  error?: string
  disabled?: boolean
  onChange: (value: string) => void
}

/**
 * One field of the notification form. Text fields and both selects go through
 * webds `form-field`. Multi-line fields use the library `TextArea` directly,
 * driven by the same state names `form-field` uses, for two reasons (GAPS in
 * `form-field`'s textarea kind):
 *  - it drops the editable control when disabled, so a switched-off channel
 *    card shows empty boxes where the original shows their placeholders;
 *  - it takes no box height, and the original draws Push message and Sender
 *    name as 77-tall Text Areas so a long value wraps.
 */
export function TemplateField({ spec, value, error, disabled, onChange }: Props) {
  if (spec.kind === 'textarea' || (spec.kind === 'text' && spec.boxHeight))
    return <AreaField spec={spec} value={value} error={error} disabled={disabled} onChange={onChange} />

  if (spec.kind === 'multiselect') return <ServiceCodes spec={spec} value={value} error={error} disabled={disabled} onChange={onChange} />

  return (
    <FormField
      spec={{
        label: spec.label,
        kind: spec.kind,
        required: spec.required,
        max: spec.max,
        hasHint: spec.hasHint,
        hint: spec.hint,
        placeholder: spec.placeholder,
        options: spec.options ? [...spec.options] : undefined,
      }}
      value={value}
      error={error}
      disabled={disabled}
      onChange={onChange}
      selectPlaceholder={spec.placeholder}
      /* The form's Selects stand level with its Text Fields: 84 tall, label
         at Label XL, as the original draws them. */
      selectOutsideLabel="xl"
    />
  )
}

const BOX_HEIGHT: Record<number, string> = { 77: 'h-[77px]' }

function AreaField({ spec, value, error, disabled, onChange }: Props) {
  const [focused, setFocused] = useState(false)
  const hasHint = spec.hasHint !== false
  const counter = hasHint && spec.max ? `${value.length}/${spec.max}` : undefined
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
  return (
    <label className="block w-full" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      <TextArea
        state={state}
        label={spec.label}
        required={spec.required}
        value={value}
        onChange={onChange}
        placeholder={spec.placeholder}
        message={error ?? (hasHint ? spec.hint : undefined)}
        counter={counter}
        boxClassName={spec.boxHeight ? BOX_HEIGHT[spec.boxHeight] : undefined}
      />
    </label>
  )
}

const SEPARATOR = ', '

/**
 * The multi-select, configured exactly as `form-field`'s multiselect kind
 * configures it, plus the one thing that kind does not forward: the footer's
 * clear label. The original draws "Clear"; the pattern defaults to "Clear All".
 * GAP: form-field does not pass `clearAllLabel` through.
 */
function ServiceCodes({ spec, value, error, disabled, onChange }: Props) {
  const options = [...(spec.options ?? [])]
  const picked = value ? value.split(SEPARATOR) : []
  return (
    <MultiSelectDropdown
      label={spec.label}
      options={options.map((o) => ({ value: o, label: o }))}
      value={picked}
      onChange={(v) => onChange(options.filter((o) => v.includes(o)).join(SEPARATOR))}
      labelPosition="Outside"
      outsideLabel="xl"
      required={spec.required}
      message={error}
      disabled={disabled}
      error={!!error}
      placeholder={spec.placeholder}
      panelWidth="fill"
      showSearch={false}
      showChips={false}
      lockWhenAllSelected={false}
      selectAllLabel="Select all"
      clearAllLabel="Clear"
      allLabel={options.join(SEPARATOR)}
    />
  )
}
