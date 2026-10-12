import { cn } from '@/lib/utils'
import { GhostButton } from './ghost-button'

/* BBL Stepper — `public/r/specs/stepper.json`, set "Stepper", 4 variants:
 * `Type` (Dot / Text) × `has Nav Buttons` (Yes / No).
 *
 * The small one: where you are in a flow, not what the steps are. Two ways of
 * saying it — five dots, or "1 / 5" — and optionally Back / Next either side.
 *
 * **The nav buttons change what the root IS.** With them the root is a 300-wide
 * row, space-between, 24 tall, holding [Back][steps][Next] at gap 0. Without
 * them the root is the steps row itself: 76 × 12 at gap 8 for dots, 25 × 22 at
 * gap 0 for the counter. So this is not one shell with optional children — the
 * shell is the shell of whichever variant was drawn, and the component follows.
 *
 * Dots: the current step is a filled 12 (`Ellipse 1388`, Icon/Highlight/Default)
 * and the rest are 8s stroked with Icon/Disabled/Subtle/Default and no fill —
 * so the current dot is bigger AND filled, which is why the row is 12 tall.
 *
 * Back is `Text/Disabled/Default` and Next is `Text/Highlight/Default` in the
 * drawn variant: the first step, where Back has nowhere to go. Both are Label XL
 * Medium, and both carry a chevron that is switched off, so nothing is drawn for
 * it here.
 *
 * BBL's note on this page, quoted: "For a good user experience, a form should
 * have between 3-5 steps." — the count is the caller's, and 5 is what was drawn. */

export type StepperType = 'dot' | 'text'

export type StepperProps = {
  type?: StepperType
  /** How many steps, and which one is current (1-based). */
  total?: number
  current?: number
  /** `has Nav Buttons`. */
  nav?: boolean
  backLabel?: React.ReactNode
  nextLabel?: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  className?: string
}

function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div className="webds-dots">
      {Array.from({ length: total }, (_, i) =>
        i === current - 1 ? (
          <span
            key={i}
            data-part="Ellipse 1388"
            className="webds-dots-2"
          />
        ) : (
          <span
            key={i}
            data-part="Ellipse 1389"
            className="webds-dots-3"
          />
        ),
      )}
    </div>
  )
}

/** "1 / 5" — three runs, each named in Figma after the character it holds. */
function Counter({ total, current }: { total: number; current: number }) {
  const type = 'webds-stepper-type'
  return (
    <div className="webds-counter">
      <span data-part={String(current)} className={type}>
        {current}
      </span>
      <span data-part="/" className={type}>
        /
      </span>
      <span data-part={String(total)} className={type}>
        {total}
      </span>
    </div>
  )
}

export function Stepper({
  type = 'dot',
  total = 5,
  current = 1,
  nav = false,
  backLabel = 'Back',
  nextLabel = 'Next',
  onBack,
  onNext,
  className,
}: StepperProps) {
  const steps = type === 'dot' ? <Dots total={total} current={current} /> : <Counter total={total} current={current} />

  if (!nav) {
    /* The steps row IS the component — see the note above. */
    return <div className={className}>{steps}</div>
  }

  /* Back and Next are Ghost Buttons at Padding=None — 24 tall around a 22 label,
     which is where the row's 24 comes from. Back is drawn disabled (this is step
     one, so it has nowhere to go) and Next takes the Highlight appearance; both
     are exactly what those Ghost Button rows already resolve to, so they are
     composed rather than restyled. */
  return (
    <div className={cn('webds-stepper', className)}>
      <GhostButton padding="none" disabled onClick={onBack}>
        <span data-part="Label">{backLabel}</span>
      </GhostButton>
      {steps}
      <GhostButton padding="none" appearance="highlight" onClick={onNext}>
        <span data-part="Label">{nextLabel}</span>
      </GhostButton>
    </div>
  )
}
