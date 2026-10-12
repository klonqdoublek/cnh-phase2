import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/bbl/checkbox'
import { Divider } from '@/bbl/divider'
import { ScrollBar } from '@/bbl/scroll-bar'
import { EmptyState } from './empty-state'

/* Multi Select Panel — measured on `7036:44521` ("Multi Selection Component",
 * 13 variants) in the Centralize Log file.
 *
 * The filter bar's channel/activity picker: a search field, the chips for what
 * is already chosen, a scrolling list of checkboxes, and a footer that selects
 * or clears everything.
 *
 * Measured shell, at 399 wide:
 *
 *   root     V · pt 8 · Surface/Primary/Default · Radius 2 · a 1px inside stroke
 *            on Border/Primary/Default · the library's `Overlay` elevation
 *   search   p 8/16 · Text Field 367 x 56 → row 72
 *   chips    p 8/16 → row 48
 *   list     p 8 top and bottom · list 387 wide beside a Thin vertical Scroll
 *            Bar of 12 · the file draws 520 of list
 *   option   40 tall · H · gap 8 · p 8/16 · Checkbox 24 + label
 *   footer   Divider, then 56 · p 16 · a Ghost Button at each end
 *
 * **The 13 variants are three states and ten lengths.** Twelve of them draw the
 * list at different chip counts and list heights (689 → 857); `Variant8` is
 * searching and `Variant9` is no-results, and both replace only the list region.
 * So this ships `state`, not thirteen variants — and the two states are the same
 * Empty State the tables use, with no title.
 *
 * **The surface was missing from the first pass.** A floating picker shipped with
 * no radius, no stroke and no elevation — it had no edge against the page under
 * it. All 13 variants of the set draw `cornerRadius 8` (Radius 2), one bound
 * stroke on Border/Primary/Default and the remote effect style `Overlay`, and so
 * do both instances of the 278 panel in `UI - Notification Log` (`5008:42214`).
 * `--shadow-overlay` is that style part for part — 0/17/20/-5 at 10% over
 * 15/15/10/-5 at 4% — so nothing here is approximated.
 *
 * **The option label's size is not tokenised in the file.** It is drawn at
 * 14/20 Medium on `Text/Primary/Default` — the colour is bound, the size is not.
 * 14/20 Medium is Body S Emphasized, which is what this uses; if the library
 * later binds something else there, this is the line to change. */

export type MultiSelectOption = {
  value: string
  label: React.ReactNode
  selected?: boolean
  disabled?: boolean
}

export type MultiSelectState = 'list' | 'searching' | 'no-results'

export type MultiSelectPanelProps = {
  /** The library's Text Field. Omit and the search row is not drawn. */
  search?: React.ReactNode
  /** Removable Chips for the current selection. Omit and the row is not drawn. */
  chips?: React.ReactNode
  options?: MultiSelectOption[]
  onToggle?: (value: string) => void
  state?: MultiSelectState
  /**
   * The list viewport. The file draws 520 — but **it is a maximum, not a
   * height**: see the note above the component about why a fixed one puts the
   * footer off-screen.
   */
  listHeight?: number
  /** The two Ghost Buttons, laid out one at each end. */
  footer?: React.ReactNode
  /**
   * 399 in the full panel. The same panel is drawn again at 278 without the
   * search row or the chips — `Activity Option1 — Multi Selection`
   * (`5008:42214`), which is this component with those two omitted.
   */
  width?: number | string
  className?: string
}

export function MultiSelectPanel({
  search,
  chips,
  options = [],
  onToggle,
  state = 'list',
  listHeight = 520,
  footer,
  width = 399,
  className,
}: MultiSelectPanelProps) {
  const list = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ size: 100, offset: 0 })
  const [overflows, setOverflows] = useState(false)

  /* The file's Scroll Bar is decoration at 520 — nothing ever scrolls past it.
     Once the list can be shorter than its content, a bar that does not move is
     worse than none: it says the list is complete. */
  const track = () => {
    const el = list.current
    if (!el) return
    /* And a bar beside a list that FITS says the same false thing the other way
       round: a second file's panel (`JjvzdUwg5LlKHDQvo2fny0` · 1:72242) draws
       five 40-tall options in 291 with no bar at all, and its rows are the full
       291. Hiding it only widens the list, which can never create overflow, so
       this cannot oscillate. */
    setOverflows(el.scrollHeight > el.clientHeight)
    setThumb({
      size: Math.min(100, (el.clientHeight / el.scrollHeight) * 100),
      offset: (el.scrollTop / el.scrollHeight) * 100,
    })
  }
  useLayoutEffect(track, [options, state, chips])

  return (
    <div
      style={{ width }}
      className={cn(
        /* `min-h-0` and the column below it are what let a capped panel give the
           squeeze to the list instead of clipping it. */
        'webds-pattern-multi-select-panel',
        className,
      )}
    >
      <div className="webds-pattern-multi-select-panel-2">
        {search && (
          <div className="webds-pattern-multi-select-panel-3">{search}</div>
        )}
        {chips && (
          <div className="webds-pattern-multi-select-panel-4">
            {chips}
          </div>
        )}

        {state === 'list' ? (
          /* `items-stretch`, not the default of a hugging row: the list only
             scrolls if it is as tall as the row it sits in. Left to its own
             height it keeps the full 520 and is simply clipped — which is how
             the last options and the footer became unreachable on a short
             window.

             `py-8` separates the list from the SEARCH and CHIPS rows above it —
             the 399 variant this was measured on has both. The 291 variant has
             neither, and there the panel's own `pt-8` is the whole gap: rows
             start 8 below the top and the divider sits 8 under the last one
             (`JjvzdUwg5LlKHDQvo2fny0` · 1:72242, 291 × 281). Unconditional
             padding put both at 16 and the panel at 297. */
          <div
            className={cn(
              'webds-pattern-multi-select-panel-5',
              (search || chips) && 'webds-pattern-multi-select-panel-5--s1',
            )}
          >
            <div
              ref={list}
              onScroll={track}
              className="webds-pattern-multi-select-panel-6"
              style={{ maxHeight: listHeight }}
            >
              {/* The row is a div, not a button: the library's Checkbox is
                  itself a <button>, and nesting one inside another is invalid
                  HTML. The Checkbox stays the control — focusable and keyboard
                  operable — and a click anywhere on the row reaches it by
                  bubbling. */}
              {options.map((o) => (
                <div
                  key={o.value}
                  onClick={() => !o.disabled && onToggle?.(o.value)}
                  className="webds-pattern-multi-select-panel-7"
                >
                  {/* The row's label sits BESIDE the control, so without this
                      every checkbox in the panel reaches a screen reader
                      unnamed — five per dropdown on the screen that found it.
                      Named from the option, which is the only place the text is
                      known; a consumer copying names in after mount (which is
                      what the first fix did) is a workaround for a component
                      defect. */}
                  <Checkbox
                    selection={o.selected ? 'selected' : 'none'}
                    disabled={o.disabled}
                    aria-label={typeof o.label === 'string' ? o.label : undefined}
                  />
                  <span className="webds-pattern-multi-select-panel-8">
                    {o.label}
                  </span>
                </div>
              ))}
            </div>
            {/* 12 wide, and the file draws it beside the list rather than over
                it — the list is 387 in a 399 panel. Sized and offset from the
                list so it says how much is left; the file's own bar is a fixed
                40 because nothing in a static frame scrolls. */}
            {overflows && (
              <ScrollBar
                appearance="thin"
                orientation="vertical"
                className="webds-pattern-multi-select-panel-9"
                thumbSize={`${thumb.size}%`}
                thumbOffset={`${thumb.offset}%`}
              />
            )}
          </div>
        ) : (
          <div style={{ height: listHeight, maxHeight: '100%' }} className="webds-pattern-multi-select-panel-10">
            <EmptyState variant={state === 'searching' ? 'searching' : 'no-results'}>
              {state === 'searching' ? 'Searching result...' : 'Sorry, Can’t find the result'}
            </EmptyState>
          </div>
        )}
      </div>

      {footer && (
        <div className="webds-pattern-multi-select-panel-11">
          <Divider />
          <div className="webds-pattern-multi-select-panel-12">
            {footer}
          </div>
        </div>
      )}
    </div>
  )
}
