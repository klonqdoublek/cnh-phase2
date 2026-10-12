import { cn } from '@/lib/utils'
import { Checkbox } from './checkbox'
import { PlaceholderIcon24 } from './icons'
import type { ForceState } from './force'

/* BBL Table Data Cell — `public/r/specs/table.json`, 36 variants:
 * `Style` (Default / Zebra Stripe / Border) × `Type` (Text / Slot / Icon /
 * Checkbox) × `State` (Default / Hovered / Selected).
 *
 * One 64-tall cell with 16 of padding and gap 8. Type decides the contents; the
 * two axes that remain are colour:
 *
 *   Default        Surface/Primary/{Default,Hovered}
 *   Zebra Stripe   Surface/Secondary/{Default,Hovered}
 *   Border         Surface/Primary/{Default,Hovered} + a Border/Primary stroke
 *   any Selected   Surface/Highlight/Subtle/Default — the Style stops mattering
 *
 * The stroke is painted with `outline`, as everywhere a Figma stroke has to not
 * take layout space: these cells are drawn 160 (or 56) wide with the border
 * inside that, not around it.
 *
 * Type=Checkbox renders the verified Checkbox, whose `Rectangle` part is the
 * 22 × 22 the spec records here — the same component, not a copy of its box.
 * Type=Icon is the 24px placeholder BBL drew (`Union`, 21.7). Type=Slot is
 * empty: the cell is a container for whatever a squad puts in it. */

export type TableCellStyle = 'default' | 'zebra' | 'border'
export type TableCellType = 'text' | 'slot' | 'icon' | 'checkbox'
export type TableCellState = 'default' | 'hovered' | 'selected'

const SURFACE: Record<TableCellStyle, Record<TableCellState, string>> = {
  default: {
    default: 'webds-table-data-cell--default-default',
    hovered: 'webds-table-data-cell--default-hovered',
    selected: 'webds-table-data-cell--default-selected',
  },
  zebra: {
    default: 'webds-table-data-cell--zebra-default',
    hovered: 'webds-table-data-cell--zebra-hovered',
    selected: 'webds-table-data-cell--zebra-selected',
  },
  border: {
    default: 'webds-table-data-cell--border-default',
    hovered: 'webds-table-data-cell--border-hovered',
    selected: 'webds-table-data-cell--border-selected',
  },
}

export type TableDataCellProps = {
  cellStyle?: TableCellStyle
  type?: TableCellType
  state?: TableCellState
  force?: ForceState
  children?: React.ReactNode
  className?: string
}

export function TableDataCell({
  cellStyle = 'default',
  type = 'text',
  state = 'default',
  force,
  children,
  className,
}: TableDataCellProps) {
  return (
    <div
      data-force={force ?? undefined}
      className={cn(
        'webds-table-data-cell',
        SURFACE[cellStyle][state],
        cellStyle === 'border' &&
          'webds-table-data-cell--s1',
        className,
      )}
    >
      {type === 'text' && (
        <span data-part="Text" className="webds-table-data-cell-2">
          {children ?? 'Text'}
        </span>
      )}
      {type === 'icon' && <PlaceholderIcon24 className="webds-table-data-cell-3" />}
      {type === 'checkbox' && <Checkbox />}
      {type === 'slot' && children}
    </div>
  )
}
