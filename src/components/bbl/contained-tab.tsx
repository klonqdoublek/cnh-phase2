import { cn } from '@/lib/utils'
import type { ForceState } from './force'

/* BBL Contained Tab — `public/r/specs/tab.json`, set "Contained Tab", 6
 * variants: `Size` (M / L) × `State` (Default / Selected / Hovered).
 *
 * The folder-tab one: **rounded on top only** — 8/8/0/0 at M and 12/12/0/0 at L,
 * so it sits on an edge rather than floating. Its content is bottom-aligned
 * (counter axis MAX), which is what keeps the label on that edge as the tab
 * grows.
 *
 *   M   32 tall, padding 6/12, Label L
 *   L   38 tall, padding 8/16, Label XL
 *
 * **The weight changes with state**, which no other tab does: Default is Regular
 * in `Text/Secondary/Default`, and both Selected and Hovered are Medium in
 * `Text/Primary/Default`. All three surfaces come from the On Secondary row of
 * `Component/Tab/*`; there is no appearance axis here.
 *
 * The mixed radius is why the spec records `cornerRadius: null` for this set —
 * Figma reports a single radius only when all four agree, so the checker skips
 * the comparison and the shape is verified by its size and fill alone. Which is
 * how the first version of this file shipped with NO radius at all: the repo
 * generates `rounded-2` as its own utility, and Tailwind does not derive
 * `rounded-t-2` from it, so the class existed in the DOM and in no stylesheet.
 * The token is referenced directly instead, and the corner was checked by
 * reading the rendered value rather than by the harness, which cannot see it. */

export type ContainedTabSize = 'm' | 'l'

const SIZE: Record<ContainedTabSize, { shell: string; type: string }> = {
  m: { shell: 'webds-contained-tab--m-shell', type: 'webds-contained-tab--m-type' },
  l: { shell: 'webds-contained-tab--l-shell', type: 'webds-contained-tab--l-type' },
}

export type ContainedTabProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  size?: ContainedTabSize
  selected?: boolean
  force?: ForceState
}

export function ContainedTab({
  size = 'm',
  selected = false,
  force,
  className,
  children,
  ...props
}: ContainedTabProps) {
  const s = SIZE[size]
  return (
    <button
      type="button"
      data-force={force ?? undefined}
      className={cn(
        'webds-contained-tab',
        s.shell,
        selected
          ? 'webds-contained-tab--s1'
          : 'webds-contained-tab--s2',
        className,
      )}
      {...props}
    >
      <span
        data-part="Label"
        className={cn(
          s.type,
          /* Regular at rest, Medium once selected or hovered — the label gains
             weight as well as contrast, so both are written out. */
          selected
            ? 'webds-contained-tab-2--s1'
            : 'webds-contained-tab-2--s2',
        )}
      >
        {children}
      </span>
    </button>
  )
}
