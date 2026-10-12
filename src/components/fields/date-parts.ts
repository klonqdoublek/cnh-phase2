/** Date arithmetic the composed date and time fields need — webds' pickers are
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

/** A date and time split into numbers; `month` is 0-based. */
export type DateTimeParts = { year: number; month: number; day: number; hour: number; minute: number }

/** `YYYY-MM-DDTHH:mm` → parts, or null for ''. */
export const parseDateTime = (value: string): DateTimeParts | null =>
  value
    ? {
        year: +value.slice(0, 4),
        month: +value.slice(5, 7) - 1,
        day: +value.slice(8, 10),
        hour: +value.slice(11, 13) || 0,
        minute: +value.slice(14, 16) || 0,
      }
    : null

export const serialiseDateTime = (parts: DateTimeParts) =>
  `${parts.year}-${padTwo(parts.month + 1)}-${padTwo(parts.day)}T${padTwo(parts.hour)}:${padTwo(parts.minute)}`

/** `DD/MM/YYYY, HH:mm` — what the field box shows. */
export const displayDateTime = (parts: DateTimeParts) =>
  `${padTwo(parts.day)}/${padTwo(parts.month + 1)}/${parts.year}, ${padTwo(parts.hour)}:${padTwo(parts.minute)}`

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
