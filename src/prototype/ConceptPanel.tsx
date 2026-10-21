import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { SegmentedTab } from '@/bbl/segmented-tab'
import { useHash } from '@/lib/hash'
import { cn } from '@/lib/cn'
import {
  FEW_FIELDS,
  FIGMA_FILE,
  VARIANTS,
  ideaOf,
  nameOf,
  setConcept,
  useConcept,
  type Columns,
  type Layout,
  type Mark,
  type Picker,
  type Placement,
  type Trigger,
} from './dynamic-field'

/* Prototype runner only — the floating Prototype control over Create / Edit
 * broadcast. Channel layout comes first; under it, the design direction —
 * how a field is picked — with its own options in one row, and a line naming
 * the draft that combination is (./dynamic-field.ts). Drag it by its title bar; it remembers
 * where it was left and whether it was collapsed. `?panel=0` keeps it out of
 * the task flow's frames, as the Task flow button. Not product UI: never hand
 * this file to a dev team. */

const LAYOUTS: { value: Layout; label: string }[] = [
  { value: 'columns', label: '3 columns' },
  { value: 'stacked', label: 'Stacked (CNH)' },
]

/* Many is the 55-column CIS file: its ID column and 54 fields. */
const COLUMNS: { value: Columns; label: string }[] = [
  { value: 'few', label: `Few fields (${FEW_FIELDS})` },
  { value: 'many', label: 'Many fields (54)' },
]

/* The requester's four directions (20–21 Oct 2026); Idea N under each is the
   caption's job, so the tabs stay short enough for four across. */
const DIRECTIONS: { value: Picker; label: string }[] = [
  { value: 'pills', label: 'Pills' },
  { value: 'button', label: 'Menu' },
  { value: 'dialog', label: 'Dialog' },
  { value: 'shortcut', label: 'Shortcut' },
]

const PLACEMENTS: { value: Placement; label: string }[] = [
  { value: 'shared', label: 'Shared' },
  { value: 'channel', label: 'Per card' },
]

const TRIGGERS: { value: Trigger; label: string }[] = [
  { value: 'slash', label: '/' },
  { value: 'at', label: '@' },
  { value: 'braces', label: '{{' },
]

const MARKS: { value: Mark; label: string }[] = [
  { value: 'plus', label: '+' },
  { value: 'braces', label: '{ }' },
]

/** A direction's own option: a small label over its control. */
function Option({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
      <span className="type-label-s text-[var(--color-text-secondary-default)]">{label}</span>
      {children}
    </div>
  )
}

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

  const idea = concept.picker === 'shortcut' ? undefined : ideaOf(concept)
  const name = nameOf(concept)
  const variant = VARIANTS.find((v) => v.picker === concept.picker && v.placement === concept.placement)

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
            · {LAYOUTS.find((l) => l.value === concept.layout)?.label} ·{' '}
            {name ?? 'Not drawn'} ·{' '}
            {concept.columns === 'few' ? 'Few' : 'Many'} fields
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
            <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">2. Design direction</span>
            <SegmentedTab
              items={DIRECTIONS.map((d) => d.label)}
              selectedIndex={DIRECTIONS.findIndex((d) => d.value === concept.picker)}
              onSelect={(i) => setConcept({ picker: DIRECTIONS[i].value })}
            />
            <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-[var(--space-3)]">
              {concept.picker === 'shortcut' ? (
                <Option label="Type to open">
                  <SegmentedTab
                    items={TRIGGERS.map((t) => t.label)}
                    selectedIndex={TRIGGERS.findIndex((t) => t.value === concept.trigger)}
                    onSelect={(i) => setConcept({ trigger: TRIGGERS[i].value })}
                  />
                </Option>
              ) : (
                <Option label="Placement">
                  <SegmentedTab
                    items={PLACEMENTS.map((p) => p.label)}
                    selectedIndex={PLACEMENTS.findIndex((p) => p.value === concept.placement)}
                    onSelect={(i) => setConcept({ placement: PLACEMENTS[i].value })}
                  />
                </Option>
              )}
              {(concept.picker === 'button' || concept.picker === 'dialog') && (
                <Option label="Button icon">
                  <SegmentedTab
                    items={MARKS.map((m) => m.label)}
                    selectedIndex={MARKS.findIndex((m) => m.value === concept.mark)}
                    onSelect={(i) => setConcept({ mark: MARKS[i].value })}
                  />
                </Option>
              )}
            </div>
            <p className="type-body-s text-[var(--color-text-secondary-default)]">
              <span
                className={cn(
                  'type-label-m-emphasized',
                  name ? 'text-[var(--color-text-primary-default)]' : 'text-[var(--color-text-secondary-default)]',
                )}
              >
                {name ?? 'Not drawn'}
              </span>
              {' · '}
              {variant?.note}
              {idea && (
                <>
                  {' · '}
                  <a
                    href={`${FIGMA_FILE}?node-id=${idea.node}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-text-link-default)] hover:underline"
                  >
                    Figma
                  </a>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">3. Audience file</span>
            <SegmentedTab
              items={COLUMNS.map((c) => c.label)}
              selectedIndex={COLUMNS.findIndex((c) => c.value === concept.columns)}
              onSelect={(i) => setConcept({ columns: COLUMNS[i].value })}
            />
            <span className="type-body-s text-[var(--color-text-secondary-default)]">
              Swaps the CIS preset's file, so the fields follow its columns. Resets what was typed.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
