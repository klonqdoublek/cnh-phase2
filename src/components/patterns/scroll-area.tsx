import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ScrollBar } from '@/bbl/scroll-bar'

/* Scroll Area — a list that scrolls under the LIBRARY'S Scroll Bar instead of the
 * browser's. Measured on `Financial planning` (IfUYUQApZfEDkjIho9klKw · I8002:65857,
 * I8002:65951), where every scrolling list carries `Scroll Bar / Appearance=Thin`:
 *
 *   bar    12 wide, absolutely placed in the card's padding just past the list's
 *          right edge (Month summary 494 of a 510 card, Money in/out at the list's
 *          817, Expense limit at the table's 1404) · thumb 2 at rest, 8 on hover
 *          (the set's own Thin → Hovered), Component/Scroll Bar/Default
 *   list   the browser's own bar is hidden — Safari's overlay thumb and Chrome's
 *          gutter are neither of them the library's
 *
 * The thumb tracks the scroll: size = visible / total, offset = scrolled / total,
 * re-measured when the list or its content resizes (a row opening, Show more). No
 * bar when nothing overflows — a bar on a list that cannot move says it can.
 *
 * Promoted on its FOURTH occurrence: multi-select-panel carries the same tracking,
 * and the Centralize Log and CNH prototypes each copied it. */
export type ScrollAreaProps = {
  children?: React.ReactNode
  className?: string
}

export function ScrollArea({ children, className }: ScrollAreaProps) {
  const viewport = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState<{ size: number; offset: number } | null>(null)

  const track = useCallback(() => {
    const el = viewport.current
    if (!el) return
    setThumb(
      el.scrollHeight > el.clientHeight + 1
        ? {
            size: Math.min(100, (el.clientHeight / el.scrollHeight) * 100),
            offset: (el.scrollTop / el.scrollHeight) * 100,
          }
        : null,
    )
  }, [])

  useEffect(() => {
    const el = viewport.current
    track()
    /* Native and passive: the thumb only reads the position, it never cancels a scroll. */
    el?.addEventListener('scroll', track, { passive: true })
    const ro = new ResizeObserver(track)
    if (el) ro.observe(el)
    if (content.current) ro.observe(content.current)
    return () => {
      el?.removeEventListener('scroll', track)
      ro.disconnect()
    }
  }, [track])

  return (
    <div className={cn('webds-pattern-scroll-area', className)}>
      <div ref={viewport} className="webds-pattern-scroll-area-viewport">
        <div ref={content} className="webds-pattern-scroll-area-content">
          {children}
        </div>
      </div>
      {thumb && (
        <ScrollBar
          appearance="thin"
          orientation="vertical"
          thumbSize={`${thumb.size}%`}
          thumbOffset={`${thumb.offset}%`}
          className="webds-pattern-scroll-area-bar"
        />
      )}
    </div>
  )
}
