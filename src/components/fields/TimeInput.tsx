import { useLayoutEffect, useRef, useState } from 'react'
import { FIELD_TEXT, FieldBox, FieldHint, FieldLabel, FieldRoot, toneFor } from '@/bbl/field'
import { Icon } from '@/bbl/icon'
import { SelectList } from '@/patterns/select-list'
import { TIMES } from '@/data/broadcast'
import { cn } from '@/lib/cn'
import { useDismissOnOutside } from './useDismissOnOutside'

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

/**
 * A time field, `HH:mm`, for the Do Not Disturb quiet period. webds ships no
 * time-only field or picker (a gap), so this is the box of `DateTimeInput`
 * with Time 24 for its mark, opening webds' `SelectList` — the menu the
 * `form-field` select already uses — as one column of the original build's
 * half-hour `TIMES`. It takes the field's width, opens on the chosen time,
 * and a pick applies and closes. A press outside or Escape only closes.
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

  /* Open on the chosen time, not on 00:00. */
  useLayoutEffect(() => {
    const menu = menuRef.current
    if (!open || !menu) return
    const index = TIMES.indexOf(value)
    const option = menu.querySelectorAll<HTMLElement>('.webds-pattern-option')[index]
    if (option) menu.scrollTop = option.offsetTop - (menu.clientHeight - option.offsetHeight) / 2
  }, [open, value])

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
            /* Eight 36-tall options and the list's py 8 — the rest scrolls. The
               scroll box carries the list's Overlay elevation, which its own
               overflow would otherwise clip. */
            <div
              ref={menuRef}
              className={cn(
                'absolute left-0 z-30 max-h-[304px] w-full overflow-y-auto rounded-[var(--radius-2)] shadow-[var(--shadow-overlay)]',
                above ? 'bottom-[calc(100%+var(--space-2))]' : 'top-[calc(100%+var(--space-2))]',
              )}
            >
              <SelectList
                width="fill"
                elevated={false}
                options={TIMES.map((time) => ({ value: time, label: time, selected: time === value }))}
                onSelect={(time) => {
                  onChange(time)
                  setOpen(false)
                }}
              />
            </div>
          )}
        </div>
        <FieldHint message={error} tone={tone} />
      </FieldRoot>
    </div>
  )
}
