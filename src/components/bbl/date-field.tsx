import { cn } from '@/lib/utils'
import { FieldBox, FieldLabel, FieldValue, toneFor } from './field'
import { Chevron } from './icons'
import { DatePicker, type DateCell, type DatePickerType } from './date-picker'

/* BBL Date Field — `public/r/specs/date-and-time-picker.json`, set "Date Field",
 * 6 variants on one `State` axis.
 *
 * A Select Field that opens a Date Picker. The box is the same
 * `Input Field Container` with the same floating label, the same chevron and the
 * same shrink behaviour; the two `Selected …` states drop the picker below it.
 *
 * Its root gap is **8**, where every field on the Input page uses 4. One number,
 * one component, and it is the file's. The field's own value run is named
 * `Option` in the selected and completed states and `Input option` when disabled
 * and completed — the same layer-name slip Select Field has, followed here for
 * the same reason.
 *
 * The picker overlays rather than reflows: the root stays 56 tall in all six
 * variants even where the 348-tall picker is drawn under it. */

export type DateFieldState =
  | 'default'
  | 'selected-empty'
  | 'selected-completed'
  | 'completed'
  | 'disabled-default'
  | 'disabled-completed'

const FIGMA_STATE: Record<DateFieldState, string> = {
  default: 'Default',
  'selected-empty': 'Selected - Empty',
  'selected-completed': 'Selected - Completed',
  completed: 'Completed',
  'disabled-default': 'Disabled - Default',
  'disabled-completed': 'Disabled - Completed',
}

export type DateFieldProps = {
  state?: DateFieldState
  label?: React.ReactNode
  value?: React.ReactNode
  /** The picker shown while the field is open. */
  pickerType?: DatePickerType
  pickerLabel?: React.ReactNode
  days?: DateCell[]
  cells?: DateCell[]
  className?: string
}

export function DateField({
  state = 'default',
  label = 'Select Date',
  value = 'Input option',
  pickerType = 'date',
  pickerLabel,
  days = [],
  cells = [],
  className,
}: DateFieldProps) {
  const figmaState = FIGMA_STATE[state]
  const tone = toneFor(figmaState)
  const open = state === 'selected-empty' || state === 'selected-completed'
  const shrunk = state !== 'default' && state !== 'disabled-default'
  const valuePart = state === 'disabled-completed' ? 'Input option' : 'Option'
  const empty = state === 'selected-empty'
  return (
    <div className={cn('webds-date-field', className)}>
      <FieldBox part="Input Field Container" tone={tone} className={cn('webds-date-field-2', shrunk ? 'webds-date-field-2--s1' : 'webds-date-field-2--s2')}>
        {shrunk ? (
          <div className="webds-date-field-3">
            <FieldLabel shrunk>{label}</FieldLabel>
            <div className="webds-date-field-4">
              <FieldValue part={valuePart} colour={state === 'disabled-completed' ? 'disabled' : 'primary'}>
                {empty ? ' ' : value}
              </FieldValue>
            </div>
          </div>
        ) : (
          <FieldLabel className="webds-date-field-5">{label}</FieldLabel>
        )}
        <Chevron
          name={open ? 'left-24' : 'down-16'}
          className={
            tone === 'disabled'
              ? 'webds-date-field-6--s1'
              : open
                ? 'fill-[var(--color-icon-highlight-default)]'
                : 'fill-[var(--color-icon-primary-default)]'
          }
        />
      </FieldBox>
      {open && (
        <div className="webds-date-field-7">
          <DatePicker part="Date Picker" type={pickerType} label={pickerLabel} days={days} cells={cells} />
        </div>
      )}
    </div>
  )
}
