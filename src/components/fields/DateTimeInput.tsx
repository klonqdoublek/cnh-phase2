import { FieldBox, FieldHint, FieldLabel, FieldRoot, FIELD_TEXT } from '@/bbl/field'
import { Icon } from '@/bbl/icon'
import { OutlineButton } from '@/bbl/outline-button'
import { DateTimePicker } from '@/bbl/date-time-picker'
import { cn } from '@/lib/cn'
import { MONTHS, displayDateTime } from './date-parts'
import { PickerHeaderLabel } from './PickerHeaderLabel'
import { periodCells } from './period-cells'
import { PICKER_STATE_GAPS } from './picker-state-gaps'
import { useDateTimeField } from './useDateTimeField'

/**
 * **Date and time field** — the CMS prototype's `DateTimeInput` (v4.56), so
 * both consoles pick a date and time the same way.
 *
 * The library's `Date Time Field`: an Outside label over a Text Field box —
 * the value `DD/MM/YYYY, HH:mm`, or the placeholder, then **Calendar 24**.
 * webds' own `DateTimeField` is a spec render (value as a node, no press), so
 * the field is composed from the installed `FieldRoot` / `FieldLabel` /
 * `FieldBox` / `FieldHint` primitives.
 *
 * Pressing it opens webds' `DateTimePicker` under the box — month grid, hour
 * and minute columns, **Today** as a 32-tall Outline button (keeps the chosen
 * time). No Cancel / OK row (`has CTA = No`): a pick applies at once. A click
 * outside or Escape closes it. The chosen day is filled, today ringed, day
 * rows 8 apart, the header label opens the Year, then Month views.
 *
 * Composed — a gap CMS reported: the webds pieces are presentational and do
 * no date arithmetic. The value is a `YYYY-MM-DDTHH:mm` string.
 */
export function DateTimeInput({
  value,
  onChange,
  label,
  required,
  message,
  error = false,
  disabled = false,
  placeholder = 'Select date and time',
  minuteStep = 5,
  defaultTime = [0, 0],
  min,
  className,
}: {
  /** `YYYY-MM-DDTHH:mm`, or '' for none. */
  value: string
  onChange: (value: string) => void
  label: string
  required?: boolean
  message?: React.ReactNode
  error?: boolean
  disabled?: boolean
  placeholder?: string
  /** CMS steps by 5 or 1; the broadcast start keeps the original's 30. */
  minuteStep?: 1 | 5 | 30
  /** The time a first day pick fills in. */
  defaultTime?: [number, number]
  /** `YYYY-MM-DD`; earlier days are muted and cannot be picked. */
  min?: string
  className?: string
}) {
  const field = useDateTimeField({ value, onChange, disabled, error, minuteStep, defaultTime, min })

  return (
    <div ref={field.rootRef} data-error={error ? 'true' : undefined} className={cn('relative', className)}>
      <FieldRoot>
        <FieldLabel colour={disabled ? 'disabled' : 'tertiary'} required={required}>
          {label}
        </FieldLabel>
        <div className="relative">
          <button
            type="button"
            aria-label={label}
            aria-haspopup="dialog"
            aria-expanded={field.open}
            aria-invalid={error || undefined}
            disabled={disabled}
            onClick={field.toggle}
            onFocus={() => field.setFocused(true)}
            onBlur={() => field.setFocused(false)}
            className="block w-full cursor-pointer text-left outline-none disabled:cursor-default"
          >
            <FieldBox part="Text Field" tone={field.tone} className="h-[56px] items-center gap-[var(--space-2)] p-[var(--space-4)]">
              <span
                className={cn(
                  'min-w-px flex-1 truncate type-body-m',
                  disabled ? FIELD_TEXT.disabled : field.shown ? FIELD_TEXT.primary : FIELD_TEXT.placeholder,
                )}
              >
                {field.shown ? displayDateTime(field.shown) : placeholder}
              </span>
              <Icon
                slug="calendar"
                size={24}
                color={
                  disabled
                    ? 'var(--color-icon-disabled-default)'
                    : field.focusedLook
                      ? 'var(--color-icon-highlight-default)'
                      : 'var(--color-icon-primary-default)'
                }
              />
            </FieldBox>
          </button>
          {field.open && (
            /* 432 wide, webds' Date Time Picker with `has CTA = No` (CMS final
               UI `3074:199189`): 456 less the 60-tall CTA row the installed
               component always draws. */
            <div
              role="dialog"
              aria-label={label}
              className={cn(
                'absolute top-[calc(100%+var(--space-2))] left-0 z-30 h-[396px] w-[432px] rounded-[var(--radius-3)] bg-[var(--color-surface-primary-default)] shadow-[var(--shadow-overlay)]',
                PICKER_STATE_GAPS,
              )}
            >
              <DateTimePicker
                selecting={field.views.pickerView}
                label={
                  <PickerHeaderLabel
                    text={`${MONTHS[field.view.month]} ${field.view.year}`}
                    pickerView={field.views.pickerView}
                    onToggle={field.views.toggleView}
                  />
                }
                days={field.days}
                cells={periodCells({
                  pickerView: field.views.pickerView,
                  months: field.views.months,
                  years: field.views.years,
                  onMonth: field.views.selectMonth,
                  onYear: field.views.selectYear,
                })}
                rowGap
                onPrevious={() => field.shift(-1)}
                onNext={() => field.shift(1)}
                onSelectDay={field.selectDay}
                hours={field.hours}
                minutes={field.minutes}
                selectedHour={field.selectedHour}
                selectedMinute={field.selectedMinute}
                onSelectHour={field.selectHour}
                onSelectMinute={field.selectMinute}
                quickButtons={[
                  <OutlineButton key="today" className="h-[32px]" onClick={field.selectToday}>
                    Today
                  </OutlineButton>,
                ]}
              />
            </div>
          )}
        </div>
        <FieldHint message={message} tone={field.tone} />
      </FieldRoot>
    </div>
  )
}
