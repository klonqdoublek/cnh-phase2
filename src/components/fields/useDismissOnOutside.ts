import { useEffect, type RefObject } from 'react'

/** While `open`, a press outside `rootRef` or Escape closes it. From the CMS
 *  prototype's `hooks/useDismissOnOutside.ts`. */
export function useDismissOnOutside(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  setOpen: (open: boolean) => void,
) {
  useEffect(() => {
    if (!open) return
    const away = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', escape)
    }
  }, [open, rootRef, setOpen])
}
