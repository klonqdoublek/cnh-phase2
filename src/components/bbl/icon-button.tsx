import { cn } from '@/lib/utils'
import type { ForceState } from './force'
import { PlaceholderIcon, PlaceholderIcon24 } from './icons'

/* BBL Icon Button — `public/r/specs/button.json`, set "Icon Button", 20
 * variants: `Appearance` (Default / Highlight) × `State` (Defaut / Hovered /
 * Clicked / Selected / Disabled) × `Size` (16 / 24).
 *
 * A bare icon in a Radius 1 box the size of the icon itself — 16 or 24, no
 * padding. The surface is `Surface/Primary/Subtle/*`, which is transparent at
 * rest and only appears on hover, press or selection; the icon carries the
 * appearance.
 *
 * `State` is spelled **"Defaut"** in the file. The variant key is the file's, so
 * the registry uses that spelling; the prop here is spelled correctly.
 *
 * Disabled overrides the appearance: both rows take
 * `Icon/Disabled/Subtle/Default`.
 *
 * This set and Contained Icon Button were the two the earlier sessions listed as
 * "blocked on an icon component that does not exist yet". They are not blocked
 * on artwork — BBL draws `Icon/{16,24}px/Others/Placeholder` in every variant,
 * the swap slot itself, and its vector is what the spec records (13.6 and 21.7).
 * A caller passing `icon` replaces it. */

export type IconButtonAppearance = 'default' | 'highlight'
export type IconButtonSize = 16 | 24

const SURFACE = {
  rest: 'webds-icon-button--rest',
  hover:
    'webds-icon-button--hover',
  selected: 'webds-icon-button--selected',
}

const ICON: Record<IconButtonAppearance, string> = {
  default: 'webds-icon-button--default',
  highlight: 'webds-icon-button--highlight',
}

export type IconButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  appearance?: IconButtonAppearance
  size?: IconButtonSize
  selected?: boolean
  force?: ForceState
  icon?: React.ReactNode
  label?: string
}

export function IconButton({
  appearance = 'default',
  size = 16,
  selected = false,
  disabled = false,
  force,
  icon,
  label,
  className,
  ...props
}: IconButtonProps) {
  const fill = disabled ? 'webds-icon-button-fill-t' : ICON[appearance]
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      data-force={force ?? undefined}
      className={cn(
        'webds-icon-button',
        size === 24 ? 'webds-icon-button--s1' : 'webds-icon-button--s2',
        selected ? SURFACE.selected : SURFACE.rest,
        !disabled && !selected && SURFACE.hover,
        className,
      )}
      {...props}
    >
      {icon ?? (size === 24 ? <PlaceholderIcon24 className={fill} /> : <PlaceholderIcon className={fill} />)}
    </button>
  )
}
