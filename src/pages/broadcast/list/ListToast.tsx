import { useEffect } from 'react'
import { Icon } from '@/bbl/icon'
import { Toast } from '@/bbl/toast'

/** The list's toast after Create returns: webds `Toast`, Positive, with the
 *  Check mark, fixed 16 from the top and right at the original's 620. It
 *  closes after 3 s unless `hold` (a preset route keeps it open). */
export function ListToast({
  open,
  title,
  description,
  hold,
  onClose,
}: {
  open: boolean
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
        appearance="positive"
        icon={<Icon slug="check" size={24} color="var(--color-icon-positive-strong-default)" />}
        title={title}
        description={description}
        onClose={onClose}
      />
    </div>
  )
}
