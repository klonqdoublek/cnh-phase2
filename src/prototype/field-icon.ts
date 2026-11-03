/**
 * The dynamic field button's icon, four candidates drawn for CNH (design
 * critique with the lead design team, 3 Nov 2026: "try a syntax icon").
 * webds ships no wand, sparkle, braces or `</>` icon (gap), so these live in
 * `public/cnh-icons/` — not library artwork. `?dficon=` picks one so a link
 * opens it; `{x}` until the team chooses.
 */
export const FIELD_ICONS = ['braces-x', 'dollar-braces', 'braces', 'code'] as const
export type FieldIcon = (typeof FIELD_ICONS)[number]

const asked = new URLSearchParams(location.search).get('dficon')
export const fieldIcon: FieldIcon = (FIELD_ICONS as readonly string[]).includes(asked ?? '') ? (asked as FieldIcon) : 'braces-x'
