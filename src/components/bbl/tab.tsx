import { cn } from '@/lib/utils'
import type { ForceState } from './force'

/* BBL Tab — `public/r/specs/tab.json`, set "Tab", 12 variants:
 * `Appearance` (Default / On Secondary / Inverse) × `State` (Default / Selected
 * / Hovered / Disabled).
 *
 * A 28-tall rounded rectangle (Radius 2) with 4/12 padding and a Label L Medium
 * label. Everything that moves is a colour, and every one of them comes from the
 * `Component/Tab/*` family — the only web component with a token family of its
 * own besides Toggle Switch and Scrim.
 *
 * **Disabled is not a fill.** It reuses the appearance's Default surface and
 * greys only the label, so the table below has no disabled surface: there is
 * nothing to look up.
 *
 * Hovered is a real CSS state rather than a prop, with `data-force` for the
 * harness — the treatment Button already uses. `Selected` and `Disabled` are
 * props, because they are not pointer states.
 *
 * The classes are written out per appearance rather than composed from a
 * variable. Tailwind generates what it can SEE in the source, so
 * `hover:${surface}` produces a class name that exists in the DOM and in no
 * stylesheet — visible as nothing happening on hover. */

export type TabAppearance = 'default' | 'on-secondary' | 'inverse'

type Surface = { rest: string; selected: string; hover: string }

export const TAB_SURFACE: Record<TabAppearance, Surface> = {
  default: {
    rest: 'webds-tab--tab-surface-default-rest',
    selected: 'webds-tab--tab-surface-default-selected',
    hover:
      'webds-tab--default-hover',
  },
  'on-secondary': {
    rest: 'webds-tab--tab-surface-on-secondary-rest',
    selected: 'webds-tab--tab-surface-on-secondary-selected',
    hover:
      'webds-tab--on-secondary-hover',
  },
  inverse: {
    rest: 'webds-tab--tab-surface-inverse-rest',
    selected: 'webds-tab--tab-surface-inverse-selected',
    hover:
      'webds-tab--inverse-hover',
  },
}

/** Label colour by appearance and state.
 *
 *  **Inverse flips when selected**: white on the dark resting surface, and
 *  `Text/Primary/Default` — black — once selected, because the selected surface
 *  is the light one. Both Tab and Pill Tab do this, in every appearance/state
 *  pair BBL drew, so it is the design rather than one variant's mistake. It is
 *  also the only place the Inverse row leaves the Inverse text tokens. */
export const TAB_LABEL: Record<TabAppearance, { rest: string; selected: string; disabled: string }> = {
  default: {
    rest: 'webds-tab--tab-label-default-rest',
    selected: 'webds-tab--tab-label-default-selected',
    disabled: 'webds-tab--default-disabled',
  },
  'on-secondary': {
    rest: 'webds-tab--tab-label-on-secondary-rest',
    selected: 'webds-tab--tab-label-on-secondary-selected',
    disabled: 'webds-tab--on-secondary-disabled',
  },
  inverse: {
    rest: 'webds-tab--tab-label-inverse-rest',
    selected: 'webds-tab--tab-label-inverse-selected',
    disabled: 'webds-tab--inverse-disabled',
  },
}

export type TabProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  appearance?: TabAppearance
  selected?: boolean
  force?: ForceState
  /** The spec child this tab implements, when it sits inside a Segmented Tab. */
  part?: string
}

export function Tab({
  appearance = 'default',
  selected = false,
  disabled = false,
  force,
  part,
  className,
  children,
  ...props
}: TabProps) {
  const s = TAB_SURFACE[appearance]
  return (
    <button
      type="button"
      disabled={disabled}
      data-part={part}
      data-force={force ?? undefined}
      className={cn(
        'webds-tab',
        selected ? s.selected : s.rest,
        !disabled && !selected && s.hover,
        className,
      )}
      {...props}
    >
      <span
        data-part="Label"
        className={cn(
          'webds-tab-2',
          disabled
            ? TAB_LABEL[appearance].disabled
            : selected
              ? TAB_LABEL[appearance].selected
              : TAB_LABEL[appearance].rest,
        )}
      >
        {children}
      </span>
    </button>
  )
}
