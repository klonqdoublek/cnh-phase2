import { cn } from '@/lib/utils'
import { Chevron } from './icons'

/* BBL Date Picker — `public/r/specs/date-and-time-picker.json`, set "Date
 * Picker", 3 variants on `Type` (Date / Month / Year).
 *
 * A 320 × 348 card (Radius 3, Border/Primary) with a 56-tall header over a body
 * that changes with the Type:
 *
 *   Date    a weekday row (Label L Medium, Text/Tertiary) over 42 day cells
 *   Month   twelve 46 × 32 cells, four across
 *   Year    twenty-nine of the same cells with a scroll bar beside them
 *
 * The header's own label moves too: `Text/Primary/Default` on the Date view,
 * `Text/Highlight/Default` on Month and Year — the label doubles as the control
 * that switches views, so it is blue when it is what you would press. Only the
 * Date view carries the two 24 × 16 nav buttons.
 *
 * **This component does no date arithmetic.** It renders the cells it is given,
 * in the order it is given them: which day starts the week, which days belong to
 * the neighbouring months and which one is today are the caller's, because none
 * of that is in the spec — the file draws one January and the arithmetic behind
 * it is not something a measurement can recover. */

export type DatePickerType = 'date' | 'month' | 'year'
/* `selected` is a filled cell with inverse text — how Month and Year mark the
   current one. `highlight` is the Date view's today: no fill, blue Medium text.
   Two different treatments for the same idea, both in the file. */
export type DateCellTone = 'default' | 'selected' | 'highlight' | 'muted' | 'outlined'

export type DateCell = { label: React.ReactNode; tone?: DateCellTone }

const CELL_TEXT: Record<DateCellTone, string> = {
  default: 'webds-date-picker--default',
  selected: 'webds-date-picker--selected',
  highlight: 'webds-date-picker--highlight',
  muted: 'webds-date-picker--muted',
  /* Centralize Log's chosen day: the same blue Medium text as `highlight`, with
     a ring drawn on the cell around it. Kept as its own tone rather than folded
     into `highlight`, because `highlight` is today's date in the source file and
     these are two different marks that happen to share a colour. */
  outlined: 'webds-date-picker--outlined',
}

export type DatePickerProps = {
  /** The spec child this picker implements when it sits inside a field. */
  part?: string
  type?: DatePickerType
  /** Overrides the label colour the Type would choose — see date-time-picker. */
  labelTone?: 'primary' | 'highlight'
  label?: React.ReactNode
  weekdays?: { name: string; label: string }[]
  /** For Type=Date: the 42 day cells, in the order they should be rendered. */
  days?: DateCell[]
  /** For Type=Month/Year: the grid cells. */
  cells?: DateCell[]
  /** Year draws a scroll bar beside its grid. */
  scrollBar?: boolean
  /**
   * Called with the day cell's index when it is clicked. Without it the grid is
   * inert — which is all a measured frame can say, and not enough to build on.
   */
  onSelectDay?: (index: number) => void
  /**
   * 8 between the day rows. The Core Website library stacks them flush; the
   * Centralize Log picker (`I6145:11593;9510:16626`) spaces them, so it is a
   * flag rather than a silent change to what the library draws.
   */
  rowGap?: boolean
  onPrevious?: () => void
  onNext?: () => void
  className?: string
}

export const WEEKDAYS = [
  { name: 'Sun', label: 'S' },
  { name: 'Mo', label: 'M' },
  { name: 'Tue', label: 'T' },
  { name: 'Wed', label: 'W' },
  { name: 'Thu', label: 'T' },
  { name: 'Fri', label: 'F' },
  { name: 'Sat', label: 'S' },
]

export function DatePicker({
  part,
  type = 'date',
  labelTone,
  label,
  weekdays = WEEKDAYS,
  days = [],
  cells = [],
  scrollBar = false,
  onSelectDay,
  rowGap = false,
  onPrevious,
  onNext,
  className,
}: DatePickerProps) {
  return (
    <div
      data-part={part}
      className={cn(
        /* The card is a fixed frame, so it fills what it is given rather than
           hugging; and its stroke is an outline, because a border would take 2
           from the header's width — the spec records the header at the card's
           full 320. */
        'webds-date-picker',
        className,
      )}
    >
      <div
        data-part="Header"
        className="webds-date-picker-2"
      >
        <span
          data-part="Label"
          className={cn(
            'webds-date-picker-3',
            (labelTone ?? (type === 'date' ? 'primary' : 'highlight')) === 'primary'
              ? 'webds-date-picker-3--s1'
              : 'webds-date-picker-3--s2',
          )}
        >
          {label}
        </span>
        {type === 'date' && (
          <div className="webds-date-picker-4">
            <button
              type="button"
              aria-label="Previous month"
              onClick={onPrevious}
              data-part="Icon Button"
              className="webds-date-picker-5"
            >
              <Chevron name="left-16" className="webds-date-picker-6" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={onNext}
              data-part="Icon Button"
              className="webds-date-picker-7"
            >
              <Chevron name="right-16" className="webds-date-picker-8" />
            </button>
          </div>
        )}
      </div>

      {type === 'date' ? (
        <div className="webds-date-picker-9">
          <div className="webds-date-picker-10">
            {weekdays.map((d) => (
              <span
                key={d.name}
                data-part={d.name}
                className="webds-date-picker-11"
              >
                {d.label}
              </span>
            ))}
          </div>
          <div className={cn('webds-date-picker-12', rowGap && 'webds-date-picker-12--s1')}>
            {days.map((cell, i) => {
              const tone = cell.tone ?? 'default'
              /* A cell answers a click when there is a handler and it is not one
                 of the greyed-out days — the file draws those as unavailable,
                 not merely quiet. */
              const pickable = onSelectDay != null && tone !== 'muted' && cell.label !== ''
              return (
                <span
                  key={i}
                  /* The **whole 32 box** is the target. The labelled span is a
                     child of it, so a handler that only sees the label leaves
                     the padding dead — which on a 32 cell is most of it. */
                  onClick={pickable ? () => onSelectDay?.(i) : undefined}
                  role={pickable ? 'button' : undefined}
                  className={cn(
                    'webds-date-picker-13',
                    /* Every cell is a <span>, so without this the pointer is an
                       I-beam over something that is a button. */
                    pickable && 'webds-date-picker-13--s1',
                    /* Chosen, in the Date view: no fill, a 1px Border/Highlight
                       ring, and the blue Medium text `highlight` already gives
                       (`I6145:11593;9510:16639`). `selected` is the Month/Year
                       treatment — a filled cell — and reads as inverse text on
                       nothing here. */
                    tone === 'outlined' &&
                      'webds-date-picker-13--s2',
                  )}
                >
                  <span data-part="Date" className={CELL_TEXT[tone]}>
                    {cell.label}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="webds-date-picker-14">
          <div className={cn('webds-date-picker-15', type === 'month' ? 'webds-date-picker-15--s1' : 'webds-date-picker-15--s2')}>
            {cells.map((cell, i) => (
              <span
                key={i}
                data-part=".Building Block / Date Picker / Cell"
                className={cn(
                  'webds-date-picker-16',
                  cell.tone === 'selected'
                    ? 'webds-date-picker-16--s1'
                    : 'webds-date-picker-16--s2',
                )}
              >
                <span data-part={type === 'month' ? 'Month' : 'Year'} className={CELL_TEXT[cell.tone ?? 'default']}>
                  {cell.label}
                </span>
              </span>
            ))}
          </div>
          {scrollBar && (
            <span
              data-part="Scroll Bar"
              className="webds-date-picker-17"
            />
          )}
        </div>
      )}
    </div>
  )
}
