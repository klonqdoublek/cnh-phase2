import { cn } from '@/lib/utils'
import { ToggleSwitch } from '@/bbl/toggle-switch'

/* **Form Section Card** — one titled block of a long form, optionally switched
 * on and off as a whole.
 *
 * A console form is not one list of fields; it is a stack of cards, and the
 * cards are not all the same kind. Some are always present. Some are a CHANNEL:
 * a Toggle Switch sits in the title row, and turning it off does not remove the
 * fields — it disables them and **keeps what was typed**, so a user who switches
 * a channel back on has not lost their work. Every source that draws this draws
 * it that way, and every consumer that rebuilds it by hand gets the keeping-the
 * -values part wrong first.
 *
 * The card:
 *
 *   root    V · p 24 · Radius 2 · Surface/Primary/Default · gap 32
 *   title   H · gap 16 · [Toggle Switch 50×30] + Heading XS Emphasized
 *   rows    V · gap 24 — a source may draw 16, so it is a prop, not a constant
 *   row     H · gap 24 · items-start
 *
 * **`invalid` is a card-level error, and it is a real state, not decoration.**
 * A rule like "turn on at least one channel" has no field to attach a message
 * to. Its sources answer that by marking the CARDS: a 1px stroke on every card
 * the rule covers, with the message carried by an `Alert` above them. The stroke
 * is drawn INSIDE, so it is an `outline` with a negative offset here — a border
 * would grow the card by 2 and move everything under it.
 *
 * Consumer-measured. */

export type FormSectionCardProps = {
  title: React.ReactNode
  /** Present makes this a channel card: the switch sits before the title. */
  toggle?: { on: boolean; onToggle: (on: boolean) => void }
  /** The card-level error stroke. See the note above. */
  invalid?: boolean
  /** Space between rows, in `--space-*` steps. 6 (24) unless a source draws 4. */
  rowGap?: 4 | 6
  children?: React.ReactNode
  className?: string
}

const ROW_GAP: Record<number, string> = {
  4: 'gap-[var(--space-4)]',
  6: 'gap-[var(--space-6)]',
}

export function FormSectionCard({
  title,
  toggle,
  invalid,
  rowGap = 6,
  children,
  className,
}: FormSectionCardProps) {
  return (
    <div
      data-invalid={invalid ? 'true' : undefined}
      className={cn(
        'webds-pattern-form-section-card',
        invalid &&
          'webds-pattern-form-section-card--s1',
        className,
      )}
    >
      <div className="webds-pattern-form-section-card-2">
        {toggle && (
          <ToggleSwitch
            toggled={toggle.on}
            onClick={() => toggle.onToggle(!toggle.on)}
            aria-label={typeof title === 'string' ? title : undefined}
          />
        )}
        <span className="webds-pattern-form-section-card-3">
          {title}
        </span>
      </div>
      <div className={cn('webds-pattern-form-section-card-4', ROW_GAP[rowGap])}>{children}</div>
    </div>
  )
}

/** One row of fields. `items-start` so a field with a two-line error does not
 *  drag its neighbours down with it. */
export function FormRow({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('webds-pattern-form-row', className)}>{children}</div>
  )
}
