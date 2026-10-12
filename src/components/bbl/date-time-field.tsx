import { cn } from '@/lib/utils'
import { FieldBox, FieldLabel, FieldValue, toneFor } from './field'
import { DateTimePicker } from './date-time-picker'
import type { DateCell, DatePickerType } from './date-picker'

/* BBL Date Time Field — `public/r/specs/date-and-time-picker.json`, set "Date
 * Time Field", 7 variants on one `State` axis.
 *
 * The Text Field version of the same idea: a `Text Field` box that takes a typed
 * `DD/MM/YYYY` and opens the Date Time Picker. Its extra state is `Typing`,
 * which adds a `.Building Block / Highlight Indicator` — a 22 × 24 mark on the
 * segment being typed, which is what makes this a masked field rather than a
 * text one.
 *
 * Root gap 8, like Date Field and unlike the Input page's 4. The picker overlays:
 * the root stays 56 tall in all seven variants. */

export type DateTimeFieldState =
  | 'default'
  | 'typing'
  | 'picker-empty'
  | 'picker-completed'
  | 'completed'
  | 'disabled-empty'
  | 'disabled-completed'

const FIGMA_STATE: Record<DateTimeFieldState, string> = {
  default: 'Default',
  typing: 'Typing',
  'picker-empty': 'Selected',
  'picker-completed': 'Selected',
  completed: 'Completed',
  'disabled-empty': 'Disabled - Default',
  'disabled-completed': 'Disabled - Completed',
}

export type DateTimeFieldProps = {
  state?: DateTimeFieldState
  label?: React.ReactNode
  value?: React.ReactNode
  selecting?: DatePickerType
  pickerLabel?: React.ReactNode
  days?: DateCell[]
  cells?: DateCell[]
  quickButtons?: React.ReactNode[]
  hours?: React.ReactNode[]
  minutes?: React.ReactNode[]
  selectedHour?: number
  selectedMinute?: number
  className?: string
}

export function DateTimeField({
  state = 'default',
  label = 'Select date and time',
  value = 'DD/MM/YYYY',
  selecting = 'date',
  pickerLabel,
  days = [],
  cells = [],
  quickButtons,
  hours,
  minutes,
  selectedHour,
  selectedMinute,
  className,
}: DateTimeFieldProps) {
  const tone = toneFor(FIGMA_STATE[state])
  const open = state === 'picker-empty' || state === 'picker-completed'
  const shrunk = state !== 'default' && state !== 'disabled-empty'
  return (
    <div className={cn('webds-date-time-field', className)}>
      <FieldBox part="Text Field" tone={tone} className={cn('webds-date-time-field-2', shrunk ? 'webds-date-time-field-2--s1' : 'webds-date-time-field-2--s2')}>
        {shrunk ? (
          <div className="webds-date-time-field-3">
            <FieldLabel shrunk>{label}</FieldLabel>
            <div className="webds-date-time-field-4">
              <FieldValue colour={state === 'disabled-completed' ? 'disabled' : 'primary'}>{value}</FieldValue>
              {state === 'typing' && (
                <span
                  data-part=".Building Block / Highlight Indicator"
                  className="webds-date-time-field-5"
                />
              )}
            </div>
          </div>
        ) : (
          <FieldLabel className="webds-date-time-field-6">{label}</FieldLabel>
        )}
      </FieldBox>
      {open && (
        <div className="webds-date-time-field-7">
          <DateTimePicker
            part="Date Time Picker"
            selecting={selecting}
            label={pickerLabel}
            days={days}
            cells={cells}
            quickButtons={quickButtons}
            hours={hours}
            minutes={minutes}
            selectedHour={selectedHour}
            selectedMinute={selectedMinute}
          />
        </div>
      )}
    </div>
  )
}
