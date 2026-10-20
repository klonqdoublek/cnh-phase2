import { useSyncExternalStore } from 'react'

/* Prototype runner only — which dynamic-field concept the Create broadcast
 * message area draws, so the requester can compare the drafts in one build
 * (20 Oct 2026). Three axes, each switchable on its own from the Concept
 * panel; the four drafts in "dynamic mapping field idea" (Figma section
 * 324:35732) are presets over them. Kept in `?df=` so a link opens a concept.
 * Not product UI: the chosen concept stays, this file goes. */

/** How a field is picked: chips always on show, or a button that opens a menu. */
export type Picker = 'pills' | 'button'
/** One picker for the whole message area, or one per channel card. */
export type Placement = 'shared' | 'channel'
/** Channel cards three across, or stacked full width as the CNH Template form. */
export type Layout = 'columns' | 'stacked'

export type Concept = { picker: Picker; placement: Placement; layout: Layout }

export const IDEAS = [
  { id: '1', label: 'Idea 1', note: 'Pills over the cards', node: '324-35734', concept: { picker: 'pills', placement: 'shared', layout: 'columns' } },
  { id: '1.2', label: 'Idea 1.2', note: 'Pills per card, CNH layout', node: '324-36348', concept: { picker: 'pills', placement: 'channel', layout: 'stacked' } },
  { id: '2', label: 'Idea 2', note: 'Add dynamic field button', node: '324-49318', concept: { picker: 'button', placement: 'shared', layout: 'columns' } },
  { id: '2.2', label: 'Idea 2.2', note: '+ button per card', node: '359-112101', concept: { picker: 'button', placement: 'channel', layout: 'columns' } },
] as const satisfies readonly { id: string; label: string; note: string; node: string; concept: Concept }[]

/** The four picker × placement pairs — the panel lists them under each
 *  channel layout, named after the draft that draws them in that layout. */
export const VARIANTS = [
  { picker: 'pills', placement: 'shared', note: 'Pills, one set for all channels' },
  { picker: 'pills', placement: 'channel', note: 'Pills on each channel card' },
  { picker: 'button', placement: 'shared', note: 'Add dynamic field button + pop-up' },
  { picker: 'button', placement: 'channel', note: '+ button + pop-up on each card' },
] as const satisfies readonly { picker: Picker; placement: Placement; note: string }[]

export const FIGMA_FILE = 'https://www.figma.com/design/u2fZplMakSiBhP7H4shMeV/-CNH-Phase-2--WIP_Broadcast-Message'

const DEFAULT: Concept = IDEAS[0].concept

const parse = (raw: string | null): Concept => {
  const [picker, placement, layout] = (raw ?? '').split('-')
  return {
    picker: picker === 'button' ? 'button' : picker === 'pills' ? 'pills' : DEFAULT.picker,
    placement: placement === 'channel' ? 'channel' : placement === 'shared' ? 'shared' : DEFAULT.placement,
    layout: layout === 'stacked' ? 'stacked' : layout === 'columns' ? 'columns' : DEFAULT.layout,
  }
}

let current = parse(new URLSearchParams(location.search).get('df'))
let key = ''
let snapshot = current
const listeners = new Set<() => void>()

export function setConcept(next: Partial<Concept>) {
  current = { ...current, ...next }
  const url = new URL(location.href)
  url.searchParams.set('df', `${current.picker}-${current.placement}-${current.layout}`)
  history.replaceState(history.state, '', url)
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const read = () => {
  const k = `${current.picker}-${current.placement}-${current.layout}`
  if (k !== key) {
    key = k
    snapshot = current
  }
  return snapshot
}

export const useConcept = () => useSyncExternalStore(subscribe, read)

/** The draft a concept matches, if any — a mixed one matches none. */
export const ideaOf = (c: Concept) =>
  IDEAS.find((i) => i.concept.picker === c.picker && i.concept.placement === c.placement && i.concept.layout === c.layout)
