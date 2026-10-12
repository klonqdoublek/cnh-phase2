import { cn } from '@/lib/utils'
import { PlaceholderIcon } from './icons'

/* BBL Avatar — `public/r/specs/avatar.json`, 18 variants: `Appearance`
 * (Circle / Rounded Square) × `Type` (Image / Icon / Letter) × `State`
 * (Default / Selected / Disabled).
 *
 * 32 × 32 BY DEFAULT, and the set says so in its own words: the design note on
 * `9210:11156` reads "Size Lock aspect ratio (1:1) / Default: 32x32 / Min: 24x24
 * Max: 56x56", and `9210:11164` lists size among the four things a consumer may
 * customise. So `size` is a published axis of this component, not an override —
 * and a file that draws 30 is inside the range rather than off-spec. Appearance
 * is the radius (Full against Radius 2). Type is what fills
 * it: a photo, the placeholder icon on `Surface/Accent/Blue/Default`, or two
 * letters in Body S on the same surface.
 *
 * **Disabled is drawn identically to Default** — same surface, same text and
 * icon tokens, in all six of its variants. Nothing in the file dims it. Recorded
 * rather than invented: an avatar that cannot be told apart when disabled is a
 * decision for the DS owner, not something to fix by adding an opacity here.
 *
 * Selected lays `.Building Block / Selected Overlay` over the whole 32
 * (`Component/Selected Overlay/Default`, blue at 50%) with a 12.8 × 8.88 check
 * stroked in `Icon/Primary/Inverse/Default`. That overlay is dotted — internal —
 * but it is real artwork rather than scaffolding, so it is drawn. */

export type AvatarAppearance = 'circle' | 'rounded-square'
export type AvatarType = 'image' | 'icon' | 'letter'
export type AvatarState = 'default' | 'selected' | 'disabled'

/* The check inside the selected overlay, 12.8 × 8.88 with a 1.2 stroke.
   `data-part` sits on the <svg>, whose box IS that size — a <path>'s bounding
   rect is its geometry without the stroke, which measured 11.6 × 7.68 and
   disagreed with the spec by exactly one stroke width. Same reason Checkbox
   puts its part on the svg. */
const CHECK = 'M0.6 4.86L4.6 8.28L12.2 0.6'

export type AvatarProps = {
  appearance?: AvatarAppearance
  type?: AvatarType
  state?: AvatarState
  /** For Type=Image. Nothing is invented when it is absent — the frame stays empty. */
  src?: string
  alt?: string
  /** For Type=Letter — "AB" is what BBL drew. */
  initials?: React.ReactNode
  /**
   * The square's side. 32 is the set's default; the component's own note bounds
   * the axis at 24–56 (`9210:11156`), so values outside that are the consumer
   * leaving the component. Aspect is locked 1:1 — one number, both sides.
   */
  size?: number
  className?: string
}

export function Avatar({
  appearance = 'circle',
  type = 'image',
  state = 'default',
  src,
  alt = '',
  initials = 'AB',
  size = 32,
  className,
}: AvatarProps) {
  const round = appearance === 'circle' ? 'webds-avatar-round-t' : 'webds-avatar-round-f'
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        'webds-avatar',
        round,
        type !== 'image' && 'webds-avatar--s1',
        className,
      )}
    >
      {type === 'image' && (
        <span data-part="Image" style={{ width: size, height: size }}>
          {src ? <img src={src} alt={alt} className="webds-avatar-2" /> : null}
        </span>
      )}
      {type === 'icon' && <PlaceholderIcon className="webds-avatar-3" />}
      {type === 'letter' && (
        <span data-part="Name Abbrev" className="webds-avatar-4">
          {initials}
        </span>
      )}
      {state === 'selected' && (
        <span
          data-part=".Building Block / Selected Overlay"
          className={cn(
            'webds-avatar-5',
            round,
          )}
        >
          <svg
            data-part="Union"
            width="12.8"
            height="8.88"
            viewBox="0 0 12.8 8.88"
            fill="none"
            strokeWidth={1.2}
            aria-hidden
            className="webds-avatar-6"
          >
            <path d={CHECK} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </span>
  )
}
