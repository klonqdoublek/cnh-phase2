import { OutlineButton } from '@/bbl/outline-button'
import { cn } from '@/lib/utils'

/* Table Footer — the line under a result table saying how much of it you are
 * looking at, and the button that asks for more.
 *
 * Not pagination. `table-pagination` and `basic-pagination` both number the
 * pages; this replaces them with one growing list, and the two search screens
 * that draw it both chose this instead of numbers.
 *
 * Drawn in both consuming files, which is why it is here rather than in either
 * of them:
 *
 *   Activity log      `parts/results.tsx` — Display: N of M records / Display: N records
 *   Centralized log   `parts/results.tsx` — Display: N records
 *
 * What they agree on, and what ships: a centred column, gap 16, an Outline
 * Button 252 wide carrying the `arrow-down-16` mark, and the button present only
 * while something is still hidden.
 *
 * **What they disagree on is exposed, not decided.** Two files, two answers, no
 * third to break the tie — the same call `data-table`'s `columnGap` made:
 *
 *   caption text   one writes "of M", the other never does  → `caption` is yours
 *   caption tone   Text/Secondary vs Text/Tertiary          → `tone`, default secondary
 *   button label   "Show more" vs "Show More"               → `moreLabel`
 *
 * When a third file draws it, one of those defaults becomes a decision. Until
 * then the pattern refuses to invent one. */

export type TableFooterProps = {
  /** The whole sentence — "Display: 50 records", "Display: 20 of 50 records". */
  caption: React.ReactNode
  /** Omit and no button is drawn: nothing is left to fetch. */
  onShowMore?: () => void
  moreLabel?: React.ReactNode
  /** The two files disagree. Neither is wrong; pick the one your file draws. */
  tone?: 'secondary' | 'tertiary'
  /**
   * `[top, bottom]` in px. 16 / 24 is what the two search screens draw. A third
   * file, `Financial planning` (IfUYUQApZfEDkjIho9klKw · I8002:65848 · 65951),
   * draws the same block at 24 / 32 — under a table, inside an opened row, and
   * under the Expense limit table alike — so the inset is exposed, not decided.
   */
  padding?: [number, number]
  className?: string
}

const TONE = {
  secondary: 'webds-pattern-table-footer--secondary',
  tertiary: 'webds-pattern-table-footer--tertiary',
}

export function TableFooter({
  caption,
  onShowMore,
  moreLabel = 'Show more',
  tone = 'secondary',
  padding,
  className,
}: TableFooterProps) {
  return (
    <div
      style={padding ? { paddingTop: padding[0], paddingBottom: padding[1] } : undefined}
      className={cn(
        'webds-pattern-table-footer',
        className,
      )}
    >
      <p className={cn('webds-pattern-table-footer-2', TONE[tone])}>{caption}</p>
      {onShowMore && (
        <OutlineButton className="webds-pattern-table-footer-3" onClick={onShowMore}>
          {moreLabel}
          <img
            src={`${import.meta.env.BASE_URL}webds-icons/arrow-down-16.svg`}
            alt=""
            className="webds-pattern-table-footer-4"
          />
        </OutlineButton>
      )}
    </div>
  )
}
