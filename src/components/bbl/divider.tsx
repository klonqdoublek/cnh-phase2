import { cn } from '@/lib/utils'

/* BBL Divider — `public/r/specs/divider.json`.
 *
 * The whole page is **one loose component**: no variant set, no axes, 360 × 1
 * with a single `Vector` rectangle filled `Component/Divider/Default` (black at
 * 10%). 360 is the width it happened to be drawn at, so the rule fills its
 * container and the harness supplies that width.
 *
 * Until this batch a loose component carried no geometry in the extraction —
 * name, node id and key only — so Divider could not be verified at all: there
 * was nothing to compare a render against. Loose components now carry the same
 * payload a variant does, which is what makes this file checkable. */

export type DividerProps = React.HTMLAttributes<HTMLDivElement>

export function Divider({ className, ...props }: DividerProps) {
  return (
    <div role="separator" className={cn('webds-divider', className)} {...props}>
      <span data-part="Vector" className="webds-divider-2" />
    </div>
  )
}
