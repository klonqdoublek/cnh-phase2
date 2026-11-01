import { useSyncExternalStore } from 'react'
import type { FormSeed } from '@/data/broadcast-presets'

/* Prototype runner only — how many columns the seeded audience file has, so
 * the dynamic field (+ button per card and `$`, BA & Dev feedback, 30 Oct
 * 2026) can be judged with a few fields and with many. Switched from the
 * Prototype control's Audience file; kept in `?fields=` so a link opens it.
 * Until 30 Oct 2026 this file was `dynamic-field.ts`, which also held the
 * concept switcher (`?df=`) over the dynamic-field drafts. Not product UI. */

/** How many columns the seeded audience file has — how many fields to pick from. */
export type Columns = 'few' | 'many'

/** Fields the few-column file keeps after its ID column — the drafts' own four. */
export const FEW_FIELDS = 4

let current: Columns = new URLSearchParams(location.search).get('fields') === 'few' ? 'few' : 'many'
const listeners = new Set<() => void>()

export function setColumns(next: Columns) {
  current = next
  const url = new URL(location.href)
  url.searchParams.set('fields', next)
  history.replaceState(history.state, '', url)
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useColumns = () => useSyncExternalStore(subscribe, () => current)

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
