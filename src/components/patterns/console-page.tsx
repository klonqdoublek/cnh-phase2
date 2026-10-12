import { cn } from '@/lib/utils'

/* **Console Page** — the frame a console screen sits in: a title band that does
 * not scroll, a body that does, and an optional action bar pinned to the bottom.
 *
 * Shipped as `form-page` for an hour on 2026-08-30 and renamed the moment the
 * second page of the same product used it. The long form is what it was
 * measured on; it is not what it is for.
 *
 * A form of any length has the same problem, and it is the reason this is a
 * pattern rather than three divs on each page: the actions must stay reachable
 * while the fields scroll past them. Every consumer that writes it by hand
 * writes the same three bands, and — because a template may arrange but may not
 * draw — a page that draws them cannot be published as a template at all. So
 * the bands are here, and the page arranges them.
 *
 * Measured on `JjvzdUwg5LlKHDQvo2fny0` §1:171893 (1920 × 2656):
 *
 *   header   82 · px 32 · Surface/Primary/Default · inset rule at the foot
 *            back mark 24, title at x 72
 *   body     scrolls · px 80 · py 32 · gap 32 · a 1280 column centred in 1920
 *   footer   76 · py 16 · inset rule at the head · the 1280 column again,
 *            actions right-aligned at gap 24
 *
 * **Not `page-header`.** That pattern measures an 88 band at px 24 whose actions
 * are Ghost Buttons — the console's *list* header. This is a form's own bar: 82,
 * px 32, a back affordance instead of actions. Two different elements on two
 * different pages, so neither is bent into the other.
 *
 * **The step heading belongs here too** (`FormStep`), for the same reason the
 * bands do: it is type on a bare element, and type on a bare element inside a
 * copied template is a decision no component owns. Its one structural claim is
 * that a step's title and its alert share a frame at gap 16, while that frame
 * sits at gap 24 from the cards — so a step that grows an alert does not shove
 * its cards down by the alert's full height plus a second gap.
 *
 * Consumer-measured. */

export type ConsolePageProps = {
  /** The back affordance the source draws at 24, left of the title. */
  back?: React.ReactNode
  title?: React.ReactNode
  /** Right of the title in the band, where a source draws one. */
  headerActions?: React.ReactNode
  /**
   * The content column. 1280 on the form, and `'fill'` where the body runs the
   * whole width of the frame — the same product's list page does, which is why
   * this is not a number with a default and nothing else.
   */
  columnWidth?: number | 'fill'
  /** Right-aligned in the footer at gap 24. Omit and no footer is drawn. */
  actions?: React.ReactNode
  /** Set on the scroller so a consumer can scroll to its own first error. */
  bodyRef?: React.Ref<HTMLDivElement>
  children?: React.ReactNode
  className?: string
}

export function ConsolePage({
  back,
  title,
  headerActions,
  columnWidth = 1280,
  actions,
  bodyRef,
  children,
  className,
}: ConsolePageProps) {
  return (
    <div className={cn('webds-pattern-console-page', className)}>
      <div
        data-part="Header"
        className="webds-pattern-console-page-2"
      >
        {back}
        <span className="webds-pattern-console-page-3">
          {title}
        </span>
        <div className="webds-pattern-console-page-4" />
        {headerActions}
      </div>

      <div ref={bodyRef} data-part="Body" className="webds-pattern-console-page-5">
        <div className="webds-pattern-console-page-6">
          <div
            style={columnWidth === 'fill' ? undefined : { width: columnWidth }}
            className={cn(
              'webds-pattern-console-page-7',
              columnWidth === 'fill' && 'webds-pattern-console-page-7--s1',
            )}
          >
            {children}
          </div>
        </div>
      </div>

      {actions != null && (
        <div
          data-part="Footer"
          className="webds-pattern-console-page-8"
        >
          <div
            style={columnWidth === 'fill' ? undefined : { width: columnWidth }}
            className={cn(
              'webds-pattern-console-page-9',
              columnWidth === 'fill' && 'webds-pattern-console-page-9--s1',
            )}
          >
            {actions}
          </div>
        </div>
      )}
    </div>
  )
}

/** One numbered step of the form: its heading, an optional alert that belongs to
 *  the step rather than to any field, then the cards. Title and alert share a
 *  frame at gap 16; that frame sits at gap 24 from the cards. */
export function FormStep({
  title,
  alert,
  children,
  className,
}: {
  title: React.ReactNode
  alert?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('webds-pattern-form-step', className)}>
      <div className="webds-pattern-form-step-2">
        <h2 className="webds-pattern-form-step-3">
          {title}
        </h2>
        {alert}
      </div>
      {children}
    </div>
  )
}
