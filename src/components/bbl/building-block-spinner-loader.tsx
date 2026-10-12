import { cn } from '@/lib/utils'

/* BBL Spinner Loader — `public/r/specs/overlay.json`, set
 * "Building Block / Spinner Loader", 4 variants: Size (L / M) × Appearance
 * (Brand / on Inverse).
 *
 * Four dots on a diamond. The spec records each dot's size; the positions were
 * read off the file (9210:29675) because the frame places them with a rotated
 * group rather than with layout, and a rotation is not something the extraction
 * captures:
 *
 *   L  64 box, 15 dots, centres (32, 8.67) (55.33, 32) (8.67, 32) (32, 55.33)
 *   M  48 box, 11 dots, centres (24, 7.74) (40.26, 24) (7.74, 24) (24, 40.26)
 *
 * Names come from the file: Ellipse 1 is the top dot, 2 right, 3 left, 4 bottom.
 *
 * **The colours are raw hex in the library, with no variable behind them.** Brand
 * alternates #0064FF and #7DB0FF; on Inverse is white throughout. #0064FF is
 * also what Surface/Highlight/Default resolves to, but the file does not bind it,
 * and binding it here would be our inference wearing the library's clothes. The
 * spec's `unboundValues` already reports this; it is a decision for the DS owner.
 *
 * **Motion is not in the file.** Figma draws four static frames; nothing there
 * says how fast, in which direction, or whether the dots pulse rather than the
 * ring turning. `animated` uses Tailwind's own `animate-spin` (1s linear) so the
 * default is at least honest about being a framework default rather than a BBL
 * value — and the verification harness renders with it off, because a rotated
 * square's bounding box is not the square. */

export type SpinnerSize = 'l' | 'm'
export type SpinnerAppearance = 'brand' | 'on-inverse'

type Geometry = { box: number; dot: number; centres: [number, number][] }

const GEOMETRY: Record<SpinnerSize, Geometry> = {
  l: {
    box: 64,
    dot: 15,
    centres: [
      [32, 8.67],
      [55.33, 32],
      [8.67, 32],
      [32, 55.33],
    ],
  },
  m: {
    box: 48,
    dot: 11,
    centres: [
      [24, 7.74],
      [40.26, 24],
      [7.74, 24],
      [24, 40.26],
    ],
  },
}

/* Transcribed, not tokenised — see the note above. */
const COLOURS: Record<SpinnerAppearance, [string, string, string, string]> = {
  brand: ['#0064FF', '#7DB0FF', '#7DB0FF', '#0064FF'],
  'on-inverse': ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
}

export type SpinnerLoaderProps = {
  size?: SpinnerSize
  appearance?: SpinnerAppearance
  /** Off for measurement; see the note on motion. */
  animated?: boolean
  label?: string
  className?: string
}

export function SpinnerLoader({
  size = 'l',
  appearance = 'brand',
  animated = true,
  label = 'Loading',
  className,
}: SpinnerLoaderProps) {
  const g = GEOMETRY[size]
  const colours = COLOURS[appearance]
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('webds-spinner-loader', animated && 'webds-spinner-loader--s1', className)}
      style={{ width: g.box, height: g.box }}
    >
      {g.centres.map(([cx, cy], i) => (
        <span
          key={i}
          data-part={`Ellipse ${i + 1}`}
          className="webds-spinner-loader-2"
          style={{
            width: g.dot,
            height: g.dot,
            left: cx - g.dot / 2,
            top: cy - g.dot / 2,
            background: colours[i],
          }}
        />
      ))}
    </div>
  )
}
