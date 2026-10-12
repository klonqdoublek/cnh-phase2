import { cn } from '@/lib/utils'
import { Checkbox } from './checkbox'
import { PlaceholderIcon24 } from './icons'
import type { ForceState } from './force'

/* BBL Table Header Cell — `public/r/specs/table.json`, 24 variants:
 * `Appearance` (Default / Zebra Stripe / Border) × `Type` (Text / Slot / Icon /
 * Checkbox) × `State` (Default / Hovered).
 *
 * The same 64-tall, 16-padded cell as the data row, with three differences that
 * are easy to miss:
 *
 * - Its label is **Label L Medium** (14/20) where the data cell's is Body M
 *   Regular (16/22) — a header is smaller and heavier, not larger.
 * - Zebra Stripe here is `Surface/Tertiary/*`, one step darker than the data
 *   row's `Surface/Secondary/*`.
 * - **Type=Slot uses gap 4**, where every other type on both sets uses 8. It is
 *   one variant's number, recorded rather than smoothed.
 *
 * There is no Selected state: a header is not selectable. */

export type HeaderCellAppearance = 'default' | 'zebra' | 'border'
export type HeaderCellType = 'text' | 'slot' | 'icon' | 'checkbox'
export type HeaderCellState = 'default' | 'hovered'

const SURFACE: Record<HeaderCellAppearance, Record<HeaderCellState, string>> = {
  default: {
    default: 'webds-table-header-cell--default-default',
    hovered: 'webds-table-header-cell--default-hovered',
  },
  zebra: {
    default: 'webds-table-header-cell--zebra-default',
    hovered: 'webds-table-header-cell--zebra-hovered',
  },
  border: {
    default: 'webds-table-header-cell--border-default',
    hovered: 'webds-table-header-cell--border-hovered',
  },
}

export type TableHeaderCellProps = {
  appearance?: HeaderCellAppearance
  type?: HeaderCellType
  state?: HeaderCellState
  force?: ForceState
  children?: React.ReactNode
  className?: string
}

export function TableHeaderCell({
  appearance = 'default',
  type = 'text',
  state = 'default',
  force,
  children,
  className,
}: TableHeaderCellProps) {
  return (
    <div
      data-force={force ?? undefined}
      className={cn(
        'webds-table-header-cell',
        type === 'slot' ? 'webds-table-header-cell--s1' : 'webds-table-header-cell--s2',
        SURFACE[appearance][state],
        appearance === 'border' &&
          'webds-table-header-cell--s3',
        className,
      )}
    >
      {type === 'text' && (
        <span data-part="Text" className="webds-table-header-cell-2">
          {children ?? 'Text'}
        </span>
      )}
      {type === 'icon' && <PlaceholderIcon24 className="webds-table-header-cell-3" />}
      {type === 'checkbox' && <Checkbox />}
      {type === 'slot' && children}
    </div>
  )
}
