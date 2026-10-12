import { cn } from '@/lib/utils'
import { Divider } from '@/bbl/divider'
import { ListContent } from '@/bbl/building-block-list-content'

/* **Product Shell** — the SECOND console frame on BBL web, and the first one
 * that is actually BBL.
 *
 * `console-shell` transcribes the CSP Portal: an 88 dark icon rail in Inter over
 * a 321 side nav, in the Cisco console's own colours. That is correct for that
 * product and wrong for every product that is not it — and the first form
 * console to arrive drew none of it: one 320 white panel, BBL type, BBL tokens,
 * no rail, no top bar. It could not use `console-shell` and had to author its
 * own, which is the signal that the library was missing a shape rather than that
 * the consumer was being difficult.
 *
 * **Choosing between the two:** if the chrome is Layer 1 + Layer 2 of the CSP
 * console — the rail, the Finesse bar, the RM profile block — that is
 * `console-shell` and it is not designed by the squad. If the chrome is the
 * product's own sidebar in BBL's type and tokens, it is this.
 *
 * Measured on `JjvzdUwg5LlKHDQvo2fny0` §1:127401 › Sidebar (320 × 998):
 *
 *   page          Surface/Secondary/Default · sidebar 320 + main 1600 at 1920
 *   panel         320 · Surface/Primary/Default · right rule Border/Primary
 *   top           80 · p 24/16/16/16 · the product mark, 161 × 40 there
 *   nav           p 16 · gap 6
 *     group label 288 × 24 · pb 8 · Body XS Emphasized · Text/Tertiary
 *     row         288 × 38 · p 8 · radius 8 · title-only Label XL 16/22
 *   foot          Divider + a 67 row holding a 58 surface
 *
 * **The rows are `ListContent`, not `ListItem`.** The shipped List Item fixes
 * its surface at 58 and this row is 38 — a title-only row the library has no
 * variant for. That is a real gap in the library, recorded rather than papered
 * over: when List Item grows the variant, these rows become it.
 *
 * **The right rule is a pseudo-element, not an inset shadow.** The footer row is
 * the full 320 and paints its own white background, which covered an inset
 * shadow exactly along that row and left the line stopping short of the bottom.
 *
 * Consumer-measured. */

export type ProductNavItem = {
  id: string
  label: string
}

export type ProductNavGroup = {
  /** The small caps-ish rule above a run of rows. Omit for an unlabelled run. */
  label?: React.ReactNode
  items: ProductNavItem[]
}

export type ProductShellProps = {
  /** The product mark in the 80 top band — 161 × 40 in the measured file. */
  logo?: React.ReactNode
  nav?: ProductNavGroup[]
  activeId?: string
  onSelect?: (id: string) => void
  /**
   * The 58-tall row at the foot, inside its own 67 box under a Divider. The
   * measured file puts a profile row here; the arrangement is the claim, the
   * contents are the product's.
   */
  footer?: React.ReactNode
  /** Anything anchored to the sidebar — a popover opening off the footer row. */
  overlay?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function ProductShell({
  logo,
  nav = [],
  activeId,
  onSelect,
  footer,
  overlay,
  children,
  className,
}: ProductShellProps) {
  return (
    <div
      className={cn(
        'webds-pattern-product-shell',
        className,
      )}
    >
      <aside
        data-part="Sidebar"
        className={cn(
          'webds-pattern-product-shell-2',
        )}
      >
        <div className="webds-pattern-product-shell-3">
          {logo}
        </div>

        <nav className="webds-pattern-product-shell-4">
          {nav.map((group, gi) => (
            <div key={gi} className="webds-pattern-product-shell-5">
              {group.label != null && (
                <div className="webds-pattern-product-shell-6">
                  <span className="webds-pattern-product-shell-7">
                    {group.label}
                  </span>
                </div>
              )}
              {group.items.map((item) => {
                const selected = item.id === activeId
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect?.(item.id)}
                    className={cn(
                      'webds-pattern-product-shell-8',
                      selected
                        ? 'webds-pattern-product-shell-8--s1'
                        : 'webds-pattern-product-shell-8--s2',
                    )}
                  >
                    <ListContent
                      type="text"
                      size="m"
                      state={selected ? 'selected' : 'default'}
                      title={item.label}
                      description={null}
                    />
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {footer != null && (
          <div className="webds-pattern-product-shell-9">
            <Divider />
            <div className="webds-pattern-product-shell-10">{footer}</div>
          </div>
        )}
      </aside>
      {overlay}
      <main className="webds-pattern-product-shell-11">{children}</main>
    </div>
  )
}
