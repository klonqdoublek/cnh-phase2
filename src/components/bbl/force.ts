/* Figma models state as a variant axis because it has to. The web has real
 * pseudo-classes, so `Hovered` and `Clicked` are :hover and :active in code —
 * which cannot be measured without a mouse. Components accept `data-force` and
 * apply the same declarations, so the harness can measure a hover state.
 *
 * This lives apart from `registry.tsx` for one reason: components import
 * `ForceState`, and `registry.tsx` imports every component. A registry item that
 * shipped its own import graph would drag the whole library along with it. */

export type ForceState = 'hovered' | 'clicked' | null

/** Map a Figma `State` variant value onto what the harness should force. */
export function forceFor(state: string | undefined): ForceState {
  if (state === 'Hovered') return 'hovered'
  if (state === 'Clicked' || state === 'Pressed') return 'clicked'
  return null
}
