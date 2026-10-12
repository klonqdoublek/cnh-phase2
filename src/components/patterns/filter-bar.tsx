import { cn } from '@/lib/utils'

/* Filter Bar — measured on `3034:100248` (1491 x 168) in the Centralize Log file.
 *
 * The bar every log screen in that console sits under: a tab row, then one or
 * more rows of fields, with the apply/clear pair and the table's pagination
 * riding on the last row.
 *
 * Measured shell:
 *
 *   root   V · gap 16 · p 16/24/24/24 · Surface/Primary/Default
 *   tabs   H · gap 8 · Tab at 32 tall
 *   row    H · fields at gap 24, blocks at gap 32, each row 56 tall
 *   actions  Button 120 x 44 + Ghost Button 138 x 44 at gap 8, centred in the 56
 *   pagination  Table Pagination 161 x 24 with 16 above and below — the same 56
 *
 * **Every control in it is a library component** — Tab, Radio Button, Text
 * Field, Select Field, Split Input, Button, Ghost Button, Table Pagination — so
 * this ships the arrangement and takes the controls as children. That is also
 * the only honest thing to do about **Split Input, which webds does not code**
 * (`/r/specs/split-input.json` is specification only): the file puts one in the
 * date-range slot, and a slot is what this pattern gives you.
 *
 * The two row gaps are both in the file — 24 between the select fields, 32
 * between the labelled radio + field blocks — so `gap` carries both rather than
 * one being normalised away.
 *
 * **The root fill is changed, not transcribed.** The file binds
 * `Background/Primary/Default`, which the Core Website library itself now names
 * `❌DEPRECATED Background/Primary/❌DEPRECATED Default`. It resolves to
 * #FFFFFF, which is `Surface/Primary/Default` — the live token, used here. Same
 * pixel, and the deprecated binding does not get carried into webds. */

export type FilterBarRowGap = 24 | 32

export type FilterBarRowProps = {
  /** The controls. */
  children?: React.ReactNode
  /** 24 between fields, 32 between labelled blocks. Both are drawn. */
  gap?: FilterBarRowGap
  /** Apply / Clear — centred in the row's 56, at gap 8. */
  actions?: React.ReactNode
  /** Table Pagination, pushed to the end of the row. */
  pagination?: React.ReactNode
  className?: string
}

export function FilterBarRow({
  children,
  gap = 24,
  actions,
  pagination,
  className,
}: FilterBarRowProps) {
  return (
    <div className={cn('webds-pattern-filter-bar-row', className)}>
      <div
        className={cn(
          'webds-pattern-filter-bar-row-2',
          /* The fields only stretch when a Table Pagination has to ride the far
             right of the row. With nothing to push against, both files draw the
             apply/clear pair 32 after the last field and leave the rest of the
             row white — `6145:11519` here (field edge 1099 → button 1132, 223
             left over) and `8024:47738` in Activity Log (1240 → 1273, 410 left
             over). Stretching by default pinned them to the edge on every row
             that has no pagination, which is most of them. */
          pagination && 'webds-pattern-filter-bar-row-2--s1',
          gap === 32 ? 'webds-pattern-filter-bar-row-2--s2' : 'webds-pattern-filter-bar-row-2--s3',
        )}
      >
        {children}
      </div>
      {actions && (
        /* The buttons are 44 in a 56 row and the file sets them 6 from the top —
           centred, not aligned to the field box. */
        <div className="webds-pattern-filter-bar-row-3">{actions}</div>
      )}
      {pagination && (
        <div className="webds-pattern-filter-bar-row-4">{pagination}</div>
      )}
    </div>
  )
}

export type FilterBarProps = {
  /** The Tab row. Omit and the bar starts at the first field row. */
  tabs?: React.ReactNode
  /** `FilterBarRow`s. */
  children?: React.ReactNode
  className?: string
}

export function FilterBar({ tabs, children, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        'webds-pattern-filter-bar',
        className,
      )}
    >
      {tabs && <div className="webds-pattern-filter-bar-2">{tabs}</div>}
      {children}
    </div>
  )
}
