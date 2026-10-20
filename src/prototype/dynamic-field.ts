import { useSyncExternalStore } from 'react'
import type { FormSeed } from '@/data/broadcast-presets'

/* Prototype runner only — which dynamic-field concept the Create broadcast
 * message area draws, so the requester can compare the drafts in one build
 * (20 Oct 2026). Three axes, each switchable on its own from the Concept
 * panel; the four drafts in "dynamic mapping field idea" (Figma section
 * 324:35732) are presets over them. Kept in `?df=` so a link opens a concept.
 * Not product UI: the chosen concept stays, this file goes. */

/** How a field is picked: chips always on show, a button that opens a menu,
 *  or a button that opens CMS's picker dialog. */
export type Picker = 'pills' | 'button' | 'dialog'
/** One picker for the whole message area, or one per channel card. */
export type Placement = 'shared' | 'channel'
/** Channel cards three across, or stacked full width as the CNH Template form. */
export type Layout = 'columns' | 'stacked'

/** How many columns the seeded audience file has — how many fields to pick from. */
export type Columns = 'few' | 'many'

/** The mark on the Add dynamic field buttons: the drafts' `+`, or `{ }` for
 *  "insert a field" (requester, 20 Oct 2026). */
export type Mark = 'plus' | 'braces'

export type Concept = { picker: Picker; placement: Placement; layout: Layout; columns: Columns; mark: Mark }

export const IDEAS = [
  { id: '1', label: 'Idea 1', note: 'Pills over the cards', node: '324-35734', concept: { picker: 'pills', placement: 'shared', layout: 'columns' } },
  { id: '1.2', label: 'Idea 1.2', note: 'Pills per card, CNH layout', node: '324-36348', concept: { picker: 'pills', placement: 'channel', layout: 'stacked' } },
  { id: '2', label: 'Idea 2', note: 'Add dynamic field button', node: '324-49318', concept: { picker: 'button', placement: 'shared', layout: 'columns' } },
  { id: '2.2', label: 'Idea 2.2', note: '+ button per card', node: '359-112101', concept: { picker: 'button', placement: 'channel', layout: 'columns' } },
] as const satisfies readonly { id: string; label: string; note: string; node: string; concept: Omit<Concept, 'columns' | 'mark'> }[]

/** Idea 3 / 3.2 — the requester's (20 Oct 2026): the button opens CMS's
 *  picker dialog (Link Document Type) instead of a menu, single pick. No
 *  Figma draft, so it is offered in both layouts. */
export const DIALOG_IDEAS = { shared: 'Idea 3', channel: 'Idea 3.2' } as const

/** The four picker × placement pairs — the panel lists them under each
 *  channel layout, named after the draft that draws them in that layout. */
export const VARIANTS = [
  { picker: 'pills', placement: 'shared', note: 'Pills, one set for all channels' },
  { picker: 'pills', placement: 'channel', note: 'Pills on each channel card' },
  { picker: 'button', placement: 'shared', note: 'Add dynamic field button + pop-up' },
  { picker: 'button', placement: 'channel', note: '+ button + pop-up on each card' },
  { picker: 'dialog', placement: 'shared', note: 'Add dynamic field button + dialog (CMS)' },
  { picker: 'dialog', placement: 'channel', note: '+ button + dialog (CMS) on each card' },
] as const satisfies readonly { picker: Picker; placement: Placement; note: string }[]

export const FIGMA_FILE = 'https://www.figma.com/design/u2fZplMakSiBhP7H4shMeV/-CNH-Phase-2--WIP_Broadcast-Message'

const DEFAULT: Concept = { ...IDEAS[0].concept, columns: 'many', mark: 'plus' }

const parse = (raw: string | null): Concept => {
  const [picker, placement, layout, columns, mark] = (raw ?? '').split('-')
  return {
    picker: picker === 'button' || picker === 'dialog' || picker === 'pills' ? picker : DEFAULT.picker,
    placement: placement === 'channel' ? 'channel' : placement === 'shared' ? 'shared' : DEFAULT.placement,
    layout: layout === 'stacked' ? 'stacked' : layout === 'columns' ? 'columns' : DEFAULT.layout,
    columns: columns === 'few' ? 'few' : columns === 'many' ? 'many' : DEFAULT.columns,
    mark: mark === 'braces' ? 'braces' : mark === 'plus' ? 'plus' : DEFAULT.mark,
  }
}

let current = parse(new URLSearchParams(location.search).get('df'))
let key = ''
let snapshot = current
const listeners = new Set<() => void>()

export function setConcept(next: Partial<Concept>) {
  current = { ...current, ...next }
  const url = new URL(location.href)
  url.searchParams.set('df', `${current.picker}-${current.placement}-${current.layout}-${current.columns}-${current.mark}`)
  history.replaceState(history.state, '', url)
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const read = () => {
  const k = `${current.picker}-${current.placement}-${current.layout}-${current.columns}-${current.mark}`
  if (k !== key) {
    key = k
    snapshot = current
  }
  return snapshot
}

export const useConcept = () => useSyncExternalStore(subscribe, read)

/** The draft a concept matches, if any — a mixed one matches none. */
export const ideaOf = (c: Omit<Concept, 'columns' | 'mark'>) =>
  IDEAS.find((i) => i.concept.picker === c.picker && i.concept.placement === c.placement && i.concept.layout === c.layout)

/** Fields the few-column file keeps after its ID column — the drafts' own four. */
export const FEW_FIELDS = 4

/** Few: the seeded file cut to its ID column and the next four, as the drafts
 *  draw it (CUSTOMER_NAME, ACCOUNT_NO, AMOUNT, PROMOTION_CODE). Many: the file
 *  as seeded — the 55-column one on every CIS preset. */
export const seedWithColumns = (columns: Columns) => (seed: FormSeed): FormSeed => {
  if (columns === 'many' || !seed.file) return seed
  const text = seed.file.text
    .split('\n')
    .map((line) => line.split(',').slice(0, FEW_FIELDS + 1).join(','))
    .join('\n')
  return { ...seed, file: { name: seed.file.name.replace('-large', ''), text } }
}
