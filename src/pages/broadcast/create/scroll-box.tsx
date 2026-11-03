import { useCallback, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { ScrollBar } from '@/bbl/scroll-bar'
import { cn } from '@/lib/cn'

/** A box that scrolls both ways under the library's Scroll Bars instead of
 *  the browser's. The browser's are hidden: on macOS they are overlays that
 *  stay out of sight until a scroll starts, so a freshly uploaded preview
 *  said nothing about the rows below or the columns to the right. The bars
 *  show as soon as the content overflows. webds' `ScrollBar` only draws a
 *  position (gap), so pressing or dragging a track is wired here: the thumb
 *  centres on the pointer. */
export function ScrollBox({
  maxHeight,
  className,
  viewClassName,
  children,
}: {
  maxHeight?: string
  /** On the frame: the file preview's border and radius by default. */
  className?: string
  /** On the scrolling view, e.g. its padding. */
  viewClassName?: string
  children: ReactNode
}) {
  const view = useRef<HTMLDivElement>(null)
  type Thumb = { size: number; offset: number } | null
  const [bars, setBars] = useState<{ x: Thumb; y: Thumb }>({ x: null, y: null })

  const measure = useCallback(() => {
    const el = view.current
    if (!el) return
    const thumb = (client: number, total: number, pos: number): Thumb => {
      if (total <= client + 1) return null
      /* A floor of 15%, or a 100-row file draws a thumb too short to see. */
      const size = Math.max(15, (client / total) * 100)
      return { size, offset: (pos / (total - client)) * (100 - size) }
    }
    setBars({
      x: thumb(el.clientWidth, el.scrollWidth, el.scrollLeft),
      y: thumb(el.clientHeight, el.scrollHeight, el.scrollTop),
    })
  }, [])

  useLayoutEffect(() => {
    const el = view.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => {
      el.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [measure])

  const press = (axis: 'x' | 'y') => (e: ReactPointerEvent<HTMLDivElement>) => {
    const track = e.currentTarget
    const el = view.current
    if (!el) return
    e.preventDefault()
    track.setPointerCapture(e.pointerId)
    const to = (ev: PointerEvent) => {
      const r = track.getBoundingClientRect()
      if (axis === 'x') el.scrollLeft = ((ev.clientX - r.left) / r.width) * el.scrollWidth - el.clientWidth / 2
      else el.scrollTop = ((ev.clientY - r.top) / r.height) * el.scrollHeight - el.clientHeight / 2
    }
    to(e.nativeEvent)
    const up = () => {
      track.removeEventListener('pointermove', to)
      track.removeEventListener('pointerup', up)
    }
    track.addEventListener('pointermove', to)
    track.addEventListener('pointerup', up)
  }

  return (
    <div
      className={cn(
        'grid min-w-0 grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-[var(--radius-2)] border border-[var(--color-border-primary-default)]',
        className,
      )}
    >
      <div
        ref={view}
        className={cn('min-w-0 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', viewClassName)}
        style={{ maxHeight }}
      >
        {children}
      </div>
      {bars.y ? (
        <div className="flex cursor-pointer touch-none" onPointerDown={press('y')}>
          <ScrollBar appearance="thick" orientation="vertical" thumbSize={`${bars.y.size}%`} thumbOffset={`${bars.y.offset}%`} />
        </div>
      ) : (
        <span />
      )}
      {bars.x && (
        <div className="flex cursor-pointer touch-none flex-col" onPointerDown={press('x')}>
          <ScrollBar appearance="thick" orientation="horizontal" thumbSize={`${bars.x.size}%`} thumbOffset={`${bars.x.offset}%`} />
        </div>
      )}
    </div>
  )
}
