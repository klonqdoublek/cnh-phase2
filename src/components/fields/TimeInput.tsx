import { useLayoutEffect, useRef, useState } from 'react'
import { DateTimePicker } from '@/bbl/date-time-picker'
import { FIELD_TEXT, FieldBox, FieldHint, FieldLabel, FieldRoot, toneFor } from '@/bbl/field'
import { Icon } from '@/bbl/icon'
import { cn } from '@/lib/cn'
import { padTwo } from './date-parts'
import { PICKER_STATE_GAPS } from './picker-state-gaps'
import { useDismissOnOutside } from './useDismissOnOutside'

const HOURS = Array.from({ length: 24 }, (_, hour) => padTwo(hour))
/** Half-hour steps — the original build's `TIMES`. */
const MINUTES = ['00', '30']

/* The installed `DateTimePicker` with its calendar half and CTA row hidden,
   leaving the library's own Time column: the "Time" header over the hour and
   minute lists, their Selected fill, and the hover CMS adds. */
const TIME_ONLY = cn(
  '[&_.webds-date-time-picker-3]:hidden',
  '[&_.webds-date-time-picker-10]:hidden',
  '[&_.webds-date-time-picker-6]:shadow-none',
)

/**
 * A time field, `HH:mm`. webds ships no time-only field or picker (a gap —
 * `TimeColumn` lives inside `DateTimePicker` and is not exported), so this is
 * the box of `DateInput` with Time 24 for its mark, opening the Time column of
 * the installed `DateTimePicker` (CMS v4.56's time half, `3074:199189`).
 *
 * A pick applies at once, as CMS's does: an hour keeps the chosen minute (00
 * when there is none); a minute closes the picker. A minute picked before any
 * hour waits for one. A press outside or Escape only closes.
 */
export function TimeInput({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  placeholder = 'HH:mm',
  className,
}: {
  label: string
  /** `HH:mm`, or '' for none. */
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pendingMinute, setPendingMinute] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  useDismissOnOutside(open, rootRef, setOpen)

  const hour = value ? value.slice(0, 2) : null
  const minute = value ? value.slice(3, 5) : pendingMinute

  /* Open on the chosen hour and minute, not on 00. */
  useLayoutEffect(() => {
    if (!open) return
    panelRef.current?.querySelectorAll<HTMLElement>('.webds-time-column-2--s2').forEach((cell) => {
      const column = cell.parentElement
      if (column) column.scrollTop = cell.offsetTop - column.offsetTop - (column.clientHeight - cell.offsetHeight) / 2
    })
  }, [open])

  const selectHour = (index: number) => {
    onChange(`${HOURS[index]}:${minute ?? '00'}`)
    setPendingMinute(null)
  }
  const selectMinute = (index: number) => {
    if (hour == null) return setPendingMinute(MINUTES[index])
    onChange(`${hour}:${MINUTES[index]}`)
    setOpen(false)
  }
  const toggle = () => {
    if (!open) setPendingMinute(null)
    setOpen((current) => !current)
  }

  const focusedLook = !disabled && (focused || open)
  const tone = toneFor(
    disabled
      ? value
        ? 'Disabled - Completed'
        : 'Disabled - Default'
      : error
        ? value
          ? 'Error - Completed'
          : 'Error'
        : focusedLook
          ? 'Focused'
          : value
            ? 'Completed'
            : 'Default',
  )

  return (
    <div ref={rootRef} data-error={error ? 'true' : undefined} className={cn('relative w-[220px] min-w-0', className)}>
      <FieldRoot>
        <FieldLabel colour={disabled ? 'disabled' : 'tertiary'} required={required}>
          {label}
        </FieldLabel>
        <div className="relative">
          <button
            type="button"
            aria-label={label.trim() || placeholder}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-required={required}
            aria-invalid={!!error}
            disabled={disabled}
            onClick={toggle}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="block w-full cursor-pointer text-left outline-none disabled:cursor-default"
          >
            <FieldBox part="Text Field" tone={tone} className="h-[56px] items-center gap-[var(--space-2)] p-[var(--space-4)]">
              <span
                className={cn(
                  'min-w-px flex-1 truncate type-body-m',
                  disabled ? FIELD_TEXT.disabled : value ? FIELD_TEXT.primary : FIELD_TEXT.placeholder,
                )}
              >
                {value || placeholder}
              </span>
              <Icon
                slug="time"
                size={24}
                color={
                  disabled
                    ? 'var(--color-icon-disabled-default)'
                    : focusedLook
                      ? 'var(--color-icon-highlight-default)'
                      : 'var(--color-icon-primary-default)'
                }
              />
            </FieldBox>
          </button>
          {open && (
            <div
              ref={panelRef}
              role="dialog"
              aria-label={label.trim() || placeholder}
              className={cn(
                'absolute top-[calc(100%+var(--space-2))] left-0 z-30 h-[396px] w-[112px] rounded-[var(--radius-3)] bg-[var(--color-surface-primary-default)] shadow-[var(--shadow-raised)]',
                PICKER_STATE_GAPS,
                TIME_ONLY,
              )}
            >
              <DateTimePicker
                hours={HOURS}
                minutes={MINUTES}
                selectedHour={hour == null ? undefined : HOURS.indexOf(hour)}
                selectedMinute={minute == null ? undefined : MINUTES.indexOf(minute)}
                onSelectHour={selectHour}
                onSelectMinute={selectMinute}
              />
            </div>
          )}
        </div>
        <FieldHint message={error} tone={tone} />
      </FieldRoot>
    </div>
  )
}
