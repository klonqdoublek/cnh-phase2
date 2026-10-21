import { useLayoutEffect, useRef, useState } from 'react'
import { MIRRORED } from './shortcut'

/* Idea 4's highlighted fields (requester, 21 Oct 2026, after Churnkey's
 * message editor on Mobbin): each `{{COLUMN}}` of the audience file reads as
 * a tinted chip inside the message box. The box stays webds Text Field /
 * Text Area — it takes the typing, the caret and the selection, its own text
 * made transparent — and this layer, laid exactly over it, paints the text
 * with the chips. Pointer events pass through to the box.
 *
 * A chip here is the token's own characters: it cannot show a friendlier
 * label or be deleted in one keystroke, because that needs a rich-text box
 * webds does not ship (gap). The tint is drawn outside the glyphs with a
 * spread shadow, so it adds no width and the text stays where the box has it. */

type Box = HTMLInputElement | HTMLTextAreaElement

const TOKEN = /(\{\{[^{}\s]+\}\})/

/** Splits a message into plain runs and the tokens the file has a column for. */
const runs = (value: string, columns: Set<string>) =>
  value.split(TOKEN).map((text) => ({ text, field: TOKEN.test(text) && columns.has(text.slice(2, -2)) }))

/** True when the message holds a token to tint — the box's text goes
 *  transparent only then, so its placeholder and plain text are untouched. */
export const hasField = (value: string, columns: Set<string>) => runs(value, columns).some((r) => r.field)

/** The tint layer for the box inside `root`. Renders nothing until it finds one. */
export function FieldTint({ root, value, columns }: { root: React.RefObject<HTMLElement | null>; value: string; columns: Set<string> }) {
  const layer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<Box | null>(null)

  useLayoutEffect(() => {
    setBox(root.current?.querySelector<Box>('textarea, input') ?? null)
  })

  useLayoutEffect(() => {
    const el = box
    const out = layer.current
    if (!el || !out || !root.current) return
    const place = () => {
      const cs = getComputedStyle(el)
      for (const p of MIRRORED) out.style.setProperty(p, cs.getPropertyValue(p))
      const at = el.getBoundingClientRect()
      const host = root.current!.getBoundingClientRect()
      const bl = parseFloat(cs.borderLeftWidth)
      const bt = parseFloat(cs.borderTopWidth)
      Object.assign(out.style, {
        left: `${at.left - host.left + bl}px`,
        top: `${at.top - host.top + bt}px`,
        /* The box's text area without its scroll bar, so lines wrap where its do. */
        width: `${el.clientWidth}px`,
        height: `${el.clientHeight}px`,
        boxSizing: 'border-box',
        borderWidth: '0',
        overflow: 'hidden',
        whiteSpace: el instanceof HTMLTextAreaElement ? 'pre-wrap' : 'pre',
        overflowWrap: el instanceof HTMLTextAreaElement ? 'break-word' : 'normal',
      })
      if (inner.current) inner.current.style.transform = `translate(${-el.scrollLeft}px, ${-el.scrollTop}px)`
    }
    place()
    const seen = new ResizeObserver(place)
    seen.observe(el)
    el.addEventListener('scroll', place)
    /* The caret moving to the end of a long one-line value scrolls it with no
       scroll event on some engines; re-read on every keystroke too. */
    el.addEventListener('keyup', place)
    el.addEventListener('input', place)
    return () => {
      seen.disconnect()
      el.removeEventListener('scroll', place)
      el.removeEventListener('keyup', place)
      el.removeEventListener('input', place)
    }
  }, [box, value, root])

  if (!box || !hasField(value, columns)) return null
  return (
    <div ref={layer} aria-hidden className="pointer-events-none absolute text-[var(--color-text-primary-default)]">
      <div ref={inner}>
        {runs(value, columns).map((r, i) =>
          r.field ? (
            <span
              key={i}
              className="rounded-[var(--radius-1)] bg-[var(--color-surface-accent-purple-default)] text-[var(--color-text-accent-purple-default)] shadow-[0_0_0_2px_var(--color-surface-accent-purple-default)]"
            >
              {r.text}
            </span>
          ) : (
            <span key={i}>{r.text}</span>
          ),
        )}
        {/* A trailing line break needs a character after it to take its line. */}
        {value.endsWith('\n') && '​'}
      </div>
    </div>
  )
}
