import { Chip, type ChipProps } from './chip'

/* BBL Pill Chip — `public/r/specs/chip.json`, set "Pill Chip", 6 variants.
 *
 * The same component as Chip at `Radius Full` instead of `Radius 2`. Figma draws
 * it as its own set because a variant axis cannot change a radius token; in code
 * it is one prop, and this file exists so the registry can ship a file named
 * after the set. */

export function PillChip(props: Omit<ChipProps, 'pill'>) {
  return <Chip {...props} pill />
}
