import { useSyncExternalStore } from 'react'

/* Prototype runner only — which direction draws Import's background processing
 * (BA / Dev, 28 Oct 2026: Import sends the file to a server and the templates
 * reach the list about 10 minutes later), so the requester can compare them
 * in one build. A–D come from the Mobbin research of 28 Oct 2026 and E, a
 * loading bar, from the requester (29 Oct 2026); A–D have their own section
 * on the Import file's UX Playground page. Kept in `?imp=` so a link opens a
 * direction. Not product UI: the chosen direction stays, this file goes. */

export type ImportDirection = 'A' | 'B' | 'C' | 'D' | 'E'

export const IMPORT_DIRECTIONS = [
  {
    id: 'A',
    label: 'A',
    name: 'Upload panel',
    note: 'A panel at the bottom right lists each file: Processing, Completed with its result and Download result, or Error with Try again. After Google Drive, Dropbox, Proton Drive, ElevenLabs.',
  },
  {
    id: 'B',
    label: 'B',
    name: 'Toast and Recent imports',
    note: 'A toast says the import is in progress, a Recent imports strip above the list carries each file’s status and opens its result in a drawer, and a toast says when it is done. After HubSpot, Klaviyo, Pipedrive, Attio.',
  },
  {
    id: 'C',
    label: 'C',
    name: 'Indicator beside Import',
    note: 'An icon beside Import spins while a file imports and turns to a mark when done; it opens a popover with the files, their results and Download result. After Safari downloads and Contractbook.',
  },
  {
    id: 'D',
    label: 'D',
    name: 'Dialog, then a toast',
    note: 'A dialog says it takes about 10 minutes and the page can be left; a toast says when it is done, with the result and Download result, and a dialog asks to try again if it fails. After Kit and Zendesk.',
  },
  {
    id: 'E',
    label: 'E',
    name: 'Loading bar',
    note: 'A block under the page header per file: an indeterminate loading bar while it imports (the server reports no percentage), then a full bar with the result and Download result, or Try again on an error. No toast. After Klaviyo and Cofounder.',
  },
] as const satisfies readonly { id: ImportDirection; label: string; name: string; note: string }[]

/** The Import file's UX Playground page, where each direction has a section. */
export const IMPORT_PLAYGROUND = 'https://www.figma.com/design/Yd9yyAx8ko3q2Atg0kfxe2/-CNH-Phase-2--Import-Template?node-id=201-9170'

const DEFAULT: ImportDirection = 'A'
const parse = (raw: string | null): ImportDirection => IMPORT_DIRECTIONS.find((d) => d.id === raw)?.id ?? DEFAULT

let current = parse(new URLSearchParams(location.search).get('imp'))
const listeners = new Set<() => void>()

export function setImportDirection(next: ImportDirection) {
  current = next
  const url = new URL(location.href)
  url.searchParams.set('imp', current)
  history.replaceState(history.state, '', url)
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useImportDirection = () => useSyncExternalStore(subscribe, () => current)
