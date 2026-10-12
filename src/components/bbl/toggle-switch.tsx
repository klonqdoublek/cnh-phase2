import { cn } from '@/lib/utils'
import type { ForceState } from './force'

/* BBL Toggle Switch — measured off `public/r/specs/switch.json`.
 *
 * Unlike Checkbox and Radio this one does paint its root: a 50×30 track with
 * `Radius Full`. The children are `Handle` and, when on, `Icon`.
 *
 * The handle **grows**: 18×18 when off, 24×24 when on. That is measured, not a
 * flourish — and it is why the off and on states cannot share one sized element.
 *
 * The switch has its own token family (`Component/Toggle Switch/*`) rather than
 * reusing Surface/Icon tokens, which is the only component in this batch to do so. */

export type ToggleSwitchProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  toggled?: boolean
  /** Test-only: render the styles of a CSS state that cannot be triggered headlessly. */
  force?: ForceState
}

export function ToggleSwitch({
  toggled = false,
  force,
  disabled,
  className,
  ...props
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={toggled}
      disabled={disabled}
      data-force={force ?? undefined}
      className={cn(
        'webds-toggle-switch',
        toggled
          ? 'webds-toggle-switch--s1'
          : 'webds-toggle-switch--s2',
        className,
      )}
      {...props}
    >
      <span
        data-part="Handle"
        className={cn(
          'webds-toggle-switch-2',
          /* Measured: the handle is larger when on. */
          toggled ? 'webds-toggle-switch-2--s1' : 'webds-toggle-switch-2--s2',
        )}
      >
        {toggled && (
          <svg
            data-part="Icon"
            width="10"
            height="7"
            viewBox="0 0 10 7"
            fill="none"
            strokeWidth={2}
            aria-hidden
            className={cn(
              'webds-toggle-switch-3',
            )}
          >
            <path d="M1 3.5L3.5 6L9 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  )
}
