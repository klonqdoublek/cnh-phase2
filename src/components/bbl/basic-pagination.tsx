import { cn } from '@/lib/utils'
import { Chevron } from './icons'

/* BBL Basic Pagination — `public/r/specs/pagination.json`, set "Basic
 * Pagination", 6 variants: `is Range` (Yes / No) × `Select State` (First /
 * Middle / Last).
 *
 *   root (gap 8, 28 tall)
 *   ├ Previous            16×16, radius 1, transparent fill
 *   ├ Pagination Items    gap 4 — 28×28 items, radius 2
 *   └ Next                16×16
 *
 * `is Range = Yes` is the long form: eleven pages collapsed with ellipses, so
 * the row shows 1 … 5 6 7 … 11. `No` is five pages with no ellipsis. Which page
 * is selected comes from `Select State`, and the selected item takes
 * `Surface/Highlight/Subtle/Default` with a Label L **Medium** number in
 * `Text/Highlight/Default`; the rest are transparent with Regular numbers.
 *
 * Two things the file does that the code has to follow rather than tidy:
 *
 * - In the `No` variants the selected item is named `.Building Block /
 *   Pagination / Pagination Item` while its neighbours are `Pagination Item`;
 *   in the `Yes` variants every item is `Pagination Item`. A layer name, not a
 *   design difference — but the harness joins parts by name.
 * - The prev/next chevrons bind `colours/graphic/primary-active`, a variable
 *   from a collection this repo does not carry (8 collections, 335 variables,
 *   none of them `colours/*`). It resolves to #0064FF, which is what
 *   Icon/Highlight/Default resolves to, so that is the token used here. Recorded
 *   because a value agreeing today is not the same as a binding.
 *
 * BBL's own note on this page, quoted: "Please allow squads to configure number
 * of Pagination items, counts, etc. as per MUI." — so `pages`, `siblingCount`
 * and the ellipsis positions are the caller's, not fixed here. */

export type BasicPaginationProps = {
  /** The page numbers to show, in order. `null` renders an ellipsis. */
  items: (number | string | null)[]
  /** Which entry is the current page, by value. */
  selected?: number | string
  /** The long form; it also decides the selected item's layer name — see above. */
  hasRange?: boolean
  onSelect?: (page: number | string) => void
  onPrevious?: () => void
  onNext?: () => void
  className?: string
}

const ARROW =
  'webds-basic-pagination--arrow'

export function BasicPagination({
  items,
  selected,
  hasRange = false,
  onSelect,
  onPrevious,
  onNext,
  className,
}: BasicPaginationProps) {
  return (
    <nav aria-label="Pagination" className={cn('webds-basic-pagination', className)}>
      <button type="button" aria-label="Previous page" onClick={onPrevious} data-part="Previous" className={ARROW}>
        <Chevron name="left-16" part="Union" className="webds-basic-pagination-2" />
      </button>

      <div className="webds-basic-pagination-3">
        {items.map((page, i) =>
          page === null ? (
            <div
              key={`gap-${i}`}
              data-part="Dot"
              className="webds-basic-pagination-4"
            >
              <span
                data-part="Overflow"
                className="webds-basic-pagination-5"
              >
                ...
              </span>
            </div>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onSelect?.(page)}
              aria-current={page === selected ? 'page' : undefined}
              data-part={
                page === selected && !hasRange
                  ? '.Building Block / Pagination / Pagination Item'
                  : 'Pagination Item'
              }
              className={cn(
                'webds-basic-pagination-6',
                page === selected
                  ? 'webds-basic-pagination-6--s1'
                  : 'webds-basic-pagination-6--s2',
              )}
            >
              <span
                data-part="Date"
                className={cn(
                  page === selected
                    ? 'webds-basic-pagination-7--s1'
                    : 'webds-basic-pagination-7--s2',
                )}
              >
                {page}
              </span>
            </button>
          ),
        )}
      </div>

      <button type="button" aria-label="Next page" onClick={onNext} data-part="Next" className={ARROW}>
        <Chevron name="right-16" part="Union" className="webds-basic-pagination-8" />
      </button>
    </nav>
  )
}
