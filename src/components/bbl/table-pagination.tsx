import { cn } from '@/lib/utils'
import { Chevron } from './icons'
import { GhostButton } from './ghost-button'

/* BBL Table Pagination — `public/r/specs/pagination.json`, set "Table
 * Pagination", 4 variants on a `Range State` axis.
 *
 *   root (gap 32, 24 tall)
 *   ├ Range Select (gap 8)   "Rows per page:" + a Ghost Button showing the size
 *   └ Navigation (gap 16)
 *      ├ Counter (gap 4)     range · "of" · count
 *      └ Buttons (gap 8)     two 24×24 icon buttons
 *
 * The four variants differ only in what the counter says — First is 1-20, Last
 * is 81-100, Full Range is 1-100 — so the state axis is content, not chrome.
 * **Figma names each of those text nodes after its own content** (`1-20`,
 * `81-100`), and the harness joins parts by name, so `data-part` on the range
 * and the count is the string being shown rather than a fixed name.
 *
 * Type is Body M Medium for the counter and the label, Label XL Medium inside
 * the Ghost Button — three roles at the same 16px, taken from the bound
 * variables rather than the numbers.
 *
 * The prev/next chevrons carry no colour of their own in the spec (they sit a
 * level below what it captures); Icon/Primary/Default is what the 24px
 * navigation chevrons use everywhere else on this page. */

export type TablePaginationProps = {
  /** "Rows per page:" — the label BBL drew. */
  label?: React.ReactNode
  /** The page size shown in the Ghost Button. */
  pageSize?: React.ReactNode
  /** e.g. "1-20". Also becomes the part name — see the note above. */
  range?: string
  /** e.g. "100". Also becomes the part name. */
  count?: string
  ofLabel?: string
  onPrevious?: () => void
  onNext?: () => void
  onPageSizeChange?: () => void
  /**
   * The `Rows per page:` group. Drawn in every published variant, so it is on
   * by default — but a consuming file draws this row as the counter and the two
   * chevrons alone (`JjvzdUwg5LlKHDQvo2fny0` · 1:135065), and reaching that by
   * passing empty strings left the label's own gap behind. The group is either
   * drawn or it is not; there is no half of it.
   */
  showPageSize?: boolean
  className?: string
}

export function TablePagination({
  label = 'Rows per page:',
  pageSize = '20',
  range = '1-20',
  count = '100',
  ofLabel = 'of',
  onPrevious,
  onNext,
  onPageSizeChange,
  showPageSize = true,
  className,
}: TablePaginationProps) {
  const text = 'webds-table-pagination-text'
  return (
    <div className={cn('webds-table-pagination', className)}>
      {showPageSize && (
        <div className="webds-table-pagination-2">
          <span data-part="Rows per page" className={text}>
            {label}
          </span>
          <GhostButton padding="none" onClick={onPageSizeChange}>
            <span data-part="Label">{pageSize}</span>
            <Chevron name="down-16" className="webds-table-pagination-3" />
          </GhostButton>
        </div>
      )}
      <div className="webds-table-pagination-4">
        <div className="webds-table-pagination-5">
          <span data-part={range} className={text}>
            {range}
          </span>
          <span data-part="of" className={text}>
            {ofLabel}
          </span>
          <span data-part={count} className={text}>
            {count}
          </span>
        </div>
        <div className="webds-table-pagination-6">
          <button
            type="button"
            aria-label="Previous page"
            onClick={onPrevious}
            data-part="Icon Button"
            className="webds-table-pagination-7"
          >
            <Chevron name="left-24" className="webds-table-pagination-8" />
          </button>
          <button
            type="button"
            aria-label="Next page"
            onClick={onNext}
            data-part="Icon Button"
            className="webds-table-pagination-9"
          >
            <Chevron name="right-24" className="webds-table-pagination-10" />
          </button>
        </div>
      </div>
    </div>
  )
}
