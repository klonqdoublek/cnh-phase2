import { useState } from 'react'
import { TableDataCell } from '@/bbl/table-data-cell'
import { TableHeaderCell } from '@/bbl/table-header-cell'
import { cn } from '@/lib/cn'

/* The console list's table, as CMS composes it: webds `Table Header Cell` /
 * `Table Data Cell` (64 tall, pad 16, no column gap), a rule under every row,
 * the header pinned while the rows scroll. Header cells are State=Hovered
 * (Surface/Primary/Hovered) with the label at Label XL Regular on
 * Text/Tertiary — the board's override of the cell's own Label L. */

const ROW_RULE = 'shadow-[inset_0_-1px_0_0_var(--color-border-primary-default)]'

export type ListColumn<Row> = {
  key: string
  label: string
  /** Width in px at 1920 — the original's colgroup; wider screens grow it by ratio. */
  width: number
  /** Content in a slot of its own (badge), not a text run. */
  slot?: boolean
  /** Wraps to two lines, then clips — the Channel column. */
  wrap?: boolean
  cell: (row: Row) => React.ReactNode
}

export function ListTable<Row>({
  label,
  columns,
  rows,
  rowKey,
  onOpen,
}: {
  label: string
  columns: ListColumn<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string
  onOpen: (row: Row) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const minWidth = columns.reduce((sum, c) => sum + c.width, 0)

  return (
    <div role="table" aria-label={label} style={{ minWidth }} className="flex w-full flex-col">
      <div role="row" className="sticky top-0 z-10 flex w-full">
        {columns.map((column) => (
          <div key={column.key} style={{ flex: `${column.width} 0 ${column.width}px` }}>
            <TableHeaderCell type="slot" state="hovered" className="w-full">
              <span role="columnheader" className="truncate type-label-xl text-[var(--color-text-tertiary-default)]">
                {column.label}
              </span>
            </TableHeaderCell>
          </div>
        ))}
      </div>

      {rows.map((row) => {
        const key = rowKey(row)
        const state = hovered === key ? 'hovered' : 'default'
        return (
          <div
            key={key}
            role="row"
            tabIndex={0}
            onClick={() => onOpen(row)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onOpen(row)
            }}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            className="group flex w-full cursor-pointer"
          >
            {columns.map((column) => (
              <div key={column.key} style={{ flex: `${column.width} 0 ${column.width}px` }}>
                <TableDataCell type="slot" state={state} className={cn('w-full', ROW_RULE)}>
                  {column.slot ? (
                    column.cell(row)
                  ) : (
                    <span
                      className={cn(
                        'min-w-px type-body-m text-[var(--color-text-primary-default)]',
                        column.wrap ? 'line-clamp-2' : 'truncate',
                      )}
                    >
                      {column.cell(row)}
                    </span>
                  )}
                </TableDataCell>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
