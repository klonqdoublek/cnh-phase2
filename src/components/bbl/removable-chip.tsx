import { cn } from '@/lib/utils'

/* BBL Removable Chip — `public/r/specs/chip.json`, a **loose component** on that
 * page (87 × 32).
 *
 * A chip with a close button welded on: a `Label Container` carrying the border
 * and the label, then a 24-wide `Icon Container` holding a 24 × 16 Icon Button.
 * The outer shell keeps the fill and the radius and takes 2 of padding on the
 * right only, which is the asymmetry that makes the close button sit flush.
 *
 * Its close mark is `Icon/16px/General Icon/Close`, and the Icon Button's own
 * fill is `Surface/Primary/Subtle/Default` — transparent, as everywhere else it
 * appears.
 *
 * It is a loose component, so it has no variants: BBL drew one state. */

export type RemovableChipProps = {
  onRemove?: () => void
  removeLabel?: string
  children?: React.ReactNode
  className?: string
}

/* `Icon/16px/General Icon/Close`, verbatim — two strokes, not one path. */
const CLOSE_16 = [
  'M14 12.6667L3.33333 2L2 3.33333L12.6667 14L14 12.6667Z',
  'M12.6667 2L2.00001 12.6667L3.33334 14L14 3.33334L12.6667 2Z',
]

export function RemovableChip({ onRemove, removeLabel = 'Remove', children, className }: RemovableChipProps) {
  return (
    <span
      className={cn(
        'webds-removable-chip',
        className,
      )}
    >
      <span
        data-part="Label Container"
        className="webds-removable-chip-2"
      >
        <span data-part="Label" className="webds-removable-chip-3">
          {children}
        </span>
      </span>
      <span className="webds-removable-chip-4">
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          data-part="Icon Button"
          className="webds-removable-chip-5"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            {CLOSE_16.map((d) => (
              <path key={d} d={d} className="webds-removable-chip-6" />
            ))}
          </svg>
        </button>
      </span>
    </span>
  )
}
