import { cn } from '@/lib/utils'
import type { ForceState } from './force'

/* BBL Radio Button — measured off `public/r/specs/radio.json`.
 *
 * Same shape of problem as Checkbox: the 24×24 root paints nothing, and the two
 * children carry everything. `Circle` is the 22×22 ring with a 2px stroke;
 * `Middle Circle` is the 12×12 dot that only exists when selected.
 *
 * Unlike Checkbox, the unselected ring uses `Border/Primary/Default` — a 10%
 * black — rather than `Icon/Tertiary/Default`. Two components solving the same
 * problem with different tokens; recorded, not reconciled. */

export type RadioButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  selected?: boolean
  /** Test-only: render the styles of a CSS state that cannot be triggered headlessly. */
  force?: ForceState
}

export function RadioButton({
  selected = false,
  force,
  disabled,
  className,
  ...props
}: RadioButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      data-force={force ?? undefined}
      className={cn('webds-radio-button', className)}
      {...props}
    >
      <span
        data-part="Circle"
        className={cn(
          'webds-radio-button-2',
          selected
            ? 'webds-radio-button-2--s1'
            : 'webds-radio-button-2--s2',
        )}
      />
      {selected && (
        <span
          data-part="Middle Circle"
          className={cn(
            'webds-radio-button-3',
          )}
        />
      )}
    </button>
  )
}
