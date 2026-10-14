import type { DateCell } from '@/bbl/date-picker'
import { MONTHS_SHORT, PickerView } from './date-parts'
import { PeriodCellButton } from './PeriodCellButton'
import type { PeriodCell } from './usePickerViews'

/** The Month or Year grid's cells for webds `DatePicker`, each a button.
 *  Months read as short names (`Jan` …). From the CMS prototype (v4.56). */
export function periodCells({
  pickerView,
  months,
  years,
  onMonth,
  onYear,
}: {
  pickerView: PickerView
  months: PeriodCell[]
  years: PeriodCell[]
  onMonth: (month: number) => void
  onYear: (year: number) => void
}): DateCell[] {
  return pickerView === PickerView.Month
    ? months.map((cell) => ({
        tone: cell.tone,
        label: <PeriodCellButton label={MONTHS_SHORT[cell.value]} onPick={() => onMonth(cell.value)} />,
      }))
    : years.map((cell) => ({
        tone: cell.tone,
        label: <PeriodCellButton label={cell.value} onPick={() => onYear(cell.value)} />,
      }))
}
