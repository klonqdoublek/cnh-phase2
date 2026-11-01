import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MIRRORED } from './shortcut'

/* Idea 4's highlighted fields (requester, 21 Oct 2026, after Churnkey's
 * message editor on Mobbin): each `${COLUMN}` of the audience file reads as
 * a tinted chip inside the message box. The box stays webds Text Field /
 * Text Area — it takes the typing, the caret and the selection, its own text
 * made transparent — and this layer, laid exactly over it, paints the text
 * with the chips. Pointer events pass through to the box.
 *
 * A chip is one unit, as a rich-text editor's atom node (Tiptap's Mention is
 * `atom: true`): the caret never stops inside it — arrows step over it, a
 * click inside lands on its nearer edge — and Backspace / Delete take it
 * whole (BA & Dev feedback, 30 Oct 2026, kept the default of the three ways
 * the Prototype control offered: Whole, Select, Re-pick). A chip
 * still shows the token's own characters, not a friendlier label: that needs
 * a rich-text box webds does not ship (gap). The tint is drawn outside the
 * glyphs with a spread shadow, so it adds no width and the text stays where
 * the box has it.
 *
 * Typing, pasting, Enter or Cut over a selection that cuts into a chip take
 * the whole chip too, so no half token such as `${CUST` is left (requester,
 * 1 Nov 2026). Every edit made here goes through the browser's own editing
 * (`editBox`), so ⌘Z / ⌘⇧Z undo and redo a chip erase or a picked field like
 * typing (requester, 1 Nov 2026; before, the value was set and undo lost it). */

type Box = HTMLInputElement | HTMLTextAreaElement

export type Tint = {
  /** The file's columns — only their tokens are chips. */
  columns: Set<string>
}

const TOKEN = /(\$\{[^{}$\s]+\})/
const TOKENS = /\$\{([^{}$\s]+)\}/g

/** Splits a message into plain runs and the tokens the file has a column for. */
const runs = (value: string, columns: Set<string>) =>
  value.split(TOKEN).map((text) => ({ text, field: TOKEN.test(text) && columns.has(text.slice(2, -1)) }))

/** Replaces `from`–`to` in the box with `text` as the browser's own edit, so
 *  the box's undo history keeps it and its input event reaches React's
 *  onChange. `fallback` sets the value where the browser has no
 *  `insertText` command. Leaves the caret after `text`. */
export function editBox(el: Box, from: number, to: number, text: string, fallback: (v: string) => void) {
  el.focus()
  el.setSelectionRange(from, to)
  const done = text ? document.execCommand('insertText', false, text) : from === to || document.execCommand('delete')
  if (!done) {
    fallback(el.value.slice(0, from) + text + el.value.slice(to))
    requestAnimationFrame(() => el.setSelectionRange(from + text.length, from + text.length))
  }
}

/** Where each chip starts and ends in the message. */
const chips = (value: string, columns: Set<string>) =>
  [...value.matchAll(TOKENS)]
    .filter((m) => columns.has(m[1]))
    .map((m) => ({ start: m.index, end: m.index + m[0].length }))

/** True when the message holds a token to tint — the box's text goes
 *  transparent only then, so its placeholder and plain text are untouched. */
export const hasField = (value: string, columns: Set<string>) => runs(value, columns).some((r) => r.field)

/** A key that types a character into the box: a printable key, or Enter in a
 *  text area. Shortcuts with ⌘ / Ctrl / Alt type nothing. */
const typed = (e: KeyboardEvent, el: Box) =>
  !e.metaKey && !e.ctrlKey && !e.altKey && (e.key.length === 1 || (e.key === 'Enter' && el instanceof HTMLTextAreaElement))

/** Keeps the caret out of chips and erases a chip whole. Listens on the box
 *  itself, so it runs before the shortcut menu's handlers on the cards. */
function useAtomicChips(box: Box | null, value: string, tint: Tint, onChange: (v: string) => void) {
  const latest = useRef({ value, tint, onChange })
  latest.current = { value, tint, onChange }

  useEffect(() => {
    const el = box
    if (!el) return
    const put = (from: number, to: number, text = '') => editBox(el, from, to, text, latest.current.onChange)
    /* The selection grown to whole chips at both ends; null when it cuts none. */
    const grown = (from: number, to: number) => {
      const { value: v, tint: t } = latest.current
      const list = chips(v, t.columns)
      const a = Math.min(from, ...list.filter((x) => x.start < from && from < x.end).map((x) => x.start))
      const b = Math.max(to, ...list.filter((x) => x.start < to && to < x.end).map((x) => x.end))
      return a === from && b === to ? null : { a, b }
    }
    /* A caret left inside a chip goes to the chip's nearer edge. */
    const snap = () => {
      const { value: v, tint: t } = latest.current
      const c = el.selectionStart ?? 0
      if (c !== el.selectionEnd) return
      const hit = chips(v, t.columns).find((x) => x.start < c && c < x.end)
      if (hit) {
        const edge = c - hit.start < hit.end - c ? hit.start : hit.end
        el.setSelectionRange(edge, edge)
      }
    }
    const key = (e: KeyboardEvent) => {
      if (e.isComposing) return
      const { value: v, tint: t } = latest.current
      const list = chips(v, t.columns)
      const from = el.selectionStart ?? 0
      const to = el.selectionEnd ?? 0
      const back = e.key === 'Backspace'
      if ((back || e.key === 'Delete') && from === to) {
        const hit = list.find((x) => (back ? x.start < from && from <= x.end : x.start <= from && from < x.end))
        if (!hit) return
        e.preventDefault()
        put(hit.start, hit.end)
      } else if (from !== to && (back || e.key === 'Delete' || typed(e, el))) {
        /* A selection that cuts into a chip takes the whole chip, whether it
           is erased or typed over. */
        const g = grown(from, to)
        if (!g) return
        e.preventDefault()
        put(g.a, g.b, back || e.key === 'Delete' ? '' : e.key === 'Enter' ? '\n' : e.key)
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && from === to && !e.shiftKey && !e.altKey && !e.metaKey) {
        const left = e.key === 'ArrowLeft'
        const hit = list.find((x) => (left ? x.start < from && from <= x.end : x.start <= from && from < x.end))
        if (!hit) return
        e.preventDefault()
        const edge = left ? hit.start : hit.end
        el.setSelectionRange(edge, edge)
      }
    }
    /* Cut and paste over a selection that cuts into a chip: the whole chip
       goes to the clipboard, or is replaced by what is pasted. */
    const cut = (e: ClipboardEvent) => {
      const g = grown(el.selectionStart ?? 0, el.selectionEnd ?? 0)
      if (!g || !e.clipboardData) return
      e.preventDefault()
      e.clipboardData.setData('text/plain', el.value.slice(g.a, g.b))
      put(g.a, g.b)
    }
    const paste = (e: ClipboardEvent) => {
      const g = grown(el.selectionStart ?? 0, el.selectionEnd ?? 0)
      if (!g || !e.clipboardData) return
      e.preventDefault()
      put(g.a, g.b, e.clipboardData.getData('text/plain'))
    }
    /* Typed as an element: a union of two box types loses the keydown overload. */
    const host: HTMLElement = el
    host.addEventListener('keydown', key)
    host.addEventListener('cut', cut)
    host.addEventListener('paste', paste)
    el.addEventListener('mouseup', snap)
    el.addEventListener('keyup', snap)
    return () => {
      host.removeEventListener('keydown', key)
      host.removeEventListener('cut', cut)
      host.removeEventListener('paste', paste)
      el.removeEventListener('mouseup', snap)
      el.removeEventListener('keyup', snap)
    }
  }, [box])
}

/** The tint layer for the box inside `root`. Renders nothing until it finds one. */
export function FieldTint({
  root,
  value,
  tint,
  onChange,
}: {
  root: React.RefObject<HTMLElement | null>
  value: string
  tint: Tint
  onChange: (v: string) => void
}) {
  const layer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<Box | null>(null)
  /* The box's selection, so a chip it covers is drawn selected — the chip's
     tint would hide the box's own selection colour. */
  const [sel, setSel] = useState<[number, number]>([0, 0])

  useLayoutEffect(() => {
    setBox(root.current?.querySelector<Box>('textarea, input') ?? null)
  })

  useAtomicChips(box, value, tint, onChange)

  useEffect(() => {
    const el = box
    if (!el) return
    const read = () =>
      setSel((s) => {
        const next: [number, number] = document.activeElement === el ? [el.selectionStart ?? 0, el.selectionEnd ?? 0] : [0, 0]
        return s[0] === next[0] && s[1] === next[1] ? s : next
      })
    document.addEventListener('selectionchange', read)
    el.addEventListener('select', read)
    el.addEventListener('blur', read)
    return () => {
      document.removeEventListener('selectionchange', read)
      el.removeEventListener('select', read)
      el.removeEventListener('blur', read)
    }
  }, [box])

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

  if (!box || !hasField(value, tint.columns)) return null
  let at = 0
  return (
    <div ref={layer} aria-hidden className="pointer-events-none absolute text-[var(--color-text-primary-default)]">
      <div ref={inner}>
        {runs(value, tint.columns).map((r, i) => {
          const start = at
          at += r.text.length
          if (!r.field) return <span key={i}>{r.text}</span>
          const picked = sel[0] < sel[1] && sel[0] <= start && at <= sel[1]
          return (
            <span
              key={i}
              className={
                picked
                  ? 'rounded-[var(--radius-1)] bg-[var(--color-surface-accent-purple-default)] text-[var(--color-text-accent-purple-default)] shadow-[0_0_0_2px_var(--color-border-highlight-default)]'
                  : 'rounded-[var(--radius-1)] bg-[var(--color-surface-accent-purple-default)] text-[var(--color-text-accent-purple-default)] shadow-[0_0_0_2px_var(--color-surface-accent-purple-default)]'
              }
            >
              {r.text}
            </span>
          )
        })}
        {/* A trailing line break needs a character after it to take its line. */}
        {value.endsWith('\n') && '​'}
      </div>
    </div>
  )
}
