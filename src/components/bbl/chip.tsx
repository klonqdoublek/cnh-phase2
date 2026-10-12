import { cn } from '@/lib/utils'

/* BBL Chip — `public/r/specs/chip.json`, sets "Chip" and "Pill Chip", 6 variants
 * each: `Appearance` (Default / Highlight) × `State` (Default / Selected /
 * Disabled).
 *
 * 32 tall, padding 0/12, gap 4, Label XL Medium. The two sets differ only in
 * radius — Radius 2 against Radius Full — so they share this file's table and
 * differ by one class.
 *
 * **Appearance does nothing until the chip is selected.** Default and Highlight
 * are identical at rest (white, Border/Primary) and identical when disabled
 * (Surface/Disabled, no border at all); only Selected separates them, where
 * Highlight takes Surface/Highlight/Subtle and a highlight label while Default
 * keeps the white surface and only moves its border. Rendered as drawn.
 *
 * The chevron BBL drew in the frame is switched off in all twelve variants, so
 * nothing is rendered for it. */

export type ChipAppearance = 'default' | 'highlight'
export type ChipState = 'default' | 'selected' | 'disabled'

export const CHIP_STATE: Record<ChipAppearance, Record<ChipState, string>> = {
  default: {
    default:
      'webds-chip--default-default',
    selected:
      'webds-chip--default-selected',
    disabled: 'webds-chip--default-disabled',
  },
  highlight: {
    default:
      'webds-chip--highlight-default',
    selected:
      'webds-chip--highlight-selected',
    disabled: 'webds-chip--highlight-disabled',
  },
}

export type ChipProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  appearance?: ChipAppearance
  state?: ChipState
  /** Radius Full instead of Radius 2 — the "Pill Chip" set. */
  pill?: boolean
}

export function Chip({
  appearance = 'default',
  state = 'default',
  pill = false,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      disabled={state === 'disabled'}
      className={cn(
        'webds-chip',
        pill ? 'webds-chip--s1' : 'webds-chip--s2',
        CHIP_STATE[appearance][state],
        className,
      )}
      {...props}
    >
      <span data-part="Label" className="webds-chip-2">
        {children}
      </span>
    </button>
  )
}
