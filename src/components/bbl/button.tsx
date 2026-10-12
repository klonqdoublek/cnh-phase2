import { cn } from '@/lib/utils'
import type { ForceState } from './force'

/* BBL Button — measured off `public/r/specs/button.json`, set "Button".
 *
 * Every number and colour below traces to that spec. Height 44 also matches what
 * BBL wrote on the page: "Default = 44pt / Min height = 28pt / Max height = 56pt",
 * so the range is theirs and only the default is fixed here.
 *
 * Width is deliberately not set — the spec's 93px is the measured width of the
 * word "Label" plus padding, and BBL's note says "Default width = Hug content."
 * Pinning 93 would encode one label's length as a component rule.
 *
 * Figma carries State as a variant axis (Default / Hovered / Clicked / Disabled).
 * On the web those are :hover, :active and [disabled]. `force` exists so the
 * verification harness can measure a hover state without a pointer — it applies
 * the same declarations, it does not invent new ones. */

export type ButtonAppearance = 'default' | 'negative'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: ButtonAppearance
  /** Test-only: render the styles of a CSS state that cannot be triggered headlessly. */
  force?: ForceState
}

const APPEARANCE: Record<ButtonAppearance, string> = {
  default: cn(
    'webds-button--default',
    '',
    '',
    '',
    '',
  ),
  negative: cn(
    'webds-button--negative',
    '',
    '',
    '',
    '',
  ),
}

export function Button({ appearance = 'default', force, className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      data-force={force ?? undefined}
      className={cn(
        /* 44 / 16 / 4 are geometry the spec measured, not tokens: Figma bound the
           corner radius to `Radius 2` but left padding, gap and height as raw
           values. Binding them to --space-* here would be our inference dressed
           as the library's decision. Tailwind's h-11/px-4/gap-1 would also route
           through --spacing, which is not a BBL token. */
        'webds-button',
        APPEARANCE[appearance],
        className,
      )}
      {...props}
    />
  )
}
