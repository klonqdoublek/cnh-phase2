import { cn } from '@/lib/utils'
import type { ForceState } from './force'
import { PlaceholderIcon, PlaceholderIcon24 } from './icons'

/* BBL Contained Icon Button — `public/r/specs/button.json`, set "Contained Icon
 * Button", 64 variants: `Shape` (Rounded Square / Circle) × `Appearance`
 * (Default / Neutral) × `State` (Default / Hovered / Clicked / Disabled) ×
 * `has Background` (Yes / No) × `Icon Size` (16 / 24).
 *
 * A 44 × 44 target — the same 44 as Button's height — holding a 16 or 24 icon.
 * Shape is the radius (Radius 2 or Full) and `has Background` decides which
 * surface family moves:
 *
 *   Yes   Surface/Primary/{Default,Hovered,Pressed}, Surface/Disabled/Default
 *   No    Surface/Primary/Subtle/{Default,Hovered,Pressed} — transparent at rest
 *
 * The icon is `Icon/Highlight/Default` throughout and `Icon/Disabled/Default`
 * when disabled.
 *
 * **Every variant carries a 1px stroke, and `Appearance` is what moves it:**
 * Default takes `Border/Highlight/Default`, Neutral `Border/Primary/Default`,
 * and both take `Border/Disabled/Subtle/Default` when disabled. The fill is
 * identical across the two appearances, which is why a summary that compared
 * fills alone made the axis look inert — I wrote exactly that in this comment
 * before the checker disagreed with it 104 times. The border is what the axis
 * is for.
 *
 * The stroke is a CSS border rather than an outline here: the frame is a fixed
 * 44 × 44, so a border-box border paints inside it without changing the size —
 * the reason Alert needed an outline does not apply. */

export type ContainedIconButtonShape = 'rounded-square' | 'circle'
export type ContainedIconButtonAppearance = 'default' | 'neutral'

const BORDER: Record<ContainedIconButtonAppearance, string> = {
  default: 'webds-contained-icon-button--default',
  neutral: 'webds-contained-icon-button--neutral',
}

const WITH_BACKGROUND =
  'webds-contained-icon-button--with-background'
const WITHOUT_BACKGROUND =
  'webds-contained-icon-button--without-background'

export type ContainedIconButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  shape?: ContainedIconButtonShape
  /** Declared by the file, and identical to `default` in all 32 pairs. */
  appearance?: ContainedIconButtonAppearance
  background?: boolean
  iconSize?: 16 | 24
  force?: ForceState
  icon?: React.ReactNode
  label?: string
}

export function ContainedIconButton({
  shape = 'rounded-square',
  appearance = 'default',
  background = false,
  iconSize = 16,
  disabled = false,
  force,
  icon,
  label,
  className,
  ...props
}: ContainedIconButtonProps) {
  const fill = disabled
    ? 'webds-contained-icon-button-fill-t'
    : 'webds-contained-icon-button-fill-f'
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      data-force={force ?? undefined}
      className={cn(
        'webds-contained-icon-button',
        shape === 'circle' ? 'webds-contained-icon-button--s1' : 'webds-contained-icon-button--s2',
        disabled ? 'webds-contained-icon-button--s3' : BORDER[appearance],
        disabled
          ? background
            ? 'bg-[var(--color-surface-disabled-default)]'
            : 'bg-[var(--color-surface-primary-subtle-default)]'
          : background
            ? WITH_BACKGROUND
            : WITHOUT_BACKGROUND,
        className,
      )}
      {...props}
    >
      {icon ?? (iconSize === 24 ? <PlaceholderIcon24 className={fill} /> : <PlaceholderIcon className={fill} />)}
    </button>
  )
}
