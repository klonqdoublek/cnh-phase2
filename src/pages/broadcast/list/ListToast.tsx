import { useEffect } from 'react'
import { Icon } from '@/bbl/icon'
import { Toast } from '@/bbl/toast'

/* Positive with the Check mark; Negative with CloseCircle, as Notification
   management's list toast draws a failure. */
const ICON = {
  positive: { slug: 'check', color: 'var(--color-icon-positive-strong-default)' },
  negative: { slug: 'close-circle', color: 'var(--color-icon-negative-default)' },
}

/** The list's toast after Create returns: webds `Toast`, Positive unless told
 *  otherwise, fixed 16 from the top and right at the original's 620. It
 *  closes after 3 s unless `hold` (a preset route keeps it open). */
export function ListToast({
  open,
  appearance = 'positive',
  title,
  description,
  hold,
  onClose,
}: {
  open: boolean
  appearance?: keyof typeof ICON
  title: React.ReactNode
  description: React.ReactNode
  hold: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (!open || hold) return
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [open, hold, onClose])

  if (!open) return null
  return (
    <div className="fixed top-[var(--space-4)] right-[var(--space-4)] z-50 w-[620px] shadow-[var(--shadow-raised)]">
      <Toast
        appearance={appearance}
        icon={<Icon slug={ICON[appearance].slug} size={24} color={ICON[appearance].color} />}
        title={title}
        description={description}
        onClose={onClose}
      />
    </div>
  )
}
