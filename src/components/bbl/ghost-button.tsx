import { cn } from '@/lib/utils'
import type { ForceState } from './force'

/* BBL Ghost Button — measured off `public/r/specs/button.json`, set "Ghost Button".
 * 40 variants: Appearance (4) × State (5) × Padding (2).
 *
 * Written as a lookup rather than a cascade **on purpose**. The set is not
 * regular, and rules that generated it elegantly would have to smooth the
 * irregularities away. Every cell below is one row of the spec; where the library
 * surprises, the surprise is visible as data with a note beside it.
 *
 * ── Four places the pattern breaks ──────────────────────────────────────────
 *
 * [1] `Inverse` / `Selected` / Padding=None takes `Text/Highlight/Default` —
 *     it loses Inverse entirely, while Inverse's other four states all use
 *     `Text/Primary/Inverse/*`. On a dark surface this renders blue where the
 *     rest of the row renders white. Visible, and the one most likely to be a
 *     genuine mistake.
 *
 * [2] `Default` / `Hovered` / Padding=None turns the label from
 *     `Text/Primary/Default` to `Text/Highlight/Hovered` — black to blue on
 *     hover — but the same appearance at Padding=Default keeps it black.
 *     Also visible.
 *
 * [3] `Negative` / `Default` / Padding=Default carries a fill
 *     (`Surface/Primary/Subtle/Default`) where the other three appearances carry
 *     none. **No visual difference**: that token resolves to `rgb(0 0 0 / 0%)`,
 *     fully transparent. Bookkeeping, not appearance.
 *
 * [4] Disabled at Padding=Default carries the same transparent
 *     `Surface/Primary/Subtle/Default` while Disabled at Padding=None carries
 *     none. **Also no visual difference**, for the same reason.
 *
 * [1] and [2] are worth raising with the DS owner. [3] and [4] are noise in the
 * file. None of them is corrected here — the spec is what Figma says. */

export type GhostButtonAppearance = 'default' | 'highlight' | 'inverse' | 'negative'
export type GhostButtonPadding = 'default' | 'none'

export type GhostButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> & {
  appearance?: GhostButtonAppearance
  padding?: GhostButtonPadding
  selected?: boolean
  /** Test-only: render the styles of a CSS state that cannot be triggered headlessly. */
  force?: ForceState
}

type Cell = {
  /** State=Default — plus the :hover and :active declarations for that row. */
  base: string
  /** State=Selected. A prop, not a CSS state. */
  selected: string
  /** State=Disabled. */
  disabled: string
}

/* One entry per (appearance, padding). Each string is transcribed from the spec
   rows; the verification harness is what proves the transcription. */
const GHOST: Record<GhostButtonAppearance, Record<GhostButtonPadding, Cell>> = {
  default: {
    default: {
      base: cn(
        'webds-ghost-button--default-default-base',
        '',
        '',
        '',
        '',
      ),
      selected: cn(
        'webds-ghost-button--default-default-selected',
        '',
        '',
      ),
      /* [4] transparent fill, kept because the spec carries it */
      disabled: cn(
        'webds-ghost-button--default-default-disabled',
        '',
      ),
    },
    none: {
      /* [2] black at rest, blue on hover — unlike the same appearance at Padding=Default */
      base: cn(
        'webds-ghost-button--default-none-base',
        '',
        '',
        '',
        '',
      ),
      selected: 'webds-ghost-button--default-none-selected',
      disabled: 'webds-ghost-button--default-none-disabled',
    },
  },
  highlight: {
    default: {
      base: cn(
        'webds-ghost-button--highlight-default-base',
        '',
        '',
        '',
        '',
      ),
      selected: cn(
        'webds-ghost-button--highlight-default-selected',
        '',
        '',
      ),
      disabled: cn(
        'webds-ghost-button--highlight-default-disabled',
        '',
      ),
    },
    none: {
      base: cn(
        'webds-ghost-button--highlight-none-base',
        '',
        '',
        '',
        '',
      ),
      selected: 'webds-ghost-button--highlight-none-selected',
      disabled: 'webds-ghost-button--highlight-none-disabled',
    },
  },
  inverse: {
    default: {
      base: cn(
        'webds-ghost-button--inverse-default-base',
        '',
        '',
        '',
        '',
      ),
      selected: cn(
        'webds-ghost-button--inverse-default-selected',
        '',
        '',
      ),
      disabled: cn(
        'webds-ghost-button--inverse-default-disabled',
        '',
      ),
    },
    none: {
      base: cn(
        'webds-ghost-button--inverse-none-base',
        '',
        '',
        '',
        '',
      ),
      /* [1] loses Inverse — blue where the rest of this row is white */
      selected: 'webds-ghost-button--inverse-none-selected',
      disabled: 'webds-ghost-button--inverse-none-disabled',
    },
  },
  negative: {
    default: {
      /* [3] transparent fill at rest, unlike the other three appearances */
      base: cn(
        'webds-ghost-button--negative-default-base',
        '',
        '',
        '',
        '',
        '',
      ),
      selected: cn(
        'webds-ghost-button--negative-default-selected',
        '',
        '',
      ),
      disabled: cn(
        'webds-ghost-button--negative-default-disabled',
        '',
      ),
    },
    none: {
      base: cn(
        'webds-ghost-button--negative-none-base',
        '',
        '',
        '',
        '',
      ),
      selected: 'webds-ghost-button--negative-none-selected',
      disabled: 'webds-ghost-button--negative-none-disabled',
    },
  },
}

/** Padding=Default is a 44px pill-padded control; Padding=None is a 24px bare
 *  label. Both keep the 4px gap. */
const SHELL: Record<GhostButtonPadding, string> = {
  default: 'webds-ghost-button--default',
  none: 'webds-ghost-button--none',
}

export function GhostButton({
  appearance = 'default',
  padding = 'default',
  selected = false,
  disabled = false,
  force,
  className,
  ...props
}: GhostButtonProps) {
  const cell = GHOST[appearance][padding]
  return (
    <button
      type="button"
      disabled={disabled}
      data-force={force ?? undefined}
      data-selected={selected || undefined}
      className={cn(
        'webds-ghost-button',
        SHELL[padding],
        /* Disabled beats Selected beats the resting row — Figma models them as
           one axis, so only one can apply. */
        disabled ? cell.disabled : selected ? cell.selected : cell.base,
        disabled && 'webds-ghost-button--s1',
        className,
      )}
      {...props}
    />
  )
}
