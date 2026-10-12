import { cn } from '@/lib/utils'
import type { ForceState } from './force'
import { TAB_LABEL, TAB_SURFACE, type TabAppearance } from './tab'

/* BBL Pill Tab — `public/r/specs/tab.json`, set "Pill Tab", 9 variants:
 * `Appearance` (Default / On Secondary / Inverse) × `State` (Default / Selected
 * / Hovered).
 *
 * The same colours as Tab from the same `Component/Tab/*` family, in a different
 * shell: 32 tall against 28, `Radius Full` against Radius 2, padding 0/12 with
 * the height fixed rather than 4/12 with the height hugging.
 *
 * It has no Disabled state, where Tab does. Rendered as the file has it. */

export type PillTabProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  appearance?: TabAppearance
  selected?: boolean
  force?: ForceState
  part?: string
}

export function PillTab({
  appearance = 'default',
  selected = false,
  force,
  part,
  className,
  children,
  ...props
}: PillTabProps) {
  const s = TAB_SURFACE[appearance]
  return (
    <button
      type="button"
      data-part={part}
      data-force={force ?? undefined}
      className={cn(
        'webds-pill-tab',
        selected ? s.selected : s.rest,
        !selected && s.hover,
        className,
      )}
      {...props}
    >
      <span
        data-part="Label"
        className={cn(
          'webds-pill-tab-2',
          selected ? TAB_LABEL[appearance].selected : TAB_LABEL[appearance].rest,
        )}
      >
        {children}
      </span>
    </button>
  )
}
