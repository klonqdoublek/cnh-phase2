/** Date arithmetic the composed date field needs — webds' pickers are
 *  presentational and do none of it. From the CMS prototype's
 *  `fields/date-parts.ts` and `enums/fields.ts` (v4.56). */

/** The month a picker is showing; `month` is 0-based. */
export type MonthView = { year: number; month: number }

/** Which grid the picker shows — webds `Selecting` (Date / Month / Year). The
 *  values are the installed `DatePickerType` strings. */
export enum PickerView {
  Date = 'date',
  Month = 'month',
  Year = 'year',
}

/** 42 cells, Sunday first — six weeks of the board's grid. */
export const MONTH_GRID_CELLS = 42

/** The Year view's 29 cells (the webds library's count): fourteen years either
 *  side of today's. A CMS prototype value. */
export const PICKER_YEARS_BEFORE_TODAY = 14
export const PICKER_YEAR_COUNT = 29

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export const padTwo = (value: number) => String(value).padStart(2, '0')

/** `YYYY-MM-DD` from a 0-based month. */
export const isoDate = (year: number, month: number, day: number) => `${year}-${padTwo(month + 1)}-${padTwo(day)}`

/** `YYYY-MM-DD` → `DD/MM/YYYY`, the original build's format. */
export const displayDate = (value: string) => (value ? `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}` : '')

/** The month `YYYY-MM-DD` falls in. */
export const monthOf = (value: string): MonthView => ({ year: Number(value.slice(0, 4)), month: Number(value.slice(5, 7)) - 1 })

/** The day of the month in grid cell `cellIndex`, or null for a blank cell
 *  outside the month. */
export function dayInGridCell(cellIndex: number, view: MonthView): number | null {
  const firstWeekday = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const day = cellIndex - firstWeekday + 1
  return day >= 1 && day <= daysInMonth ? day : null
}

/** The view `delta` months away. */
export function shiftMonth({ year, month }: MonthView, delta: number): MonthView {
  const next = month + delta
  return { year: year + Math.floor(next / 12), month: ((next % 12) + 12) % 12 }
}
