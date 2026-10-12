import { cn } from '@/lib/utils'
import type { ForceState } from './force'

/* BBL Scroll Bar — `public/r/specs/scroll-bar.json`, 12 variants:
 * `Appearance` (Thin / Thick) × `Orientation` (Vertical / Horizontal) ×
 * `State` (Default / Hovered / Clicked).
 *
 * A 12-wide track with 2 of padding and a pill thumb inside it. Two things the
 * spec says that are easy to miss:
 *
 * - **Thin only stays thin at rest.** Thin/Default is 2 across; Thin/Hovered is
 *   8 — the same as Thick. So the Appearance axis describes the resting state,
 *   and hovering a thin bar makes it a thick one.
 * - **The track is the same 12 either way**; only the thumb's axis swaps.
 *
 * Colour moves only on Clicked (`Component/Scroll Bar/Pressed`); Hovered keeps
 * the Default fill and changes size instead.
 *
 * Hovered and Clicked are CSS states with `data-force` for the harness, as
 * everywhere else. */

export type ScrollBarAppearance = 'thin' | 'thick'
export type ScrollBarOrientation = 'vertical' | 'horizontal'

export type ScrollBarProps = {
  appearance?: ScrollBarAppearance
  orientation?: ScrollBarOrientation
  force?: ForceState
  className?: string
  /**
   * Where the thumb sits and how long it is, as a fraction of the track.
   *
   * The library draws the thumb filling its track, because a static frame has
   * nothing to scroll — but a bar that cannot move is worse than no bar on a
   * list that can: it says the list is complete. Omit both and the drawn
   * behaviour is unchanged.
   */
  thumbSize?: string
  thumbOffset?: string
}

export function ScrollBar({
  appearance = 'thin',
  orientation = 'vertical',
  force,
  className,
  thumbSize,
  thumbOffset,
}: ScrollBarProps) {
  const vertical = orientation === 'vertical'
  const thin = appearance === 'thin'
  const live = thumbSize != null || thumbOffset != null
  return (
    <div
      data-force={force ?? undefined}
      className={cn(
        'webds-scroll-bar',
        vertical ? 'webds-scroll-bar--s1' : 'webds-scroll-bar--s2',
        /* A live track takes its length from the row it sits in, not from
           `h-full`: `height: 100%` needs a parent with a definite height, and
           beside a flex-grown list there is none — the track collapsed to its own
           content, which for a percentage-sized thumb is nothing. `self-stretch`
           is how a flex item matches its siblings instead. */
        live && (vertical ? 'h-auto self-stretch' : 'w-auto self-stretch'),
        /* At rest the thumb fills its track, so centring it is invisible. Once
           it is shorter than the track it has to start at the top — centred, a
           thumb at scrollTop 0 sat 66px down a 240 track. */
        vertical
          ? live
            ? 'flex-col items-center justify-start'
            : 'justify-center'
          : live
            ? 'flex-row items-center justify-start'
            : 'items-center',
        className,
      )}
    >
      <span
        data-part="Scroll Bar"
        /* The offset is `top`/`left` on a relative thumb, not a margin.
           A percentage margin — either axis of it — resolves against the
           containing block's **width**, and this track is 12 wide: `margin-top:
           50%` measured 4px against a 240 track, so a vertical thumb never
           moved. `top` resolves against the height (118px on the same track),
           and a relative offset also keeps the thumb out of the layout. */
        style={
          live
            ? vertical
              ? { height: thumbSize, position: 'relative', top: thumbOffset }
              : { width: thumbSize, position: 'relative', left: thumbOffset }
            : undefined
        }
        className={cn(
          'webds-scroll-bar-2',
          live && 'webds-scroll-bar-2--s1',
          !live && (vertical ? 'h-full' : 'w-full'),
          /* Thin thickens on hover; thick is already there. */
          thin
            ? vertical
              ? 'w-[2px] group-hover:w-[8px] group-data-[force=hovered]:w-[8px] group-active:w-[8px] group-data-[force=clicked]:w-[8px]'
              : 'h-[2px] group-hover:h-[8px] group-data-[force=hovered]:h-[8px] group-active:h-[8px] group-data-[force=clicked]:h-[8px]'
            : vertical
              ? 'w-[8px]'
              : 'h-[8px]',
        )}
      />
    </div>
  )
}
