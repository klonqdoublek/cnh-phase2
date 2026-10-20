import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { RadioButton } from '@/bbl/radio-button'
import { SegmentedTab } from '@/bbl/segmented-tab'
import { useHash } from '@/lib/hash'
import { cn } from '@/lib/cn'
import { FIGMA_FILE, VARIANTS, ideaOf, setConcept, useConcept, type Layout } from './dynamic-field'

/* Prototype runner only — the floating Prototype control over Create / Edit
 * broadcast. Channel layout comes first; under it, the design drafts that
 * layout can draw (./dynamic-field.ts). Drag it by its title bar; it remembers
 * where it was left and whether it was collapsed. `?panel=0` keeps it out of
 * the task flow's frames, as the Task flow button. Not product UI: never hand
 * this file to a dev team. */

const LAYOUTS: { value: Layout; label: string }[] = [
  { value: 'columns', label: '3 columns' },
  { value: 'stacked', label: 'Stacked (CNH)' },
]

const KEY = 'cnh-concept-panel'
type Saved = { x: number; y: number; open: boolean }
const load = (): Partial<Saved> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}
const save = (s: Saved) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* storage blocked — position lasts until reload */
  }
}

/** Keeps the panel's top-left inside the window. */
const clamp = (x: number, y: number, el: HTMLElement | null) => {
  const w = el?.offsetWidth ?? 360
  const h = el?.offsetHeight ?? 48
  return {
    x: Math.min(Math.max(8, x), innerWidth - w - 8),
    y: Math.min(Math.max(8, y), innerHeight - h - 8),
  }
}

export function ConceptPanel() {
  const hash = useHash()
  const concept = useConcept()
  const box = useRef<HTMLDivElement>(null)
  const saved = useRef(load()).current
  const [open, setOpen] = useState(saved.open ?? true)
  /* Default: bottom right, above the page's 76 footer. */
  const [pos, setPos] = useState<{ x: number; y: number } | null>(
    saved.x != null && saved.y != null ? { x: saved.x, y: saved.y } : null,
  )

  const place = useCallback(() => {
    const el = box.current
    if (!el) return
    setPos((p) => clamp(p?.x ?? innerWidth - el.offsetWidth - 24, p?.y ?? innerHeight - el.offsetHeight - 100, el))
  }, [])

  useEffect(() => {
    place()
    addEventListener('resize', place)
    return () => removeEventListener('resize', place)
  }, [place, open, hash])

  useEffect(() => {
    if (pos) save({ ...pos, open })
  }, [pos, open])

  if (new URLSearchParams(location.search).get('panel') === '0') return null
  if (!/^#\/broadcast\/(create|edit)/.test(hash)) return null

  const idea = ideaOf(concept)

  const drag = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    const el = box.current
    if (!el || !pos) return
    e.preventDefault()
    const dx = e.clientX - pos.x
    const dy = e.clientY - pos.y
    const move = (ev: PointerEvent) => setPos(clamp(ev.clientX - dx, ev.clientY - dy, el))
    const up = () => {
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', up)
    }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
  }

  return (
    <div
      ref={box}
      role="dialog"
      aria-label="Prototype control"
      style={pos ? { left: pos.x, top: pos.y } : { right: 24, bottom: 100 }}
      className={cn(
        'fixed z-[1300] flex flex-col rounded-[var(--radius-3)] bg-[var(--color-surface-primary-default)] shadow-[inset_0_0_0_1px_var(--color-border-primary-default),var(--shadow-overlay)]',
        open ? 'w-[360px]' : 'w-auto',
      )}
    >
      {/* Title bar — the drag handle. */}
      <div
        onPointerDown={drag}
        className={cn(
          'flex cursor-move touch-none select-none items-center gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-3)]',
          open && 'border-b border-[var(--color-border-primary-default)]',
        )}
      >
        <span className="type-label-l-emphasized text-[var(--color-text-primary-default)]">Prototype control</span>
        {!open && (
          <span className="type-label-m text-[var(--color-text-secondary-default)]">
            · {LAYOUTS.find((l) => l.value === concept.layout)?.label} · {idea ? idea.label : 'Not drawn'}
          </span>
        )}
        <span className="ml-auto flex">
          <IconButton
            label={open ? 'Collapse' : 'Expand'}
            icon={<Icon slug={open ? 'chevron-down' : 'chevron-up'} size={16} />}
            onClick={() => setOpen(!open)}
          />
        </span>
      </div>

      {open && (
        <div className="flex flex-col gap-[var(--space-4)] p-[var(--space-4)]">
          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">1. Channel layout</span>
            <SegmentedTab
              items={LAYOUTS.map((l) => l.label)}
              selectedIndex={LAYOUTS.findIndex((l) => l.value === concept.layout)}
              onSelect={(i) => setConcept({ layout: LAYOUTS[i].value })}
            />
          </div>

          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">2. Design draft</span>
            <div role="radiogroup" aria-label="Design draft" className="flex flex-col">
              {VARIANTS.map((v) => {
                const draft = ideaOf({ ...v, layout: concept.layout })
                const on = v.picker === concept.picker && v.placement === concept.placement
                return (
                  <label
                    key={`${v.picker}-${v.placement}`}
                    className="flex cursor-pointer items-start gap-[var(--space-2)] rounded-[var(--radius-2)] px-[var(--space-2)] py-[var(--space-2)] hover:bg-[var(--color-surface-secondary-default)]"
                  >
                    <RadioButton
                      selected={on}
                      aria-label={draft ? draft.label : v.note}
                      onClick={() => setConcept({ picker: v.picker, placement: v.placement })}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span
                        className={cn(
                          'type-label-l-emphasized',
                          draft ? 'text-[var(--color-text-primary-default)]' : 'text-[var(--color-text-secondary-default)]',
                        )}
                      >
                        {draft ? draft.label : 'Not drawn'}
                      </span>
                      <span className="type-body-s text-[var(--color-text-secondary-default)]">
                        {v.note}
                        {draft && (
                          <>
                            {' · '}
                            <a
                              href={`${FIGMA_FILE}?node-id=${draft.node}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[var(--color-text-link-default)] hover:underline"
                            >
                              Figma
                            </a>
                          </>
                        )}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
