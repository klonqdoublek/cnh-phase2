import { cn } from '@/lib/utils'
import { Divider } from '@/bbl/divider'

/* Select List — measured on `3034:99818` ("Activity Option1 — Single Selection",
 * 415 × 688, 2 variants) in the Centralize Log file.
 *
 * The single-select twin of the Multi Select Panel: a search field, then options
 * gathered under short group rules. No checkboxes, no chips, no footer — picking
 * one closes it.
 *
 *   root    V · py 8 · Surface/Primary/Default · 415 in the file
 *           Radius 2 · a 1px inside stroke on Border/Primary/Default · Overlay
 *   search  the library's Search Field, in a row of 72
 *   option  36 tall · H · gap 8 · p 8/16 · Body S Emphasized
 *   group   py 8 · a 16-tall header of px 16 · gap 8: the group's code on
 *           Body XS / Text/Tertiary, then a Divider filling the rest
 *
 * **The menu surface was missing from the first pass** — the component draws a
 * radius, a stroke and the library's `Overlay` elevation, and this shipped with
 * none of the three, so a floating menu had no edge against the page under it.
 * Re-measured on `3034:99818` in `UI - Notification Log`, where the same node id
 * carries `cornerRadius 8` (Radius 2), one bound stroke on Border/Primary/Default
 * and the remote effect style `Overlay` — `--shadow-overlay` here, part for part.
 *
 * **`Status option` (`3034:99458`, 224 × 125) is this component again**, with no
 * search and no group labels: an option, a bare rule, two more options. Two things
 * it shows that the source node does not —
 *   · a group with **no label** draws its Divider alone, inset px 16, on a row of
 *     1, and the group loses its py 8 (8 + 36 + 1 + 36 + 36 + 8 = the file's 125)
 *   · it carries the radius and the stroke but **no elevation**, which is why
 *     `elevated` is a prop rather than baked in. Both are drawn; neither is
 *     normalised into the other.
 *
 * **The option is 36 here and 40 in the Multi Select Panel** — the checkbox is
 * what makes the difference, and both are drawn, so neither is normalised.
 *
 * The group header carries a `colours/background/fill-secondary-disabled` fill
 * from a non-Core library, but **that fill is switched off in the file** — it is
 * dead metadata on a hidden layer, not something drawn, so nothing is remapped
 * and nothing is reproduced. */

export type SelectListOption = {
  value: string
  label: React.ReactNode
  selected?: boolean
  disabled?: boolean
}

export type SelectListGroup = {
  /**
   * The short code the file puts on the rule — OPO, BKG, SER. Without one the
   * group is separated by a plain Divider inset 16, which is how `Status
   * option` (`3034:99458`, 224 × 125) splits its three rows.
   */
  label?: React.ReactNode
  options: SelectListOption[]
}

export type SelectListProps = {
  /** The library's Search Field. Omit and the list starts at the first option. */
  search?: React.ReactNode
  /** Options above the first group — the file's "All group" row. */
  options?: SelectListOption[]
  groups?: SelectListGroup[]
  onSelect?: (value: string) => void
  /**
   * 415 in the file — the width of the one instance it was measured on. Pass
   * `'fill'` where the menu belongs to a field instead of standing alone: a
   * form's Select is 395 or 604 wide and a fixed 415 hangs 20 past its own box.
   * The number stays the default because that is what was drawn; `'fill'` is an
   * API affordance, not a second measurement.
   */
  width?: number | 'fill'
  /** The `Overlay` elevation. Drawn on the source node, not on `Status option`. */
  elevated?: boolean
  className?: string
}

function Option({
  option,
  onSelect,
}: {
  option: SelectListOption
  onSelect?: (value: string) => void
}) {
  return (
    <button
      type="button"
      disabled={option.disabled}
      onClick={() => onSelect?.(option.value)}
      className={cn(
        'webds-pattern-option',
        option.selected
          ? 'webds-pattern-option--s1'
          : 'webds-pattern-option--s2',
        option.disabled && 'webds-pattern-option--s3',
      )}
    >
      {option.label}
    </button>
  )
}

export function SelectList({
  search,
  options = [],
  groups = [],
  onSelect,
  width = 415,
  elevated = true,
  className,
}: SelectListProps) {
  return (
    <div
      style={width === 'fill' ? undefined : { width }}
      className={cn(
        width === 'fill' && 'webds-pattern-select-list--s1',
        /* `stroke-inside`, not a border: the file's stroke does not take part in
           auto-layout sizing, and a border would put the 415 at 417. */
        'webds-pattern-select-list',
        elevated && 'webds-pattern-select-list--s2',
        className,
      )}
    >
      {search && <div className="webds-pattern-select-list-2">{search}</div>}
      {options.map((o) => (
        <Option key={o.value} option={o} onSelect={onSelect} />
      ))}
      {groups.map((g, i) => (
        <div
          key={i}
          className={cn('webds-pattern-select-list-3', g.label ? 'webds-pattern-select-list-3--s1' : undefined)}
        >
          {g.label ? (
            <div className="webds-pattern-select-list-4">
              <span className="webds-pattern-select-list-5">
                {g.label}
              </span>
              <Divider className="webds-pattern-select-list-6" />
            </div>
          ) : (
            /* No code on the rule: a plain Divider inset 16, and none above the
               first group — the file only draws one *between* runs. */
            (i > 0 || options.length > 0) && (
              <div className="webds-pattern-select-list-7">
                <Divider />
              </div>
            )
          )}
          {g.options.map((o) => (
            <Option key={o.value} option={o} onSelect={onSelect} />
          ))}
        </div>
      ))}
    </div>
  )
}
