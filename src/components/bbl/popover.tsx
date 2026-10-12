import { cn } from '@/lib/utils'

/* BBL Popover — `public/r/specs/popover.json`, 12 variants on one axis:
 * `Beak Position` — Top/Bottom × Left/Center/Right, and Left/Right ×
 * Top/Center/Bottom.
 *
 * A `Popover Container` (Radius 3, `Surface/Secondary/Default`) with a 15 × 8
 * `Beak` triangle attached to one edge. The frame is 120 × 80 throughout, and
 * the container gives up the beak's 8 on whichever axis it sits: 120 × 72 for a
 * top or bottom beak, 112 × 80 for a left or right one.
 *
 * What is inside is the caller's — BBL drew a placeholder slot, which the
 * extraction skips — so the harness renders at the drawn frame size.
 *
 * **The beak is one triangle, rotated.** Figma records its node box as 15 × 8 in
 * every variant, including the side ones where it plainly stands 8 wide and 15
 * tall: a Figma width/height is the node's own box, before its rotation. A
 * browser's `getBoundingClientRect` is the opposite — it reports the rotated
 * box. So a rotated part declares `data-rotated`, and the checker compares the
 * spec's dimensions swapped. Without that the side beaks would have to be drawn
 * un-rotated to pass, which would be drawing the wrong shape to please the
 * test. */

export type BeakSide = 'top' | 'bottom' | 'left' | 'right'
export type BeakAlign = 'start' | 'center' | 'end'

export type PopoverProps = {
  /** e.g. "Top - Center" in Figma; here the side and the alignment. */
  side?: BeakSide
  align?: BeakAlign
  children?: React.ReactNode
  className?: string
}

/** 15 wide, 8 tall, apex up. */
const BEAK_PATH = 'M7.5 0L15 8H0L7.5 0Z'

const ALIGN: Record<BeakAlign, string> = { start: 'webds-popover--start', center: 'webds-popover--center', end: 'webds-popover--end' }

export function Popover({ side = 'top', align = 'center', children, className }: PopoverProps) {
  const vertical = side === 'top' || side === 'bottom'
  /* Rotation per side, and the spec's box is the un-rotated one. */
  const rotation = { top: 0, bottom: 180, left: 270, right: 90 }[side]
  const quarter = rotation === 90 || rotation === 270
  /* The svg keeps its own 15 × 8 box; the wrapper reserves what the ROTATED
     shape occupies — 8 × 15 on the sides — because a rotated element still
     takes its unrotated size in layout, which left the container 105 wide
     instead of the 112 the spec records. */
  const beak = (
    <span
      className={cn('webds-popover', quarter ? 'webds-popover--s1' : 'webds-popover--s2')}
    >
      <svg
        width="15"
        height="8"
        viewBox="0 0 15 8"
        fill="none"
        aria-hidden
        /* shrink-0 or the flex wrapper squeezes the 15 into 8 and the viewBox
           scales the triangle down with it — measured 4.27 wide. */
        className="webds-popover-2"
        style={rotation ? { transform: `rotate(${rotation}deg)` } : undefined}
      >
        <path
          data-part="Beak"
          data-rotated={quarter ? '90' : undefined}
          d={BEAK_PATH}
          className="webds-popover-3"
        />
      </svg>
    </span>
  )

  return (
    <div
      className={cn(
        'webds-popover-4',
        vertical ? 'webds-popover-4--s1' : 'webds-popover-4--s2',
        vertical ? ALIGN[align].replace('items', 'items') : ALIGN[align],
        className,
      )}
    >
      {(side === 'top' || side === 'left') && beak}
      <div
        data-part="Popover Container"
        className="webds-popover-5"
      >
        {children}
      </div>
      {(side === 'bottom' || side === 'right') && beak}
    </div>
  )
}
