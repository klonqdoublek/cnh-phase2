import { useSyncExternalStore } from 'react'

/* Prototype runner only — where the Import Template page is reached from.
 * `side`: its own item in the sidebar, under Notification management (BA & Dev
 * deck, 30 Oct 2026; order set 2 Nov 2026). `menu`: no sidebar item; the Import
 * button on Notification management opens a menu with Import file and Import
 * Template, as CMS's Create menu (requester, 2 Nov 2026, a second option to
 * compare). Switched from the Prototype control's Import Template entry; kept
 * in `?nav=` so a link opens it. `#/list/import-menu` shows the menu open on
 * its own. Not product UI. */

export type ImportAccess = 'side' | 'menu'

let current: ImportAccess = new URLSearchParams(location.search).get('nav') === 'menu' ? 'menu' : 'side'
const listeners = new Set<() => void>()

export function setImportAccess(next: ImportAccess) {
  current = next
  const url = new URL(location.href)
  url.searchParams.set('nav', next)
  history.replaceState(history.state, '', url)
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useImportAccess = () => useSyncExternalStore(subscribe, () => current)
