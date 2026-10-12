import { cn } from '@/lib/utils'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'

/* Empty State — measured on `3034:99973` ("Table 4", 3 variants) in the
 * Centralize Log file.
 *
 * The three things a result region says when it has no rows to show. The file
 * draws them at 1377 wide and 206 / 198 / 250 tall, but the height is content:
 * the structure is `py 48 · gap 16`, centred, with the copy on Label XL.
 *
 *   idle         Surface/Primary/Hovered · Objects illustration ·
 *                "Please select the filters and duration to show the results."
 *   searching    Surface/Primary/Default · Loading Indicator 64 ·
 *                "Searching result..."
 *   no-results   Surface/Primary/Default · Objects + Alert Large ·
 *                "No Results Found" over two lines of body, gap 0 between them
 *
 * **`idle` sits on the hovered surface and the other two do not.** That is what
 * the file draws; it is not a state in the interaction sense, so it is recorded
 * rather than normalised.
 *
 * **The illustration is not shipped.** The file uses the library's
 * `Buidling block / Objects (New)` (64 x 72) and stacks `Alert Large` on it for
 * no-results. Neither is in webds, so `icon` is a slot and the previews pass
 * nothing — drawing a lookalike here would put our invention in the DS. The
 * searching spinner *is* ours: Spinner Loader at size L is the same 64 box the
 * file places.
 *
 * The copy is centred and the body wraps at 396 — measured off the widest of
 * the three strings, which the file lets run to two lines. */

export type EmptyStateVariant = 'idle' | 'searching' | 'no-results'

/* `idle` is the only one that is its own card: Surface/Primary/Hovered at
   Radius 2, confirmed on three separate frames — Table 4's own idle variant
   (3034:99973), Card detail's "No card" (3034:99995) and Table 5's "empty"
   (3034:99875). The other two sit flat on the table's surface. */
const SURFACE: Record<EmptyStateVariant, string> = {
  idle: 'webds-pattern-empty-state--idle',
  searching: 'webds-pattern-empty-state--searching',
  'no-results': 'webds-pattern-empty-state--no-results',
}

export type EmptyStateProps = {
  variant?: EmptyStateVariant
  /** Drawn above the body, Label XL Emphasized. Only no-results has one. */
  title?: React.ReactNode
  /** The body copy, Label XL on Text/Tertiary. */
  children?: React.ReactNode
  /**
   * The illustration. Absent → nothing for idle and no-results, and the
   * Spinner Loader for searching.
   */
  icon?: React.ReactNode
  /**
   * An action under the copy — Table 5's empty state (`3034:99875`) puts an
   * Outline Small Button of 124 × 28 there, 16 below the text.
   */
  action?: React.ReactNode
  /**
   * The body's type role. Label XL is Table 4's. `Financial planning`
   * (IfUYUQApZfEDkjIho9klKw) draws the same `Table 4` set's `no data` variant
   * with Body M — "No results found", "Customer hasn't set an expense limit yet"
   * (I8002:65841 · I8002:65953) — while its idle variant keeps Label XL.
   */
  bodyType?: 'label-xl' | 'body-m'
  /**
   * Where the body wraps. 396 is the widest of Table 4's three strings; the
   * Financial planning idle copy runs 441 on one line in the same set
   * (I8002:65843), so a file whose copy is longer passes `'none'`.
   */
  bodyMaxWidth?: number | 'none'
  className?: string
}

export function EmptyState({
  variant = 'idle',
  title,
  children,
  icon,
  action,
  bodyType = 'label-xl',
  bodyMaxWidth,
  className,
}: EmptyStateProps) {
  const art = icon ?? (variant === 'searching' ? <SpinnerLoader size="l" /> : null)
  return (
    <div
      className={cn(
        'webds-pattern-empty-state',
        SURFACE[variant],
        className,
      )}
    >
      {art}
      {/* Title over body with no gap — the file stacks them in one column at
          gap 0, so the 22 and the 44 sit flush. */}
      <div
        className="webds-pattern-empty-state-2"
        style={bodyMaxWidth !== undefined ? { maxWidth: bodyMaxWidth } : undefined}
      >
        {title && (
          <span className="webds-pattern-empty-state-3">
            {title}
          </span>
        )}
        {children && (
          <span
            className={cn(
              'webds-pattern-empty-state-4',
              bodyType === 'body-m' && 'webds-pattern-empty-state-4--body-m',
            )}
          >
            {children}
          </span>
        )}
      </div>
      {action}
    </div>
  )
}
