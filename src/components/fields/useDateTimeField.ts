import { useRef, useState } from 'react'
import { toneFor } from '@/bbl/field'
import type { DateCell } from '@/bbl/date-picker'
import {
  dayInGridCell,
  isoDate,
  MONTH_GRID_CELLS,
  padTwo,
  serialiseDateTime,
  shiftMonth,
  parseDateTime,
  type DateTimeParts,
  type MonthView,
} from './date-parts'
import { useDismissOnOutside } from './useDismissOnOutside'
import { usePickerViews } from './usePickerViews'

const HOURS = Array.from({ length: 24 }, (_, index) => padTwo(index))

/** The date and time field's open picker, the grid on view and the month it
 *  shows — the CMS prototype's `useDateTimeField` (v4.56).
 *
 *  **Auto submit.** The CMS final UI's picker (`3074:199189`) has no Cancel /
 *  OK row: webds' `has CTA = No`. Every pick — day, hour, minute, Today —
 *  applies to the field at once, and a click outside or Escape only closes. A
 *  time picked while the field is still empty waits for a day, so a lone hour
 *  never commits a date nobody chose.
 *
 *  Two changes for CNH: today is the real date (CMS pins it for its fixtures),
 *  and days before `min` are muted and cannot be picked — the original
 *  build's `disablePast`. */
export function useDateTimeField({
  value,
  onChange,
  disabled,
  error,
  minuteStep,
  defaultTime,
  min,
}: {
  value: string
  onChange: (value: string) => void
  disabled: boolean
  error: boolean
  minuteStep: 1 | 5 | 30
  defaultTime: [number, number]
  /** `YYYY-MM-DD`; earlier days are muted. */
  min?: string
}) {
  const now = new Date()
  const today: DateTimeParts = {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  }
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pendingTime, setPendingTime] = useState<[number, number] | null>(null)
  const [view, setView] = useState<MonthView>(() => {
    const base = parseDateTime(value) ?? today
    return { year: base.year, month: base.month }
  })
  const rootRef = useRef<HTMLDivElement>(null)
  const views = usePickerViews({ view, setView, today })

  useDismissOnOutside(open, rootRef, setOpen)

  const selected = parseDateTime(value)

  const openPicker = () => {
    const base = selected ?? today
    setPendingTime(null)
    views.resetView()
    setView({ year: base.year, month: base.month })
    setOpen(true)
  }

  const commit = (parts: DateTimeParts) => onChange(serialiseDateTime(parts))
  const timeOf = (): [number, number] => (selected ? [selected.hour, selected.minute] : pendingTime ?? defaultTime)
  const beforeMin = (day: number) => !!min && isoDate(view.year, view.month, day) < min

  /* 42 cells, Sunday first; days outside the month are blank. The chosen day
     is Selected — a filled cell — and today is Current, ringed; the chosen
     day wins when they are the same. */
  const sameDay = (parts: DateTimeParts | null, day: number) =>
    !!parts && parts.year === view.year && parts.month === view.month && parts.day === day
  const days: DateCell[] = Array.from({ length: MONTH_GRID_CELLS }, (_, cellIndex) => {
    const day = dayInGridCell(cellIndex, view)
    if (day == null) return { label: '' }
    if (sameDay(selected, day)) return { label: day, tone: 'selected' }
    if (beforeMin(day)) return { label: day, tone: 'muted' }
    return { label: day, tone: sameDay(today, day) ? 'outlined' : 'default' }
  })
  const minutes = Array.from({ length: 60 / minuteStep }, (_, index) => padTwo(index * minuteStep))
  const shift = (delta: number) => setView((current) => shiftMonth(current, delta))

  const selectDay = (cellIndex: number) => {
    const day = dayInGridCell(cellIndex, view)
    if (day == null || beforeMin(day)) return
    const [hour, minute] = timeOf()
    commit({ year: view.year, month: view.month, day, hour, minute })
  }
  const selectHour = (hour: number) => {
    if (selected) commit({ ...selected, hour })
    else setPendingTime([hour, timeOf()[1]])
  }
  const selectMinute = (minuteIndex: number) => {
    const minute = minuteIndex * minuteStep
    if (selected) commit({ ...selected, minute })
    else setPendingTime([timeOf()[0], minute])
  }
  /* Today keeps the chosen time (CMS board: the time does not reset to 00:00). */
  const selectToday = () => {
    const [hour, minute] = timeOf()
    commit({ year: today.year, month: today.month, day: today.day, hour, minute })
    setView({ year: today.year, month: today.month })
    views.resetView()
  }
  /* CMS "Select Clear": the field empties at once. */
  const clear = () => {
    setPendingTime(null)
    onChange('')
  }
  const toggle = () => (open ? setOpen(false) : openPicker())

  const shownHour = selected ? selected.hour : pendingTime?.[0]
  const shownMinute = selected ? selected.minute : pendingTime?.[1]
  const focusedLook = !disabled && !error && (open || focused)
  const fieldState = disabled ? 'Disabled' : error ? 'Error' : focusedLook ? 'Focused' : 'Default'

  return {
    rootRef,
    open,
    setFocused,
    view,
    days,
    views,
    hours: HOURS,
    minutes,
    selectedHour: shownHour,
    selectedMinute: shownMinute == null ? undefined : Math.floor(shownMinute / minuteStep),
    shown: selected,
    tone: toneFor(fieldState),
    focusedLook,
    shift,
    selectDay,
    selectHour,
    selectMinute,
    selectToday,
    clear,
    toggle,
  }
}
