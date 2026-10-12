import { cn } from '@/lib/utils'

/* BBL Progress Stepper — `public/r/specs/stepper.json`, set "Progress Stepper",
 * 8 variants: `Alignment` (Horizontal / Vertical) × `Total Steps` (2–5).
 *
 * The named-steps one. Each step is
 *
 *   [leading connector] [ icon 24 · title ] [trailing connector]
 *
 * where the first step's leading and the last step's trailing are **Spacers** —
 * frames the same size holding nothing. That is why a five-step row has eight
 * rectangles and not nine: the connector between two steps is two halves, one
 * belonging to each.
 *
 * Sizes come from the drawing: a horizontal step block is 136 (56 + 24 + 56) and
 * a vertical one is 88 tall (32 + 24 + 32), the connector filling whatever the
 * step leaves. Both are pinned here rather than derived, because BBL's own note
 * says "Stepper can set width or height to fill parent container" — the numbers
 * are what a row of 136s produces, and the verification harness renders each
 * variant at the width its frame had.
 *
 * The connector is 2px thick and sits on the icon's centre line: 11 of padding
 * before it against a 24 icon.
 *
 * Every drawn step is in the same resting state — `Surface/Tertiary/Default`
 * icon, `Text/Tertiary/Default` value, `Text/Primary/Default` title. The states
 * (current, done, error…) live in `.Building Block / Progress Stepper /
 * Progress Stepper Item`, an internal set of 18 variants that the published
 * component never shows, so nothing here is verified against them. */

export type ProgressStepperAlignment = 'horizontal' | 'vertical'

export type ProgressStep = {
  /** The `Value` inside the circle — "#" is what BBL drew. */
  value?: React.ReactNode
  title?: React.ReactNode
  /** Drawn but switched off in every published variant. */
  description?: React.ReactNode
}

export type ProgressStepperProps = {
  steps: ProgressStep[]
  alignment?: ProgressStepperAlignment
  className?: string
}

/** 56 × 2 lying down, 2 × 32 standing up; `Spacer` is the same frame with no
 *  rectangle in it. */
function Connector({ alignment, filled }: { alignment: ProgressStepperAlignment; filled: boolean }) {
  const horizontal = alignment === 'horizontal'
  return (
    <div
      className={cn(
        'webds-connector',
        horizontal ? 'webds-connector--s1' : 'webds-connector--s2',
      )}
    >
      {filled && (
        <div
          data-part="Rectangle"
          className={cn(
            'webds-connector-2',
            horizontal ? 'webds-connector-2--s1' : 'webds-connector-2--s2',
          )}
        />
      )}
    </div>
  )
}

export function ProgressStepper({ steps, alignment = 'horizontal', className }: ProgressStepperProps) {
  const horizontal = alignment === 'horizontal'
  return (
    <div className={cn('webds-progress-stepper', horizontal ? 'webds-progress-stepper--s1' : 'webds-progress-stepper--s2', className)}>
      {steps.map((step, i) => (
        <div
          key={i}
          className={cn(
            'webds-progress-stepper-2',
            horizontal ? 'webds-progress-stepper-2--s1' : 'webds-progress-stepper-2--s2',
          )}
        >
          <Connector alignment={alignment} filled={i > 0} />
          <div
            className={cn(
              'webds-progress-stepper-3',
              horizontal ? 'webds-progress-stepper-3--s1' : 'webds-progress-stepper-3--s2',
            )}
          >
            <div
              data-part="Step Icon"
              className="webds-progress-stepper-4"
            >
              <span
                data-part="Value"
                className="webds-progress-stepper-5"
              >
                {step.value ?? '#'}
              </span>
            </div>
            <div className={cn('webds-progress-stepper-6', horizontal && 'webds-progress-stepper-6--s1')}>
              <span
                data-part="Title"
                className="webds-progress-stepper-7"
              >
                {step.title}
              </span>
              {step.description != null && (
                <span
                  data-part="Description"
                  className="webds-progress-stepper-8"
                >
                  {step.description}
                </span>
              )}
            </div>
          </div>
          <Connector alignment={alignment} filled={i < steps.length - 1} />
        </div>
      ))}
    </div>
  )
}
