import { BROADCASTS, hasDeliveryReport } from '@/data/broadcast'
import flow from './flow-cnh-phase2.json'

/* Prototype runner only — the states each screen can be opened in, so the
 * Prototype control's Screen state group can switch the screen on show into
 * its loading, error, empty and dialog states (requester, 20 Oct 2026; brought
 * up to the 28 Oct routes). Every state is a route App.tsx already draws; this
 * file only lists them. A label comes from the webds flow archive (cnh-phase2)
 * when the archive draws that route, else it is composed here. Not product UI. */

export type Kind = 'Default' | 'Data' | 'Loading' | 'Empty' | 'Error' | 'Dialog' | 'Toast'
export const KINDS: readonly Kind[] = ['Default', 'Data', 'Loading', 'Empty', 'Error', 'Dialog', 'Toast']

export type ScreenState = { route: string; label: string; kind: Kind }
export type Screen = { name: string; states: ScreenState[] }

/** The archive's label up to its first " — ", keyed by route. */
const FLOW_LABEL = new Map(
  (flow.nodes as { route?: string; label: string }[]).filter((n) => n.route).map((n) => [n.route!, n.label.split(' — ')[0]]),
)

/** `own` keeps the label given here where the archive's head would only repeat the screen name or another state's. */
const s = (route: string, kind: Kind, label: string, own = false): ScreenState => ({
  route,
  kind,
  label: own ? label : (FLOW_LABEL.get(route) ?? label),
})

const NOTIFICATION_LIST: Screen = {
  name: 'Notification list',
  states: [
    s('#/list', 'Default', 'The list'),
    s('#/list/loading', 'Loading', 'Loading'),
    s('#/list/error', 'Error', 'Unable to get information'),
    s('#/list/empty', 'Empty', 'No templates'),
  ],
}

const IMPORT: Screen = {
  name: 'Import templates',
  states: [
    s('#/list/import', 'Default', 'Import dialog'),
    s('#/list/import/selected', 'Data', 'File selected'),
    s('#/list/import/uploading', 'Loading', 'Uploading'),
    s('#/list/import/no-file', 'Error', 'Import pressed with no file'),
    s('#/list/import/too-many', 'Error', 'More than one file dropped'),
    s('#/list/import/too-large', 'Error', 'File over 10 MB'),
    s('#/list/import/failure', 'Error', 'Import failure'),
    s('#/list/import/duplicate', 'Dialog', 'Replace imported templates?'),
    s('#/list/import/success', 'Toast', 'Import success'),
  ],
}

const CREATE_NOTIFICATION: Screen = {
  name: 'Create notification',
  states: [
    s('#/create', 'Default', 'Empty form'),
    s('#/create/loading', 'Loading', 'Loading'),
    s('#/create/fail', 'Error', 'Save fails on the next press'),
  ],
}

const editBroadcast = (id: string): Screen => ({
  name: 'Edit broadcast',
  states: [
    s(`#/broadcast/edit/${id}`, 'Default', 'The draft'),
    s(`#/broadcast/edit/${id}/loading`, 'Loading', 'Loading'),
    s(`#/broadcast/edit/${id}/fail`, 'Error', 'Submit fails on the next press'),
  ],
})

const editNotification = (id: string): Screen => ({
  name: 'Edit notification',
  states: [s(`#/edit/${id}`, 'Default', 'The record'), s(`#/edit/${id}/fail`, 'Error', 'Save fails on the next press')],
})

const BROADCAST_LIST: Screen = {
  name: 'Broadcast list',
  states: [
    s('#/broadcast', 'Default', 'Broadcast list'),
    s('#/broadcast/loading', 'Loading', 'Loading'),
    s('#/broadcast/empty', 'Empty', 'No broadcasts'),
    s('#/broadcast/error', 'Error', 'Unable to get information'),
    s('#/broadcast/download/fail', 'Error', 'Download fails on the next press'),
    s('#/broadcast/download', 'Dialog', 'Download the delivery report?'),
    s('#/broadcast/submitted', 'Toast', 'Broadcast submitted'),
    s('#/broadcast/draft-saved', 'Toast', 'Draft saved'),
    s('#/broadcast/cancelled', 'Toast', 'Broadcast cancelled'),
    s('#/broadcast/download-success', 'Toast', 'Download Success'),
    s('#/broadcast/download-failed', 'Toast', 'Unable to download'),
  ],
}

/** The drawer over the list: Cancel's states on a Draft, Download's where there is a report. */
const broadcastDetail = (id: string): Screen => {
  const b = BROADCASTS.find((x) => x.id === id)
  const view = `#/broadcast/view/${id}`
  return {
    name: `Broadcast ${id}`,
    states: [
      s(view, 'Default', 'Opened', true),
      ...(b?.status === 'Draft'
        ? [s(`${view}/cancel-fail`, 'Error', 'Unable to cancel the broadcast', true), s(`${view}/cancel`, 'Dialog', 'Cancel this broadcast?', true)]
        : []),
      ...(b && hasDeliveryReport(b)
        ? [
            s(`${view}/download/fail`, 'Error', 'Download fails on the next press', true),
            s(`${view}/download`, 'Dialog', 'Download the delivery report?', true),
          ]
        : []),
    ],
  }
}

const CREATE_BROADCAST: Screen = {
  name: 'Create broadcast',
  states: [
    s('#/broadcast/create', 'Default', 'Empty', true),
    s('#/broadcast/create/cis', 'Data', 'CIS ID'),
    s('#/broadcast/create/email', 'Data', 'Email'),
    s('#/broadcast/create/sms', 'Data', 'SMS'),
    s('#/broadcast/create/step1-filled', 'Data', 'Step 1 filled'),
    s('#/broadcast/create/filled', 'Data', 'Filled'),
    s('#/broadcast/create/quiet', 'Data', 'Start in the quiet period'),
    s('#/broadcast/create/dnd-rules', 'Data', 'Start on a weekend, BA DND rules'),
    s('#/broadcast/create/dnd-all-week', 'Data', 'DND every day, all day'),
    s('#/broadcast/create/dnd-all-week-confirm', 'Dialog', 'DND every day, all day: Submit'),
    s('#/broadcast/create/end', 'Data', 'Broadcast End set'),
    s('#/broadcast/create/large-file', 'Data', 'Large file, 100 × 55'),
    s('#/broadcast/create/loading', 'Loading', 'Loading'),
    s('#/broadcast/create/checking', 'Loading', 'Checking file…'),
    s('#/broadcast/create/submitting', 'Loading', 'Submitting'),
    s('#/broadcast/create/file-error', 'Error', 'File cannot be read'),
    s('#/broadcast/create/wrong-column', 'Error', 'Wrong recipient column (proposal)'),
    s('#/broadcast/create/errors', 'Error', 'Every section marked'),
    s('#/broadcast/create/no-channel', 'Error', 'Step 1 filled, Submit pressed'),
    s('#/broadcast/create/channel-typing', 'Error', 'A channel on and typed in'),
    s('#/broadcast/create/channel-errors', 'Error', 'Channel typed in, Submit pressed'),
    s('#/broadcast/create/draft-no-name', 'Error', 'Name needed for a draft'),
    s('#/broadcast/create/file-blocked', 'Error', 'The audience file cannot be used'),
    s('#/broadcast/create/check-fail', 'Error', 'Unable to submit, file check failed', true),
    s('#/broadcast/create/fail', 'Error', 'Submit fails on the next press'),
    s('#/broadcast/create/fail-dialog', 'Error', 'Unable to submit'),
    s('#/broadcast/create/confirm', 'Dialog', 'Submit this broadcast?'),
    s('#/broadcast/create/confirm-invalid', 'Dialog', 'Submit this broadcast?, invalid rows skipped', true),
    s('#/broadcast/create/leave', 'Dialog', 'Leave this page?'),
  ],
}

/** The screen a route belongs to, or null when it has no other state. */
export function screenOf(hash: string): Screen | null {
  if (hash === '' || hash === '#/' || /^#\/list(\/(loading|error|empty))?$/.test(hash)) return NOTIFICATION_LIST
  if (/^#\/list\/import(\/[a-z-]+)?$/.test(hash)) return IMPORT
  if (/^#\/create(\/[a-z]+)?$/.test(hash)) return CREATE_NOTIFICATION
  const edit = hash.match(/^#\/edit\/([^/]+)/)
  if (edit) return editNotification(edit[1])
  if (/^#\/broadcast(\/(loading|error|empty|submitted|draft-saved|cancelled|download(\/fail)?|download-success|download-failed))?$/.test(hash))
    return BROADCAST_LIST
  const editB = hash.match(/^#\/broadcast\/edit\/([A-Z]+-\d+)/)
  if (editB) return editBroadcast(editB[1])
  const view = hash.match(/^#\/broadcast\/view\/([A-Z]+-\d+)/)
  if (view) {
    const detail = broadcastDetail(view[1])
    return detail.states.length > 1 ? detail : null
  }
  if (/^#\/broadcast\/create(\/[a-z0-9-]+)?$/.test(hash)) return CREATE_BROADCAST
  return null
}

/** The state on show: an exact route, the bare list for `#/`, the initial import for `/initial`. */
export const stateOf = (screen: Screen, hash: string) => {
  const h = hash === '' || hash === '#/' ? '#/list' : hash === '#/list/import/initial' ? '#/list/import' : hash
  return screen.states.find((st) => st.route === h)
}
