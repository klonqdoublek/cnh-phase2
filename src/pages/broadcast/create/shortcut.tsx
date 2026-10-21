import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ListItem } from '@/bbl/list-item'
import type { BroadcastContent } from '@/data/broadcast'
import type { Trigger } from '@/prototype/dynamic-field'
import type { BroadcastForm } from './useBroadcastForm'

/* Idea 4 (requester, 21 Oct 2026): a message box as a text editor — typing the
 * trigger opens the file's columns at the caret, as Wrangle's `/` and
 * AutoSend's `{{` (Mobbin, 21 Oct 2026). Typing after the trigger filters;
 * ↑ ↓ move, Enter or Tab inserts `{{COLUMN}}` in place of what was typed, Esc
 * closes. The boxes stay webds Text Field / Text Area, so the token is plain
 * text: an inline chip needs a rich-text box webds does not ship (gap).
 *
 * The trigger fires anywhere, not only after a space: Thai runs words
 * together (`เรียนคุณ/`). So `/` also opens inside a URL or a date and `@`
 * inside an email address; the menu stays shut while nothing matches. */

type Box = HTMLInputElement | HTMLTextAreaElement

/** What each trigger matches right before the caret; group 1 is the filter. */
const TRIGGERS: Record<Trigger, { mark: string; re: RegExp }> = {
  slash: { mark: '/', re: /\/([^\s/]*)$/ },
  at: { mark: '@', re: /@([^\s@]*)$/ },
  braces: { mark: '{{', re: /\{\{([^\s{}]*)$/ },
}

export const triggerMark = (t: Trigger) => TRIGGERS[t].mark

/* The box styles that decide where a character lands. */
const MIRRORED = [
  'box-sizing', 'width', 'height', 'overflow-x', 'overflow-y',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'font-style', 'font-variant', 'font-weight', 'font-stretch', 'font-size', 'line-height', 'font-family',
  'text-align', 'text-transform', 'text-indent', 'letter-spacing', 'word-spacing', 'tab-size',
]

/** Where character `index` sits on screen: an off-screen copy of the box,
 *  filled up to it, measures the line it lands on. */
function caretPoint(el: Box, index: number) {
  const cs = getComputedStyle(el)
  const copy = document.createElement('div')
  for (const p of MIRRORED) copy.style.setProperty(p, cs.getPropertyValue(p))
  const area = el instanceof HTMLTextAreaElement
  Object.assign(copy.style, {
    position: 'absolute',
    visibility: 'hidden',
    top: '0',
    left: '-9999px',
    whiteSpace: area ? 'pre-wrap' : 'pre',
    overflowWrap: area ? 'break-word' : 'normal',
  })
  copy.textContent = el.value.slice(0, index)
  const mark = document.createElement('span')
  mark.textContent = el.value.slice(index) || '.'
  copy.appendChild(mark)
  document.body.appendChild(copy)
  const box = el.getBoundingClientRect()
  const line = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4
  const x = box.left + parseFloat(cs.borderLeftWidth) + mark.offsetLeft - el.scrollLeft
  const y = box.top + parseFloat(cs.borderTopWidth) + mark.offsetTop - el.scrollTop
  copy.remove()
  return { x, top: y, bottom: y + line }
}

type Open = {
  key: keyof BroadcastContent
  el: Box
  /** Where the trigger starts and the caret sits — the run the pick replaces. */
  start: number
  end: number
  query: string
  at: { x: number; top: number; bottom: number }
}

const MENU_W = 240
const MENU_MAX = 320
const ROW = 36

/** Handlers for the element around the message boxes, and the menu to render
 *  beside it. Off: no handlers, no menu. */
export function useFieldShortcut(f: BroadcastForm, trigger: Trigger, on: boolean) {
  const [open, setOpen] = useState<Open | null>(null)
  const [active, setActive] = useState(0)
  /* Esc shuts the menu for this trigger until another one is typed. */
  const dismissed = useRef('')
  const list = useRef<HTMLDivElement>(null)

  /* Columns that start with what was typed come first, then the rest that
     contain it — `am` is AMOUNT before CUSTOMER_NAME. */
  const match = (query: string) => {
    const q = query.toLowerCase()
    const hits = f.fields.filter((field) => field.column.toLowerCase().includes(q))
    return [
      ...hits.filter((field) => field.column.toLowerCase().startsWith(q)),
      ...hits.filter((field) => !field.column.toLowerCase().startsWith(q)),
    ]
  }
  const matches = open ? match(open.query) : []

  const sync = (el: EventTarget) => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return
    const key = el.closest('[data-field]')?.getAttribute('data-field')
    const caret = el.selectionStart ?? 0
    const hit = el.selectionEnd === caret ? TRIGGERS[trigger].re.exec(el.value.slice(0, caret)) : null
    if (!key || !(key in f.content) || el.disabled || !hit) {
      dismissed.current = ''
      return setOpen(null)
    }
    const start = caret - hit[0].length
    if (dismissed.current === `${key}:${start}` || !match(hit[1]).length) return setOpen(null)
    dismissed.current = ''
    if (open?.query !== hit[1] || open.start !== start) setActive(0)
    setOpen({ key: key as keyof BroadcastContent, el, start, end: caret, query: hit[1], at: caretPoint(el, start) })
  }

  const insert = (token: string) => {
    if (!open) return
    const { el, key, start, end } = open
    f.setC(key)(el.value.slice(0, start) + token + el.value.slice(end))
    setOpen(null)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    })
  }

  /* The menu is placed once per keystroke; a scroll or resize would leave it
     behind, so either one shuts it. */
  useEffect(() => {
    if (!open) return
    const shut = () => setOpen(null)
    addEventListener('scroll', shut, true)
    addEventListener('resize', shut)
    return () => {
      removeEventListener('scroll', shut, true)
      removeEventListener('resize', shut)
    }
  }, [open])

  useEffect(() => {
    list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!on || !f.fields.length) return { handlers: {}, menu: null }

  /* Bubble phase, not capture: React flushes a capture-phase update before the
     box's own onChange runs, and the controlled box snaps back a character. */
  const handlers = {
    onInput: (e: React.FormEvent) => sync(e.target),
    onClick: (e: React.MouseEvent) => sync(e.target),
    onKeyUp: (e: React.KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(e.key)) sync(e.target)
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!open || !matches.length) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const step = e.key === 'ArrowDown' ? 1 : -1
        setActive((i) => (i + step + matches.length) % matches.length)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insert(matches[Math.min(active, matches.length - 1)].token)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        dismissed.current = `${open.key}:${open.start}`
        setOpen(null)
      }
    },
    onBlur: () => setOpen(null),
  }

  let menu: React.ReactNode = null
  if (open && matches.length) {
    const height = Math.min(matches.length * (ROW + 4) + 12, MENU_MAX)
    const below = open.at.bottom + 4 + height <= innerHeight - 8
    menu = createPortal(
      <div
        ref={list}
        role="listbox"
        aria-label="Dynamic field"
        /* mousedown would blur the message box and lose the caret first */
        onMouseDown={(e) => e.preventDefault()}
        style={{
          width: MENU_W,
          left: Math.min(open.at.x, innerWidth - MENU_W - 8),
          top: below ? open.at.bottom + 4 : Math.max(8, open.at.top - 4 - height),
        }}
        className="webds-pattern-dropdown-menu fixed z-[1200] max-h-[320px] overflow-y-auto"
      >
        {matches.map((field, i) => (
          <div key={field.column} data-i={i} onMouseEnter={() => setActive(i)}>
            <ListItem
              size="s"
              titleOnly
              state={i === Math.min(active, matches.length - 1) ? 'hovered' : 'default'}
              title={field.column}
              onClick={() => insert(field.token)}
            />
          </div>
        ))}
      </div>,
      document.body,
    )
  }

  return { handlers, menu }
}
