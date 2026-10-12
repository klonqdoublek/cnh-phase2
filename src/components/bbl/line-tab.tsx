import { cn } from '@/lib/utils'
import type { ForceState } from './force'

/* BBL Line Tab — `public/r/specs/tab.json`, set "Line Tab", 9 variants:
 * `Appearance` (Default / Subtle / Inverse) × `State` (Default / Selected /
 * Hovered).
 *
 * A Label XL Medium over a 2px line, gap 6, no fill and no padding: the whole
 * component is the label and the rule under it, and the rule is as wide as the
 * label.
 *
 * The line is always drawn — `Component/Tab/Default` is the resting colour, not
 * an absence — and it is the line, not the label, that says which tab is
 * selected in the Default and Subtle appearances:
 *
 *   Default   label Text/Primary        line Component/Tab/Default
 *   Subtle    label Text/Secondary      line Component/Tab/Default
 *   selected  label Text/Primary        line Component/Tab/Line Tab/Selected
 *   hovered   label Text/Highlight/Hovered   line Component/Tab/Line Tab/Hovered
 *   Inverse   label Text/Primary/Inverse     line Component/Tab/Inverse/Default
 *
 * Two things left as the file has them: Subtle's label goes from Secondary to
 * **Primary** when selected while Default's stays Primary — so the two
 * appearances converge on selection — and Inverse takes the same
 * `Line Tab/Selected` line as the others when selected, rather than an inverse
 * one. */

export type LineTabAppearance = 'default' | 'subtle' | 'inverse'

export type LineTabProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  appearance?: LineTabAppearance
  selected?: boolean
  force?: ForceState
}

const LABEL: Record<LineTabAppearance, { rest: string; selected: string }> = {
  default: {
    rest: 'webds-line-tab--default-rest',
    selected: 'webds-line-tab--default-selected',
  },
  subtle: {
    rest: 'webds-line-tab--subtle-rest',
    selected: 'webds-line-tab--subtle-selected',
  },
  inverse: {
    rest: 'webds-line-tab--inverse-rest',
    selected: 'webds-line-tab--inverse-selected',
  },
}

const LINE: Record<LineTabAppearance, string> = {
  default: 'webds-line-tab--default',
  subtle: 'webds-line-tab--subtle',
  inverse: 'webds-line-tab--inverse',
}

export function LineTab({
  appearance = 'default',
  selected = false,
  force,
  className,
  children,
  ...props
}: LineTabProps) {
  return (
    <button
      type="button"
      data-force={force ?? undefined}
      className={cn('webds-line-tab', className)}
      {...props}
    >
      <span
        data-part="Label"
        className={cn(
          'webds-line-tab-2',
          selected ? LABEL[appearance].selected : LABEL[appearance].rest,
        )}
      >
        {children}
      </span>
      <span
        data-part="Line"
        className={cn(
          'webds-line-tab-3',
          selected ? 'webds-line-tab-3--s1' : LINE[appearance],
        )}
      />
    </button>
  )
}
