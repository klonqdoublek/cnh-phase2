/* Broadcast routes that open straight into a state with fixed demo content
 * (`#/broadcast/create/<preset>`, `#/broadcast/<list preset>`). The wizard
 * agent ports the original's seeds (`formSeed`, CSVs) into this module. */

import type { ListToast } from './broadcast'

export const FORM_PRESETS = [
  'file-error',
  'cis',
  'direct',
  'errors',
  'draft-no-name',
  'filled',
  'quiet',
  'confirm',
  'submitting',
  'fail-dialog',
  'leave',
] as const
export type FormPreset = (typeof FORM_PRESETS)[number]

export const LIST_PRESETS = ['submitted', 'draft-saved'] as const
export type ListPreset = (typeof LIST_PRESETS)[number]

export const formPreset = (s?: string) =>
  (FORM_PRESETS as readonly string[]).includes(s ?? '') ? (s as FormPreset) : undefined
export const listPreset = (s?: string) =>
  (LIST_PRESETS as readonly string[]).includes(s ?? '') ? (s as ListPreset) : undefined

export const LIST_TOAST: Record<ListPreset, ListToast> = {
  submitted: { name: 'October Customer Campaign', draft: false },
  'draft-saved': { name: 'October Customer Campaign', draft: true },
}
