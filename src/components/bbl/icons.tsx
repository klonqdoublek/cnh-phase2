/* The BBL chevrons, verbatim from `public/webds-icons`.
 *
 * Each size is drawn separately in the library — the 16 is not the 24 scaled —
 * so both are here and neither stands in for the other. The shipped files bake a
 * colour in; these take it from a class so a component can bind the token the
 * spec names.
 *
 * `data-part` sits on the PATH, not the <svg>: the spec records the vector's own
 * box (a 16px chevron is 7.78 × 13.59 inside its 16 frame), and that is the
 * path's bounding box, not the frame's. */
import { cn } from '@/lib/utils'

export const CHEVRON = {
  'left-16':
    'M5.89006 8.00005L11.6951 2.19503L10.7051 1.20508L4.40513 7.50508L3.91016 8.00005L4.40513 8.49503L10.7051 14.795L11.6951 13.8051L5.89006 8.00005Z',
  'right-16':
    'M11.9149 8.49503L5.61495 14.795L4.625 13.8051L10.43 8.00005L4.625 2.19503L5.61495 1.20508L11.9149 7.50508L12.4099 8.00005L11.9149 8.49503Z',
  'down-16':
    'M7.50508 11.9149L1.20508 5.61495L2.19503 4.625L8.00005 10.43L13.8051 4.625L14.795 5.61495L8.49503 11.9149L8.00005 12.4099L7.50508 11.9149Z',
  /* NOTE — `up-16` is deliberately absent. Data Table's `ExpandingCell` draws a
     chevron-up, but it is a stroked three-point polyline it authored itself, not
     this file's filled compound path, so it cannot be lifted in here. The real
     `Icon/16px/Navigation/Chevron-Up` vector has not been exported from the
     library yet; until it is, rotate `down-16` 180° (which is what ExpandingCell
     effectively does) rather than adding a mirrored path by hand — a guessed
     vector is worse than a rotation, because it looks authoritative. */
  'left-24':
    'M15.6858 22.0288L5.65723 12.0003L15.6858 1.97168L16.8858 3.17168L8.05723 12.0003L16.8858 20.8288L15.6858 22.0288Z',
  'right-24':
    'M8.31426 22.0288L7.11426 20.8288L15.9428 12.0003L7.11426 3.17168L8.31426 1.97168L18.3428 12.0003L8.31426 22.0288Z',
} as const

export type ChevronName = keyof typeof CHEVRON

export function Chevron({
  name,
  className,
  part,
}: {
  name: ChevronName
  /** Fill class — the token the spec names for this icon. */
  className?: string
  /** The spec child this path implements, where the spec records one. */
  part?: string
}) {
  const size = name.endsWith('-24') ? 24 : 16
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden className="webds-chevron">
      <path data-part={part} d={CHEVRON[name]} className={cn(className)} />
    </svg>
  )
}

/* `Icon/16px/Others/Placeholder` — BBL's own swap-slot artwork, and what Badge
 * and Avatar are drawn with. Its path measures 13.6 × 13.6 inside the 16 frame,
 * which is the size the spec records for their `Union` child, so it is the icon
 * those components render until a caller passes another. */
export const PLACEHOLDER_ICON_PATH =
  'M1.2002 13V11.333H2.7998V13C2.7998 13.1105 2.88954 13.2002 3 13.2002H4.66699V14.7998H3C2.00589 14.7998 1.2002 13.9941 1.2002 13ZM9.66699 13.2002V14.7998H6.33301V13.2002H9.66699ZM13.2002 13V11.333H14.7998V13C14.7998 13.9941 13.9941 14.7998 13 14.7998H11.333V13.2002H13C13.1105 13.2002 13.2002 13.1105 13.2002 13ZM2.7998 6.33301V9.66699H1.2002V6.33301H2.7998ZM14.7998 6.33301V9.66699H13.2002V6.33301H14.7998ZM1.2002 3C1.2002 2.00589 2.00589 1.2002 3 1.2002H4.66699V2.7998H3C2.88954 2.7998 2.7998 2.88954 2.7998 3V4.66699H1.2002V3ZM13.2002 3C13.2002 2.88954 13.1105 2.7998 13 2.7998H11.333V1.2002H13C13.9941 1.2002 14.7998 2.00589 14.7998 3V4.66699H13.2002V3ZM9.66699 1.2002V2.7998H6.33301V1.2002H9.66699Z'

export function PlaceholderIcon({ className, part = 'Union' }: { className?: string; part?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="webds-placeholder-icon">
      <path data-part={part} d={PLACEHOLDER_ICON_PATH} className={cn(className)} />
    </svg>
  )
}

/* The 24px placeholder, whose vector measures 21.7 × 21.7 — the size Table's
   Icon cells and List's Icon rows record for their `Union`. */
export const PLACEHOLDER_ICON_24_PATH =
  'M1.15039 20V18.2227H2.84961V20C2.84961 20.6351 3.36487 21.1504 4 21.1504H5.77734V22.8496H4C2.42599 22.8496 1.15039 21.574 1.15039 20ZM11.1113 21.1504V22.8496H7.55566V21.1504H11.1113ZM16.4443 21.1504V22.8496H12.8887V21.1504H16.4443ZM21.1504 20V18.2227H22.8496V20C22.8496 21.574 21.574 22.8496 20 22.8496H18.2227V21.1504H20C20.6351 21.1504 21.1504 20.6351 21.1504 20ZM2.84961 12.8887V16.4443H1.15039V12.8887H2.84961ZM22.8496 12.8887V16.4443H21.1504V12.8887H22.8496ZM2.84961 7.55566V11.1113H1.15039V7.55566H2.84961ZM22.8496 7.55566V11.1113H21.1504V7.55566H22.8496ZM1.15039 4C1.15039 2.42599 2.42599 1.15039 4 1.15039H5.77734V2.84961H4C3.36487 2.84961 2.84961 3.36487 2.84961 4V5.77734H1.15039V4ZM21.1504 4C21.1504 3.36487 20.6351 2.84961 20 2.84961H18.2227V1.15039H20C21.574 1.15039 22.8496 2.42599 22.8496 4V5.77734H21.1504V4ZM11.1113 1.15039V2.84961H7.55566V1.15039H11.1113ZM16.4443 1.15039V2.84961H12.8887V1.15039H16.4443Z'

export function PlaceholderIcon24({ className, part = 'Union' }: { className?: string; part?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="webds-placeholder-icon24">
      <path data-part={part} d={PLACEHOLDER_ICON_24_PATH} className={cn(className)} />
    </svg>
  )
}
