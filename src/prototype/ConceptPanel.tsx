import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { LineTab } from '@/bbl/line-tab'
import { RadioButton } from '@/bbl/radio-button'
import { SegmentedTab } from '@/bbl/segmented-tab'
import { go, useHash } from '@/lib/hash'
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
  type Erase,
  type Layout,
  type Look,
  type Mark,
  type Picker,
  type Placement,
  type Trigger,
} from './dynamic-field'
import { KINDS, screenOf, stateOf, type Kind } from './screen-states'

/* Prototype runner only — the floating Prototype control, in two groups
 * (requester, 28 Oct 2026). Screen state: on every screen with more than one
 * state it lists them, so loading, error, empty and dialog states are one
 * click away (./screen-states.ts), folded by kind so only the kind on show
 * is open (requester, 28 Oct 2026); on Create / Edit broadcast the audience
 * file's size too. Design direction, on Create / Edit broadcast only: channel
 * layout, then how a field is picked with its own options in one row, and a
 * line naming the draft that combination is (./dynamic-field.ts). Drag it by
 * its title bar; it remembers where it was left, whether it was collapsed and
 * which group was open. `?panel=0` keeps it out of
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

const LOOKS: { value: Look; label: string }[] = [
  { value: 'plain', label: 'Plain' },
  { value: 'tint', label: 'Highlight' },
]

const ERASES: { value: Erase; label: string }[] = [
  { value: 'whole', label: 'Whole' },
  { value: 'select', label: 'Select' },
  { value: 'trigger', label: 'Re-pick' },
]

const MARKS: { value: Mark; label: string }[] = [
  { value: 'plus', label: '+' },
  { value: 'braces', label: '{ }' },
]

/** A direction's own option: a small label over its control. */
function Option({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-[var(--space-1)]', wide && 'col-span-2')}>
      <span className="type-label-s text-[var(--color-text-secondary-default)]">{label}</span>
      {children}
    </div>
  )
}

type Group = 'state' | 'direction'
const GROUPS: { value: Group; label: string }[] = [
  { value: 'state', label: 'Screen state' },
  { value: 'direction', label: 'Design direction' },
]

/** A group's section: a heading over its controls. */
function Section({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">{label}</span>
      {children}
    </div>
  )
}

const KEY = 'cnh-concept-panel'
type Saved = { x: number; y: number; open: boolean; group: Group }
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
  const [group, setGroup] = useState<Group>(saved.group === 'direction' ? 'direction' : 'state')
  /* Kinds opened or closed by hand; the rest follow the state on show. */
  const [folds, setFolds] = useState<Partial<Record<Kind, boolean>>>({})
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
    if (pos) save({ ...pos, open, group })
  }, [pos, open, group])

  /* Another screen starts folded again, on its own state's kind. */
  const screenName = screenOf(hash)?.name
  useEffect(() => setFolds({}), [screenName])

  if (new URLSearchParams(location.search).get('panel') === '0') return null
  const screen = screenOf(hash)
  const concepts = /^#\/broadcast\/(create|edit)/.test(hash)
  if (!screen && !concepts) return null
  const state = screen && stateOf(screen, hash)
  /* Off Create / Edit broadcast there is no direction to pick: Screen state alone, no tabs. */
  const shown: Group = concepts ? group : 'state'

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
        <span className="type-label-l-emphasized shrink-0 whitespace-nowrap text-[var(--color-text-primary-default)]">Prototype control</span>
        {!open && (state || concepts) && (
          <span className="type-label-m text-[var(--color-text-secondary-default)]">
            {state && <>· {state.label} </>}
            {concepts && (
              <>
                · {LAYOUTS.find((l) => l.value === concept.layout)?.label} · {name ?? 'Not drawn'} ·{' '}
                {concept.columns === 'few' ? 'Few' : 'Many'} fields
              </>
            )}
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
        <>
          {concepts && (
            <div role="tablist" aria-label="Prototype control group" className="flex px-[var(--space-4)] pt-[var(--space-3)]">
              {GROUPS.map((g) => (
                <LineTab
                  key={g.value}
                  role="tab"
                  aria-selected={shown === g.value}
                  selected={shown === g.value}
                  onClick={() => setGroup(g.value)}
                  className="flex-1"
                >
                  {g.label}
                </LineTab>
              ))}
            </div>
          )}

          <div className="flex max-h-[calc(100vh-160px)] flex-col gap-[var(--space-4)] overflow-y-auto p-[var(--space-4)]">
            {shown === 'state' && (
              <>
                {concepts && (
                  <Section label="Audience file">
                    <SegmentedTab
                      items={COLUMNS.map((c) => c.label)}
                      selectedIndex={COLUMNS.findIndex((c) => c.value === concept.columns)}
                      onSelect={(i) => setConcept({ columns: COLUMNS[i].value })}
                    />
                    <span className="type-body-s text-[var(--color-text-secondary-default)]">
                      Swaps the CIS preset's file, so the fields follow its columns. Resets what was typed.
                    </span>
                  </Section>
                )}

                {screen ? (
                  <Section label={screen.name}>
                    <div role="radiogroup" aria-label="Screen state" className="flex flex-col">
                      {KINDS.map((kind) => {
                        const states = screen.states.filter((st) => st.kind === kind)
                        if (!states.length) return null
                        const here = state?.kind === kind
                        const unfolded = folds[kind] ?? here
                        return (
                          <div key={kind} className="flex flex-col">
                            <button
                              type="button"
                              aria-expanded={unfolded}
                              onClick={() => setFolds((f) => ({ ...f, [kind]: !unfolded }))}
                              className="flex cursor-pointer items-center gap-[var(--space-2)] rounded-[var(--radius-2)] px-[var(--space-2)] py-[var(--space-1)] hover:bg-[var(--color-surface-secondary-default)]"
                            >
                              <Icon slug={unfolded ? 'chevron-down' : 'chevron-right'} size={16} />
                              <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">{kind}</span>
                              <span className="type-label-m text-[var(--color-text-secondary-default)]">
                                {states.length}
                                {!unfolded && here && ` · ${state.label}`}
                              </span>
                            </button>
                            {unfolded && states.map((st) => (
                              <label
                                key={st.route}
                                className="flex cursor-pointer items-center gap-[var(--space-2)] rounded-[var(--radius-2)] py-[var(--space-1)] pl-[var(--space-8)] pr-[var(--space-2)] hover:bg-[var(--color-surface-secondary-default)]"
                              >
                                <RadioButton selected={st.route === state?.route} aria-label={st.label} onClick={() => go(st.route.slice(1))} />
                                <span className="type-body-s text-[var(--color-text-primary-default)]">{st.label}</span>
                              </label>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </Section>
                ) : (
                  <span className="type-body-s text-[var(--color-text-secondary-default)]">This screen has one state.</span>
                )}
              </>
            )}

            {shown === 'direction' && (
              <>
                <div className="flex flex-col gap-[var(--space-2)]">
                  <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">1. Channel layout</span>
                  <SegmentedTab
                    items={LAYOUTS.map((l) => l.label)}
                    selectedIndex={LAYOUTS.findIndex((l) => l.value === concept.layout)}
                    onSelect={(i) => setConcept({ layout: LAYOUTS[i].value })}
                  />
                </div>

                <div className="flex flex-col gap-[var(--space-2)]">
                  <span className="type-label-m-emphasized text-[var(--color-text-primary-default)]">2. Dynamic field</span>
                  <SegmentedTab
                    items={DIRECTIONS.map((d) => d.label)}
                    selectedIndex={DIRECTIONS.findIndex((d) => d.value === concept.picker)}
                    onSelect={(i) => setConcept({ picker: DIRECTIONS[i].value })}
                  />
                  {/* Placement wants the wider column; the shortcut's two options split it evenly. */}
                  <div
                    className={cn(
                      'grid gap-[var(--space-3)]',
                      concept.picker === 'shortcut' ? 'grid-cols-2' : 'grid-cols-[minmax(0,3fr)_minmax(0,2fr)]',
                    )}
                  >
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
                    {concept.picker === 'shortcut' && (
                      <Option label="Field in text">
                        <SegmentedTab
                          items={LOOKS.map((l) => l.label)}
                          selectedIndex={LOOKS.findIndex((l) => l.value === concept.look)}
                          onSelect={(i) => setConcept({ look: LOOKS[i].value })}
                        />
                      </Option>
                    )}
                    {concept.picker === 'shortcut' && concept.look === 'tint' && (
                      <Option label="Backspace on a field" wide>
                        <SegmentedTab
                          items={ERASES.map((x) => x.label)}
                          selectedIndex={ERASES.findIndex((x) => x.value === concept.erase)}
                          onSelect={(i) => setConcept({ erase: ERASES[i].value })}
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
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
