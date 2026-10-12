import { cn } from '@/lib/utils'

/* **Icon** — an authored utility, in the same lane as `icons.tsx`: it is not a
 * component the Core Website library draws, and it claims no measurement.
 *
 * webds ships the artwork — 1,064 SVGs in `public/webds-icons/`, installed from
 * `bbl-icons` — and no way to recolour it. The files bake a colour in; there is
 * no `currentColor`. That is fine until one product needs the same glyph in two
 * inks, which is the first thing every consumer needs: `plus-16` is drawn
 * #0064FF and a filled Create button paints it white.
 *
 * The answer is to use the shipped file as a MASK and take the colour from a
 * token. The artwork stays webds's and nothing is redrawn — which is the whole
 * point, because the alternative every consumer reaches for is to inline a path
 * they typed themselves.
 *
 * **Sizes are separate drawings.** 16 / 24 / 32 are drawn independently in the
 * library — the 16 is not the 24 scaled — so `size` picks a file and never
 * scales one. Passing a size the slug does not ship gives a blank square, which
 * is correct: an icon that is not in the set should not be approximated.
 *
 * `dir` exists for artwork that `bbl-icons` does not ship and a consumer had to
 * export from a product file. Anything served from a folder other than
 * `webds-icons` is NOT library artwork, and the folder name has to keep saying
 * so — that is the only reason this prop is not just a constant. */

export type IconProps = {
  /** File stem under `public/<dir>/`, without the size suffix — `caution`. */
  slug: string
  /** 16 / 24 / 32 are separate drawings. Pass the one the spec names. */
  size?: 16 | 24 | 32
  /** A `--color-icon-*` token. Defaults to the primary ink. */
  color?: string
  /** Asset folder under `public/`. Anything but `webds-icons` is not ours. */
  dir?: string
  className?: string
}

export function Icon({
  slug,
  size = 16,
  color = 'var(--color-icon-primary-default)',
  dir = 'webds-icons',
  className,
}: IconProps) {
  const url = `url(/${dir}/${slug}-${size}.svg)`
  return (
    <span
      aria-hidden
      data-part="Icon"
      className={cn('webds-icon', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: `${size}px ${size}px`,
        WebkitMaskSize: `${size}px ${size}px`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }}
    />
  )
}
