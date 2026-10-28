import { useSyncExternalStore } from 'react'

/* Prototype runner only — where Create broadcast warns that Do Not Disturb
 * covers every day, all day (BA / Dev sync, 28 Oct 2026). The sync asked for
 * two options to compare before dev confirms one: on the Do Not Disturb card
 * as soon as the periods add up to the whole week, or only once Submit is
 * pressed, in the confirm dialog. Either way the broadcast can still be
 * submitted. Kept in `?dndw=` so a link opens an option. Not product UI: the
 * chosen option stays, this file goes. */

export type DndWarning = 'inline' | 'submit'

const parse = (v: string | null): DndWarning => (v === 'submit' ? 'submit' : 'inline')

let current = parse(new URLSearchParams(location.search).get('dndw'))
const listeners = new Set<() => void>()

export function setDndWarning(next: DndWarning) {
  current = next
  const url = new URL(location.href)
  url.searchParams.set('dndw', next)
  history.replaceState(history.state, '', url)
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useDndWarning = () => useSyncExternalStore(subscribe, () => current)
