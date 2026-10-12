import { cn } from '@/lib/utils'

/* BBL Scrim — `public/r/specs/overlay.json`, set "Building Block / Scrim",
 * 2 variants.
 *
 * A full-bleed wash with 24 of horizontal padding and nothing else. Its own
 * colours are the only place in the library that uses the `Component/Scrim/*`
 * family: Default is black at 40%, Strong at 70%.
 *
 * The file draws it 1440×1024 because that is the artboard it covers. A scrim
 * covers whatever it is put over, so nothing here is pinned — the verification
 * harness supplies the captured size, the same way it does for Input's fluid
 * width.
 *
 * Named `Building Block / …` without a leading dot, so unlike Input's internals
 * this one is published: it is meant to be used directly. */

export type ScrimAppearance = 'default' | 'strong'

const FILL: Record<ScrimAppearance, string> = {
  default: 'webds-building-block-scrim--default',
  strong: 'webds-building-block-scrim--strong',
}

export type ScrimProps = React.HTMLAttributes<HTMLDivElement> & {
  appearance?: ScrimAppearance
}

export function Scrim({ appearance = 'default', className, children, ...props }: ScrimProps) {
  return (
    <div
      className={cn('webds-scrim', FILL[appearance], className)}
      {...props}
    >
      {children}
    </div>
  )
}
