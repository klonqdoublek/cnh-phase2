import { cn } from '@/lib/utils'
import type { ForceState } from './force'

/* BBL Checkbox — measured off `public/r/specs/checkbox.json`.
 *
 * The root is a bare 24×24 with no fill, no stroke and no radius, identical
 * across all nine variants. Everything that distinguishes a checked box from an
 * empty one lives in two children, which is why the spec now carries them and
 * why this component labels its parts with `data-part` matching their Figma
 * names — `Rectangle` for the box, `Vector` for the mark.
 *
 * The box is a **square**: 22×22, 2px stroke, cornerRadius 0. Not rounded.
 *
 * `strokeWidth` sits on the <svg>, not the <path>: the verification harness reads
 * computed styles off the node carrying `data-part`, and stroke-width declared on
 * a child would read back as the SVG default of 1 — a measurement of the wrong
 * element, which is a worse failure than a wrong value because it looks fine.
 *
 * One inconsistency left as the library has it: Disabled+Indeterminate strokes
 * its dash with `Border/Disabled/Subtle/Default` while Disabled+Selected strokes
 * its tick with `Icon/Disabled/Subtle/Default`. Both resolve to #C8C8CC, so there
 * is no visual difference — bookkeeping, not appearance. */

export type CheckboxSelection = 'none' | 'selected' | 'indeterminate'

export type CheckboxProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  selection?: CheckboxSelection
  /** Test-only: render the styles of a CSS state that cannot be triggered headlessly. */
  force?: ForceState
}

/** Box stroke by selection — the fill and the disabled treatment are shared. */
const BOX_STROKE: Record<CheckboxSelection, string> = {
  none: 'webds-checkbox--none',
  selected: 'webds-checkbox--selected',
  indeterminate: 'webds-checkbox--indeterminate',
}

export function Checkbox({ selection = 'none', force, disabled, className, ...props }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selection === 'indeterminate' ? 'mixed' : selection === 'selected'}
      disabled={disabled}
      data-force={force ?? undefined}
      className={cn('webds-checkbox', className)}
      {...props}
    >
      <span
        data-part="Rectangle"
        className={cn(
          'webds-checkbox-2',
          BOX_STROKE[selection],
        )}
      />
      {selection === 'selected' && (
        <svg
          data-part="Vector"
          width="9"
          height="7"
          viewBox="0 0 9 7"
          fill="none"
          strokeWidth={2}
          aria-hidden
          className={cn(
            'webds-checkbox-3',
          )}
        >
          <path d="M1 3.5L3.5 6L8 1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {selection === 'indeterminate' && (
        <svg
          data-part="Vector"
          width="8"
          height="2"
          viewBox="0 0 8 2"
          fill="none"
          strokeWidth={2}
          aria-hidden
          className={cn(
            'webds-checkbox-4',
          )}
        >
          <path d="M0 1H8" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}
