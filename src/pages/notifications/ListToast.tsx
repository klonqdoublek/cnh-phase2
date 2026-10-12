import { useEffect, useRef } from 'react'
import { Icon } from '@/bbl/icon'
import { Toast, type ToastAppearance } from '@/bbl/toast'

const ICON: Record<'positive' | 'negative', { slug: string; color: string }> = {
  positive: { slug: 'check', color: 'var(--color-icon-positive-default)' },
  negative: { slug: 'close-circle', color: 'var(--color-icon-negative-default)' },
}

/**
 * The list's toast: webds `Toast`, fixed top-right 16 at the board's 620 wide
 * (CNH `1:138457` › Toast). `autoHideMs` closes it on its own; held routes
 * pass none so the state stays on screen.
 */
export function ListToast({
  open,
  appearance,
  title,
  description,
  autoHideMs,
  onClose,
}: {
  open: boolean
  appearance: Extract<ToastAppearance, 'positive' | 'negative'>
  title: React.ReactNode
  description?: React.ReactNode
  autoHideMs?: number
  onClose: () => void
}) {
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    if (!open || !autoHideMs) return
    const t = window.setTimeout(() => close.current(), autoHideMs)
    return () => window.clearTimeout(t)
  }, [open, autoHideMs])

  if (!open) return null
  const icon = ICON[appearance]
  return (
    <div className="fixed top-[var(--space-4)] right-[var(--space-4)] z-50 w-[620px]">
      <Toast
        appearance={appearance}
        title={title}
        description={description}
        icon={<Icon slug={icon.slug} size={24} color={icon.color} />}
        onClose={onClose}
      />
    </div>
  )
}
