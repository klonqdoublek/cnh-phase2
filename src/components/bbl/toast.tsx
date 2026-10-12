import { cn } from '@/lib/utils'

/* BBL Toast — `public/r/specs/toast.json`, set "Toast", 3 variants.
 *
 * The same shell as Alert — padding 16/24, gap 12, radius 12 (Radius 3), a
 * 2-gap text column of Title (Label XL Medium) over Description (Body S) — with
 * three differences: no CTA, no Neutral or Brand appearance, and the close
 * button and left icon are drawn switched OFF in all three variants.
 *
 * 16 + (22 + 2 + 20) + 16 = 76, which is what the spec measures.
 *
 * BBL's own notes on this page, quoted:
 *
 *   "Max Text Container Width — Max width of text container is 640pt to give the
 *    best reading experience."
 *   "Text Length — If text length exceeds container width, it will wrap to the
 *    next line. No maximum text limit. It will be controlled by designer."
 *
 * So the 640 the frame is drawn at is a maximum, not a fixed width: the toast
 * fills its container up to 640 rather than pinning it. Wrapping is the default
 * for both runs, per the note.
 *
 * Like Alert, the left icon is a slot the caller fills. The file names Check for
 * Positive, Illustration/Caution for Caution and CloseCircle for Negative;
 * `TOAST_NAMED_ICON` records that without this component inventing artwork. */

export type ToastAppearance = 'positive' | 'caution' | 'negative'

const TOAST: Record<ToastAppearance, { surface: string; text: string; icon: string; namedIcon: string }> = {
  positive: {
    surface: 'webds-toast--positive-surface',
    text: 'webds-toast--positive-text',
    icon: 'webds-toast--positive-icon',
    namedIcon: 'Icon/24px/General Icon/Check',
  },
  caution: {
    surface: 'webds-toast--caution-surface',
    text: 'webds-toast--caution-text',
    icon: 'webds-toast--caution-icon',
    namedIcon: 'Icon/24px/Illustration/Caution',
  },
  negative: {
    surface: 'webds-toast--negative-surface',
    text: 'webds-toast--negative-text',
    icon: 'webds-toast--negative-icon',
    namedIcon: 'Icon/24px/General Icon/CloseCircle',
  },
}

export const TOAST_NAMED_ICON = Object.fromEntries(
  Object.entries(TOAST).map(([k, v]) => [k, v.namedIcon]),
) as Record<ToastAppearance, string>

const CLOSE_PATH =
  'M11.9949 10.783L4.63961 3.42773L3.42773 4.63961L10.783 11.9949L3.42773 19.3501L4.63961 20.562L11.9949 13.2067L19.3501 20.562L20.562 19.3501L13.2067 11.9949L20.562 4.63961L19.3501 3.42773L11.9949 10.783Z'

export type ToastProps = {
  appearance?: ToastAppearance
  title?: React.ReactNode
  description?: React.ReactNode
  /** `has Left Icon`. The slot is the caller's — see TOAST_NAMED_ICON. */
  icon?: React.ReactNode
  /** `has Close Button`. */
  onClose?: () => void
  closeLabel?: string
  className?: string
}

export function Toast({
  appearance = 'positive',
  title,
  description,
  icon,
  onClose,
  closeLabel = 'Close',
  className,
}: ToastProps) {
  const t = TOAST[appearance]
  return (
    <div
      role="status"
      className={cn(
        'webds-toast',
        t.surface,
        className,
      )}
    >
      <div className="webds-toast-2">
        {icon != null && <div className="webds-toast-3">{icon}</div>}
        <div className="webds-toast-4">
          {title != null && (
            <span data-part="Title" className={cn('webds-toast-5', t.text)}>
              {title}
            </span>
          )}
          {description != null && (
            <span data-part="Description" className={cn('webds-toast-6', t.text)}>
              {description}
            </span>
          )}
        </div>
      </div>
      {onClose != null && (
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          data-part="Icon Button"
          className="webds-toast-7"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d={CLOSE_PATH} className={t.icon} />
          </svg>
        </button>
      )}
    </div>
  )
}
