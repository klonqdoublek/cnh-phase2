import { cn } from '@/lib/utils'
import type { ForceState } from './force'

/* BBL Outline Button — measured off `public/r/specs/button.json`, set
 * "Outline Button". Same 44 / radius 2 / 0·16 / gap 4 shell as Button; the
 * anatomy that differs is the 1px stroke.
 *
 * Two things the spec says that are worth not tidying away:
 *
 *   - the border colour does NOT change with state. Only the fill moves
 *     (Subtle Default → Hovered → Pressed), except Disabled, which drops the
 *     fill entirely and swaps the border for Border/Disabled/Subtle/Default.
 *   - `Neutral` takes `Text/Highlight/Default` for its label — the same blue as
 *     `Default`. Only its border is neutral. That reads like an oversight, but
 *     it is what the library holds, so it is what this renders. */

export type OutlineButtonAppearance = 'default' | 'neutral' | 'negative'

export type OutlineButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: OutlineButtonAppearance
  /** Test-only: render the styles of a CSS state that cannot be triggered headlessly. */
  force?: ForceState
}

/** Border and label per appearance. Neither varies by state — see above. */
const APPEARANCE: Record<OutlineButtonAppearance, string> = {
  default: cn(
    'webds-outline-button--default',
    '',
  ),
  neutral: cn(
    'webds-outline-button--neutral',
    '',
  ),
  negative: cn(
    'webds-outline-button--negative',
    '',
  ),
}

export function OutlineButton({
  appearance = 'default',
  force,
  className,
  ...props
}: OutlineButtonProps) {
  return (
    <button
      type="button"
      data-force={force ?? undefined}
      className={cn(
        /* Geometry measured off the spec; Figma bound only the corner radius. */
        'webds-outline-button',
        APPEARANCE[appearance],
        className,
      )}
      {...props}
    />
  )
}
