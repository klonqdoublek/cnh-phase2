import { cn } from '@/lib/utils'
import { GhostButton } from './ghost-button'

/* BBL Alert — `public/r/specs/alert.json`, set "Alert", 5 variants.
 *
 * One axis, Appearance, and five booleans BBL drew: has Icon, has Description,
 * has CTA, has Close Button, plus Title/Description text props.
 *
 *   root      horizontal, padding 16/24, gap 12, radius 12 (Radius 3)
 *   ├ Content   fills — [icon] + a text column, gap 12
 *   │   └ Text  vertical, gap 2: Title (Label XL Medium), Description
 *   │           (Body S), CTA (Ghost Button, Highlight, Padding=None)
 *   └ Trailing  hugs, top-aligned — the 24×24 close button
 *
 * 16 + (22 + 2 + 20 + 2 + 24) + 16 = 102, which is what the spec measures.
 *
 * **Neutral's stroke is an outline, not a border.** Figma's stroke does not take
 * part in auto-layout sizing: Neutral is 102 tall with a 1px INSIDE stroke and
 * the other four are 102 without one. A CSS border does take part, so on a frame
 * that hugs its content it would render 104. `outline` with `outline-offset:
 * -1px` paints the same 1px inside the same box and leaves the size alone.
 *
 * **The left icon is a slot.** BBL names one per appearance — Check for
 * Positive, Illustration/Caution for Caution, CloseCircle for Negative — but
 * Brand and Neutral hold a bare instance-swap placeholder, and `has Icon` is
 * switched off in all five drawn variants. So nothing is rendered unless a
 * caller passes an icon, and the named ones are recorded here rather than
 * hard-coded into a component the file never shows with an icon.
 *
 * The close button's fill is `Surface/Primary/Subtle/Default`, which resolves to
 * `rgb(0 0 0 / 0%)` — transparent. It is declared because the file declares it. */

export type AlertAppearance = 'neutral' | 'brand' | 'positive' | 'caution' | 'negative'

type Cell = {
  surface: string
  /** Only Neutral carries one. */
  stroke?: string
  text: string
  icon: string
  /** What the file puts in the icon slot for this appearance, where it names one. */
  namedIcon?: string
}

const ALERT: Record<AlertAppearance, Cell> = {
  neutral: {
    surface: 'webds-alert--neutral-surface',
    stroke: 'webds-alert--neutral-stroke',
    text: 'webds-alert--neutral-text',
    icon: 'webds-alert--neutral-icon',
  },
  brand: {
    surface: 'webds-alert--brand-surface',
    text: 'webds-alert--brand-text',
    icon: 'webds-alert--brand-icon',
  },
  positive: {
    surface: 'webds-alert--positive-surface',
    text: 'webds-alert--positive-text',
    icon: 'webds-alert--positive-icon',
    namedIcon: 'Icon/24px/General Icon/Check',
  },
  caution: {
    surface: 'webds-alert--caution-surface',
    text: 'webds-alert--caution-text',
    icon: 'webds-alert--caution-icon',
    namedIcon: 'Icon/24px/Illustration/Caution',
  },
  negative: {
    surface: 'webds-alert--negative-surface',
    text: 'webds-alert--negative-text',
    icon: 'webds-alert--negative-icon',
    namedIcon: 'Icon/24px/General Icon/CloseCircle',
  },
}

/** Which icon the Figma file names in the slot, per appearance. Exported so a
 *  caller can honour it without this component inventing artwork. */
export const ALERT_NAMED_ICON = Object.fromEntries(
  Object.entries(ALERT).map(([k, v]) => [k, v.namedIcon ?? null]),
) as Record<AlertAppearance, string | null>

/* 24px Close and 16px Chevron-Right, verbatim from public/webds-icons. The
   shipped files bake a colour in; here it comes from the appearance. */
const CLOSE_PATH =
  'M11.9949 10.783L4.63961 3.42773L3.42773 4.63961L10.783 11.9949L3.42773 19.3501L4.63961 20.562L11.9949 13.2067L19.3501 20.562L20.562 19.3501L13.2067 11.9949L20.562 4.63961L19.3501 3.42773L11.9949 10.783Z'
const CHEVRON_RIGHT_PATH =
  'M11.9149 8.49503L5.61495 14.795L4.625 13.8051L10.43 8.00005L4.625 2.19503L5.61495 1.20508L11.9149 7.50508L12.4099 8.00005L11.9149 8.49503Z'

export type AlertProps = {
  appearance?: AlertAppearance
  title?: React.ReactNode
  description?: React.ReactNode
  /** `has CTA` — rendered as the Ghost Button the file uses, with its chevron. */
  cta?: React.ReactNode
  onCtaClick?: () => void
  /** `has Icon`. See the note above: the slot is the caller's. */
  icon?: React.ReactNode
  /** `has Close Button`. */
  onClose?: () => void
  closeLabel?: string
  className?: string
}

export function Alert({
  appearance = 'neutral',
  title,
  description,
  cta,
  onCtaClick,
  icon,
  onClose,
  closeLabel = 'Close',
  className,
}: AlertProps) {
  const a = ALERT[appearance]
  return (
    <div
      role="status"
      className={cn(
        'webds-alert',
        a.surface,
        a.stroke,
        className,
      )}
    >
      <div className="webds-alert-2">
        {/* `flex`, not a bare block. This slot had never been filled — every drawn
            variant switches `has Icon` off — and an inline-block glyph inside a
            block wrapper sits on a text baseline, so the descender added 6 to the
            row: the first consumer to pass an icon measured the alert at 62 where
            its file draws 56. */}
        {icon != null && <div className="webds-alert-3">{icon}</div>}
        <div className="webds-alert-4">
          {title != null && (
            <span data-part="Title" className={cn('webds-alert-5', a.text)}>
              {title}
            </span>
          )}
          {description != null && (
            <span data-part="Description" className={cn('webds-alert-6', a.text)}>
              {description}
            </span>
          )}
          {/* The CTA hugs its label. The runs above it fill the column, so
              without `self-start` the button stretches to their width and
              centres its label — which nothing in the spec compares, and which
              the drawing does not do. */}
          {cta != null && (
            <GhostButton
              appearance="highlight"
              padding="none"
              onClick={onCtaClick}
              className="webds-alert-7"
            >
              <span data-part="Label">{cta}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d={CHEVRON_RIGHT_PATH}
                  fillRule="evenodd"
                  clipRule="evenodd"
                  className="webds-alert-8"
                />
              </svg>
            </GhostButton>
          )}
        </div>
      </div>
      {onClose != null && (
        <div className="webds-alert-9">
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            data-part="Icon Button"
            className="webds-alert-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d={CLOSE_PATH} className={a.icon} />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
