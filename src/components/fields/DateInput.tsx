import { useRef, useState } from 'react'
import { DatePicker, type DateCell } from '@/bbl/date-picker'
import { FIELD_TEXT, FieldBox, FieldHint, FieldLabel, FieldRoot, toneFor } from '@/bbl/field'
import { Icon } from '@/bbl/icon'
import { OutlineButton } from '@/bbl/outline-button'
import { cn } from '@/lib/cn'
import { MONTHS, MONTH_GRID_CELLS, dayInGridCell, displayDate, isoDate, monthOf, shiftMonth, type MonthView } from './date-parts'
import { periodCells } from './period-cells'
import { PickerHeaderLabel } from './PickerHeaderLabel'
import { PICKER_STATE_GAPS } from './picker-state-gaps'
import { useDismissOnOutside } from './useDismissOnOutside'
import { usePickerViews } from './usePickerViews'

/**
 * A date field, taken from the CMS prototype (v4.56) so both consoles pick a
 * date the same way: the box of CMS `DateTimeInput` (Outside label, 56 tall,
 * the value as `DD/MM/YYYY` then Calendar 24) opening the webds `DatePicker`
 * the way CMS `DateFilter` does, with **Select today** under the grid.
 *
 * The picker's states are CMS's (final UI `3074:199189`): the chosen day
 * filled, today ringed, day rows 8 apart, cells answer hover, the header
 * label's chevron opens the Year, then Month views. A pick applies at once
 * and closes; a press outside or Escape only closes. Days before `min` are
 * muted and cannot be picked — the original build's `disablePast`.
 *
 * Composed — a gap CMS reported: webds' `DateField` / `DatePicker` are spec
 * renders that hold no value and do no date arithmetic.
 */
export function DateInput({
  label,
  value,
  onChange,
  error,
  min,
  required = true,
  placeholder = 'DD/MM/YYYY',
  className,
}: {
  label: string
  /** `YYYY-MM-DD`, or '' for none. */
  value: string
  onChange: (value: string) => void
  error?: string
  /** `YYYY-MM-DD`; earlier days are muted. */
  min?: string
  required?: boolean
  placeholder?: string
  className?: string
}) {
  const now = new Date()
  const today = isoDate(now.getFullYear(), now.getMonth(), now.getDate())
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [view, setView] = useState<MonthView>(() => monthOf(value || today))
  const rootRef = useRef<HTMLDivElement>(null)
  const views = usePickerViews({ view, setView, today: monthOf(today) })

  useDismissOnOutside(open, rootRef, setOpen)

  /* 42 cells, Sunday first; days outside the month are blank, as CMS draws. */
  const days: DateCell[] = Array.from({ length: MONTH_GRID_CELLS }, (_, cellIndex) => {
    const day = dayInGridCell(cellIndex, view)
    if (day == null) return { label: '' }
    const at = isoDate(view.year, view.month, day)
    if (at === value) return { label: day, tone: 'selected' }
    if (min && at < min) return { label: day, tone: 'muted' }
    return { label: day, tone: at === today ? 'outlined' : 'default' }
  })

  const pick = (date: string) => {
    onChange(date)
    setView(monthOf(date))
    setOpen(false)
  }
  const selectDay = (cellIndex: number) => {
    const day = dayInGridCell(cellIndex, view)
    if (day != null) pick(isoDate(view.year, view.month, day))
  }
  const toggle = () => {
    if (!open) {
      views.resetView()
      setView(monthOf(value || today))
    }
    setOpen((current) => !current)
  }

  const focusedLook = focused || open
  const tone = toneFor(error ? (value ? 'Error - Completed' : 'Error') : focusedLook ? 'Focused' : value ? 'Completed' : 'Default')

  return (
    <div ref={rootRef} data-error={error ? 'true' : undefined} className={cn('relative min-w-0', className)}>
      <FieldRoot>
        <FieldLabel colour="tertiary" required={required}>
          {label}
        </FieldLabel>
        <div className="relative">
          <button
            type="button"
            aria-label={label}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-required={required}
            aria-invalid={!!error}
            onClick={toggle}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="block w-full cursor-pointer text-left outline-none"
          >
            <FieldBox part="Date Field" tone={tone} className="h-[56px] items-center gap-[var(--space-2)] p-[var(--space-4)]">
              <span className={cn('min-w-px flex-1 truncate type-body-m', value ? FIELD_TEXT.primary : FIELD_TEXT.placeholder)}>
                {value ? displayDate(value) : placeholder}
              </span>
              <Icon
                slug="calendar"
                size={24}
                color={focusedLook ? 'var(--color-icon-highlight-default)' : 'var(--color-icon-primary-default)'}
              />
            </FieldBox>
          </button>
          {open && (
            <div
              role="dialog"
              aria-label={label}
              className={cn(
                'absolute top-[calc(100%+var(--space-2))] left-0 z-30 flex w-[320px] flex-col rounded-[var(--radius-3)] bg-[var(--color-surface-primary-default)] shadow-[var(--shadow-raised)]',
                PICKER_STATE_GAPS,
              )}
            >
              <DatePicker
                type={views.pickerView}
                label={
                  <PickerHeaderLabel
                    text={`${MONTHS[view.month]} ${view.year}`}
                    pickerView={views.pickerView}
                    onToggle={views.toggleView}
                  />
                }
                days={days}
                cells={periodCells({
                  pickerView: views.pickerView,
                  months: views.months,
                  years: views.years,
                  onMonth: views.selectMonth,
                  onYear: views.selectYear,
                })}
                rowGap
                onSelectDay={selectDay}
                onPrevious={() => setView((current) => shiftMonth(current, -1))}
                onNext={() => setView((current) => shiftMonth(current, 1))}
              />
              <div className="flex items-center gap-[var(--space-2)] px-[var(--space-4)] pb-[var(--space-4)]">
                <OutlineButton onClick={() => pick(today)}>Select today</OutlineButton>
              </div>
            </div>
          )}
        </div>
        <FieldHint message={error} tone={tone} />
      </FieldRoot>
    </div>
  )
}
