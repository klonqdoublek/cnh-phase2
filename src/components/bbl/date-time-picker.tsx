import { cn } from '@/lib/utils'
import { DatePicker, type DateCell, type DatePickerType } from './date-picker'

/* BBL Date Time Picker — `public/r/specs/date-and-time-picker.json`, set "Date
 * Time Picker", 3 variants on `Selecting` (Date / Month / Year).
 *
 * The Date Picker with two things bolted on: a 112-wide time column beside it
 * and a 60-tall CTA row under both, making 432 × 456. The calendar half is the
 * same component — same header, same three views — so `Selecting` is passed
 * straight through to it.
 *
 * The time column is its own 56-tall header ("Time") over two scrolling lists,
 * hours and minutes, whose cells Figma names `Date` like the calendar's. Above
 * the CTA row the calendar column carries three quick buttons BBL labelled
 * "Btn 1/2/3" — placeholders for whatever a squad puts there, drawn as Ghost
 * Button labels.
 *
 * Nothing here decides what those buttons do, what the time steps are, or which
 * cell is current: all of it is passed in. The file draws one example and an
 * example is not a rule. */

export type DateTimePickerProps = {
  /** The spec child this picker implements when it sits inside a field. */
  part?: string
  selecting?: DatePickerType
  label?: React.ReactNode
  days?: DateCell[]
  cells?: DateCell[]
  scrollBar?: boolean
  quickButtons?: React.ReactNode[]
  timeLabel?: React.ReactNode
  hours?: React.ReactNode[]
  minutes?: React.ReactNode[]
  /** Which hour and minute are chosen — Medium, inverse, on a filled cell. */
  selectedHour?: number
  selectedMinute?: number
  /** Index of the hour / minute cell clicked. Without these the columns are inert. */
  onSelectHour?: (index: number) => void
  onSelectMinute?: (index: number) => void
  /** Passed through to the Date Picker — see its own notes. */
  onSelectDay?: (index: number) => void
  rowGap?: boolean
  /** The month nav. The Date Picker draws the two buttons; without these being
   *  carried through they are drawn here and do nothing. */
  onPrevious?: () => void
  onNext?: () => void
  cancelLabel?: React.ReactNode
  confirmLabel?: React.ReactNode
  className?: string
}

const TIME_CELL = 'webds-date-time-picker--time-cell'
const TIME_CELL_SELECTED =
  'webds-date-time-picker--time-cell-selected'

/* A chosen time reads `Text/Primary/Inverse/Default` in the spec, which is only
   legible on a filled cell — the fill sits deeper than the extraction reaches,
   so it is drawn from the same `Surface/Highlight/Default` the Month and Year
   cells use rather than left as white text on white. */
function TimeColumn({
  values,
  selected,
  onSelect,
}: {
  values: React.ReactNode[]
  selected?: number
  onSelect?: (index: number) => void
}) {
  return (
    /* **Scrolls.** The library draws one screenful and clips the rest, which is
       all a frame can show — but 24 hours in a 340-tall column leaves 08:00
       onward unreachable in a browser. */
    <div className="webds-time-column">
      {values.map((v, i) => (
        <span
          key={i}
          onClick={onSelect ? () => onSelect(i) : undefined}
          role={onSelect ? 'button' : undefined}
          className={cn(
            'webds-time-column-2',
            onSelect && 'webds-time-column-2--s1',
            i === selected && 'webds-time-column-2--s2',
          )}
        >
          <span data-part="Date" className={i === selected ? TIME_CELL_SELECTED : TIME_CELL}>
            {v}
          </span>
        </span>
      ))}
    </div>
  )
}
const CTA_LABEL = 'webds-date-time-picker--cta-label'

export function DateTimePicker({
  part,
  selecting = 'date',
  label,
  days = [],
  cells = [],
  scrollBar = false,
  quickButtons = [],
  timeLabel = 'Time',
  hours = [],
  minutes = [],
  selectedHour,
  selectedMinute,
  onSelectHour,
  onSelectMinute,
  onSelectDay,
  rowGap,
  onPrevious,
  onNext,
  cancelLabel = 'Cancel',
  confirmLabel = 'OK',
  className,
}: DateTimePickerProps) {
  return (
    <div
      data-part={part}
      className={cn(
        /* The card is a fixed frame, so it fills what it is given rather than
           hugging; and its stroke is an outline, because a border would take 2
           from the header's width — the spec records the header at the card's
           full 320. */
        'webds-date-time-picker',
        className,
      )}
    >
      <div className="webds-date-time-picker-2">
        <div className="webds-date-time-picker-3">
          <DatePicker
            type={selecting}
            label={label}
            days={days}
            cells={cells}
            scrollBar={scrollBar}
            onSelectDay={onSelectDay}
            rowGap={rowGap}
            onPrevious={onPrevious}
            onNext={onNext}
            className="webds-date-time-picker-4"
          />
          {quickButtons.length > 0 && (
            <div className="webds-date-time-picker-5">
              {quickButtons.map((b, i) => (
                <span key={i} data-part="Label" className={CTA_LABEL}>
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
        <div
          data-part="Time Picker"
          /* The divider is an inset shadow, not a border: the spec records this
             column's header at the column's full 112, and a border would leave
             it 111. */
          className="webds-date-time-picker-6"
        >
          <div
            data-part="Header"
            className="webds-date-time-picker-7"
          >
            <span data-part="Label" className="webds-date-time-picker-8">
              {timeLabel}
            </span>
          </div>
          {/* `min-h-0`, or the columns inherit an auto height and their own
              `overflow-y` never has anything to scroll. */}
          <div className="webds-date-time-picker-9">
            <TimeColumn values={hours} selected={selectedHour} onSelect={onSelectHour} />
            <TimeColumn values={minutes} selected={selectedMinute} onSelect={onSelectMinute} />
          </div>
        </div>
      </div>
      <div
        data-part="CTA Container"
        className="webds-date-time-picker-10"
      >
        <span data-part="Label" className={CTA_LABEL}>
          {cancelLabel}
        </span>
        <span data-part="Label" className={CTA_LABEL}>
          {confirmLabel}
        </span>
      </div>
    </div>
  )
}
