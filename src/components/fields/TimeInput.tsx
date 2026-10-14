import { useLayoutEffect, useRef, useState } from 'react'
import { FIELD_TEXT, FieldBox, FieldHint, FieldLabel, FieldRoot, toneFor } from '@/bbl/field'
import { Icon } from '@/bbl/icon'
import { cn } from '@/lib/cn'
import { padTwo } from './date-parts'
import { PICKER_STATE_GAPS } from './picker-state-gaps'
import { useDismissOnOutside } from './useDismissOnOutside'

const HOURS = Array.from({ length: 24 }, (_, index) => padTwo(index))

/** The box of the nearest scrolling ancestor — what the page shows of the
 *  form — or the window. */
function visibleArea(el: HTMLElement): { top: number; bottom: number } {
  for (let node = el.parentElement?.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node)
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight)
      return node.getBoundingClientRect()
  }
  return { top: 0, bottom: window.innerHeight }
}

/** One scrolling column of the installed Date Time Picker's time half — its
 *  own `webds-time-column` cells, drawn here because the component does not
 *  export `TimeColumn`. */
function Column({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string
  values: string[]
  selected?: number
  onSelect: (index: number) => void
}) {
  return (
    <div role="listbox" aria-label={label} className="webds-time-column overflow-y-auto">
      {values.map((v, i) => (
        <span
          key={v}
          role="option"
          aria-selected={i === selected}
          onClick={() => onSelect(i)}
          className={cn('webds-time-column-2', 'webds-time-column-2--s1', i === selected && 'webds-time-column-2--s2')}
        >
          <span
            data-part="Date"
            className={
              i === selected ? 'webds-date-time-picker--time-cell-selected' : 'webds-date-time-picker--time-cell'
            }
          >
            {v}
          </span>
        </span>
      ))}
    </div>
  )
}

/**
 * A time field, `HH:mm`, for the Do Not Disturb quiet period. webds ships no
 * time-only field or picker (a gap), so this is the box of `DateTimeInput`
 * with Time 24 for its mark, opening the time half of webds' Date Time Picker
 * on its own: the 56-tall "Time" header over an hour and a minute column, in
 * `minuteStep` steps (5, the BA's step since 2026-10-14). As in
 * `DateTimeInput`, a pick applies at once (CMS v4.56); choosing the minute
 * closes it. It opens on the chosen time. A press outside or Escape only closes.
 */
export function TimeInput({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  placeholder = 'HH:mm',
  minuteStep = 5,
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
  minuteStep?: 1 | 5 | 30
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [above, setAbove] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  useDismissOnOutside(open, rootRef, setOpen)

  /* Open above the box when the visible area has no room under it — the
     quiet period sits at the foot of the form, behind the sticky action bar. */
  useLayoutEffect(() => {
    const menu = menuRef.current
    const box = menu?.parentElement?.getBoundingClientRect()
    if (!open || !menu || !box) return setAbove(false)
    const area = visibleArea(menu)
    setAbove(box.bottom + menu.offsetHeight > area.bottom && box.top - menu.offsetHeight > area.top)
  }, [open])

  const minutes = Array.from({ length: 60 / minuteStep }, (_, index) => padTwo(index * minuteStep))
  const [hour, minute] = value ? value.split(':').map(Number) : [undefined, undefined]
  const selectedHour = hour
  const selectedMinute = minute == null ? undefined : Math.floor(minute / minuteStep)

  /* Open on the chosen time, not on 00:00: each column scrolls its chosen cell
     to the middle. */
  useLayoutEffect(() => {
    const menu = menuRef.current
    if (!open || !menu) return
    menu.querySelectorAll<HTMLElement>('[role="listbox"]').forEach((column) => {
      const cell = column.querySelector<HTMLElement>('[aria-selected="true"]')
      if (cell) column.scrollTop = cell.offsetTop - column.offsetTop - (column.clientHeight - cell.offsetHeight) / 2
    })
  }, [open])

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
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-required={required}
            aria-invalid={!!error}
            disabled={disabled}
            onClick={() => setOpen((current) => !current)}
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
            /* The picker's time half, 304 tall: the 56 header and seven and a
               half 32-tall cells, the rest scrolls. Card and elevation as
               `DateTimeInput`'s popover. */
            <div
              ref={menuRef}
              role="dialog"
              aria-label={label.trim() || placeholder}
              className={cn(
                'absolute left-0 z-30 flex h-[304px] w-full flex-col overflow-hidden rounded-[var(--radius-3)] bg-[var(--color-surface-primary-default)] shadow-[var(--shadow-overlay)]',
                above ? 'bottom-[calc(100%+var(--space-2))]' : 'top-[calc(100%+var(--space-2))]',
                PICKER_STATE_GAPS,
              )}
            >
              <div data-part="Header" className="webds-date-time-picker-7">
                <span data-part="Label" className="webds-date-time-picker-8">
                  Time
                </span>
              </div>
              <div className="webds-date-time-picker-9">
                <Column
                  label="Hour"
                  values={HOURS}
                  selected={selectedHour}
                  onSelect={(h) => onChange(`${padTwo(h)}:${padTwo((selectedMinute ?? 0) * minuteStep)}`)}
                />
                <Column
                  label="Minute"
                  values={minutes}
                  selected={selectedMinute}
                  onSelect={(m) => {
                    onChange(`${padTwo(selectedHour ?? 0)}:${padTwo(m * minuteStep)}`)
                    setOpen(false)
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <FieldHint message={error} tone={tone} />
      </FieldRoot>
    </div>
  )
}
