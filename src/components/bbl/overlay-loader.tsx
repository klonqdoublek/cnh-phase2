import { cn } from '@/lib/utils'
import { Scrim, type ScrimAppearance } from './building-block-scrim'
import { SpinnerLoader, type SpinnerAppearance, type SpinnerSize } from './building-block-spinner-loader'

/* BBL Overlay Loader — `public/r/specs/overlay.json`, the page's one **loose
 * component** (9210:29700): a Scrim with a Spinner Loader centred on it.
 *
 * It is composition and nothing else. Figma draws it as an instance of each of
 * the two building blocks, with the scrim filling and the spinner centred on
 * both axes, so this file adds no measurement of its own.
 *
 * **It cannot be verified, and that is a gap in the spec layer rather than a
 * choice.** A loose component — one drawn outside any variant set — is recorded
 * in the extraction by name, node id and key only; no geometry is captured for
 * it, so `check-components.ts` has nothing to compare a render against, and
 * `build-registry.ts` ships files per set and has nowhere to put it. Divider,
 * whose whole page is a single loose component, will hit the same wall in the
 * Data batch. Both are fixable by extracting loose components the way variants
 * are extracted; neither is fixed here. */

export type OverlayLoaderProps = {
  scrim?: ScrimAppearance
  size?: SpinnerSize
  /** The file uses the white spinner on the scrim, which is what `on Inverse` is
   *  for; it is a prop rather than a constant because the scrim is configurable. */
  spinner?: SpinnerAppearance
  animated?: boolean
  label?: string
  className?: string
}

export function OverlayLoader({
  scrim = 'default',
  size = 'l',
  spinner = 'on-inverse',
  animated = true,
  label,
  className,
}: OverlayLoaderProps) {
  /* The scrim is a CHILD of the loader, not its root: the loose component is a
     zero-padding frame holding a Scrim instance and the spinner, and the spec
     names that instance as a part. Rendering the Scrim as the root put its own
     24 of horizontal padding on the loader. */
  return (
    <div className={cn('webds-overlay-loader', className)}>
      <Scrim appearance={scrim} data-part="Building Block / Scrim" className="webds-overlay-loader-2" />
      <SpinnerLoader
        size={size}
        appearance={spinner}
        animated={animated}
        label={label}
        className="webds-overlay-loader-3"
      />
    </div>
  )
}
