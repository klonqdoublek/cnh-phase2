import { cn } from '@/lib/utils'

/* BBL Card Surface — `public/r/specs/card.json`, set
 * "Building Block / Card Surface", 15 variants: `Type` (Default / Raised /
 * Brand) × `State` (Default / Hovered / Clicked / Selected / Disabled).
 *
 * A surface and nothing else: Radius 2, 16 of padding, and a fill that moves
 * with state. What is inside is the caller's — BBL drew a `.Placeholder Slot`
 * there, a red box saying "Replace with your own content", which the extraction
 * now skips rather than record as anatomy. That is why this component has no
 * children in its spec and why the harness renders it at the 205 × 88 the frame
 * was drawn at: its size is its content's.
 *
 * The three Types differ in how they respond, not at rest:
 *
 *   Default   Surface/Primary/{Default,Hovered,Pressed} — the fill moves
 *   Raised    fill stays Primary/Default; Hovered and Clicked gain a shadow
 *   Brand     fill stays Primary/Default; Hovered and Clicked gain the brand's
 *             offset shadow (0-blur, 5/5 offset)
 *
 * Selected adds a `Border/Highlight/Default` stroke to whatever the Type does,
 * and Disabled replaces the fill with Surface/Disabled/Default in all three.
 *
 * **Shadows are not verified.** The harness reads geometry and colour; it does
 * not read `box-shadow`, and the spec records effects as raw strings
 * ("DROP_SHADOW 0,4 8"). The two BBL elevation recipes are used by name —
 * `--shadow-raised` and `--shadow-brand` — which is the same mapping P0
 * composed them under. */

export type CardType = 'default' | 'raised' | 'brand'
export type CardState = 'default' | 'hovered' | 'clicked' | 'selected' | 'disabled'

const FILL: Record<CardType, Record<CardState, string>> = {
  default: {
    default: 'webds-building-block-card-surface--default-default',
    hovered: 'webds-building-block-card-surface--default-hovered',
    clicked: 'webds-building-block-card-surface--default-clicked',
    selected: 'webds-building-block-card-surface--default-selected',
    disabled: 'webds-building-block-card-surface--default-disabled',
  },
  raised: {
    default: 'webds-building-block-card-surface--raised-default',
    hovered: 'webds-building-block-card-surface--raised-hovered',
    clicked: 'webds-building-block-card-surface--raised-clicked',
    selected: 'webds-building-block-card-surface--raised-selected',
    disabled: 'webds-building-block-card-surface--raised-disabled',
  },
  brand: {
    default: 'webds-building-block-card-surface--brand-default',
    hovered: 'webds-building-block-card-surface--brand-hovered',
    clicked: 'webds-building-block-card-surface--brand-clicked',
    selected: 'webds-building-block-card-surface--brand-selected',
    disabled: 'webds-building-block-card-surface--brand-disabled',
  },
}

export type CardSurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  type?: CardType
  state?: CardState
}

export function CardSurface({
  type = 'default',
  state = 'default',
  className,
  children,
  ...props
}: CardSurfaceProps) {
  return (
    <div
      className={cn(
        'webds-card-surface',
        FILL[type][state],
        /* A stroke on a frame that hugs its content has to be an outline — see
           the note in alert.tsx. This one is a fixed size, but it is the same
           edge and the same token, so it is painted the same way. */
        state === 'selected' &&
          'webds-card-surface--s1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
