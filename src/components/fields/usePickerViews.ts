import { useState, type Dispatch, type SetStateAction } from 'react'
import type { DateCellTone } from '@/bbl/date-picker'
import { PICKER_YEAR_COUNT, PICKER_YEARS_BEFORE_TODAY, PickerView, type MonthView } from './date-parts'

/** A Month or Year cell: its value and its webds tone. */
export type PeriodCell = { value: number; tone: DateCellTone }

/** The Date / Month / Year views a webds picker switches between from its
 *  header label — the CMS prototype's `usePickerViews` (v4.56, final UI
 *  `3074:199189`). The label opens Year, a year opens Month, a month returns
 *  to Date. The label pressed again from Month or Year goes back. The month
 *  on view is Selected; today's month and year are Current. */
export function usePickerViews({
  view,
  setView,
  today,
}: {
  view: MonthView
  setView: Dispatch<SetStateAction<MonthView>>
  today: MonthView
}) {
  const [pickerView, setPickerView] = useState<PickerView>(PickerView.Date)

  const periodTone = (isOnView: boolean, isToday: boolean): DateCellTone =>
    isOnView ? 'selected' : isToday ? 'outlined' : 'default'
  const months: PeriodCell[] = Array.from({ length: 12 }, (_, month) => ({
    value: month,
    tone: periodTone(month === view.month, view.year === today.year && month === today.month),
  }))
  const years: PeriodCell[] = Array.from({ length: PICKER_YEAR_COUNT }, (_, index) => {
    const year = today.year - PICKER_YEARS_BEFORE_TODAY + index
    return { value: year, tone: periodTone(year === view.year, year === today.year) }
  })

  const toggleView = () => setPickerView((current) => (current === PickerView.Date ? PickerView.Year : PickerView.Date))
  const selectYear = (year: number) => {
    setView((current) => ({ year, month: current.month }))
    setPickerView(PickerView.Month)
  }
  const selectMonth = (month: number) => {
    setView((current) => ({ year: current.year, month }))
    setPickerView(PickerView.Date)
  }
  const resetView = () => setPickerView(PickerView.Date)

  return { pickerView, months, years, toggleView, selectYear, selectMonth, resetView }
}
