import { cn } from '@/lib/utils'

/* Status Badge — measured on the CSP Portal file, node `I4046:4425;5063:49891`.
 *
 * **Not the library's Badge.** That one ships a single accent row (Blue), always
 * draws an icon, and puts its label on the Body roles. These screens need the
 * other accent rows, no icon, and the Label roles:
 *
 *   px 8 · py 4 · radius Full · Surface/Accent/<tone>/Default
 *   size l → Label L (14/20), used beside a heading
 *   size m → Label M (12/16), used inside a table cell
 *
 * Every value is a token; the only thing invented here is the prop names. */

export type StatusTone =
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'grey'
  | 'negative'
  | 'positive'

export type StatusSize = 'l' | 'm'

const TONE: Record<StatusTone, string> = {
  red: 'webds-pattern-status-badge--red',
  green:
    'webds-pattern-status-badge--green',
  yellow:
    'webds-pattern-status-badge--yellow',
  blue: 'webds-pattern-status-badge--blue',
  grey: 'webds-pattern-status-badge--grey',
  /* The semantic rows, added after Centralize Log's log table
     (`bsX2GSAKESIIQi5xLsF1u2` · `I6145:11243;7080:31792`) turned out to paint
     **Surface/Negative** + **Text/Negative/Strong** for Fail and
     **Surface/Positive** + **Text/Positive/Strong** for Success — not the accent
     rows above. Two files, two vocabularies for the same idea; both are kept
     because both are what their file binds. */
  negative:
    'webds-pattern-status-badge--negative',
  positive:
    'webds-pattern-status-badge--positive',
}

const SIZE: Record<StatusSize, string> = {
  l: 'webds-pattern-status-badge--l',
  m: 'webds-pattern-status-badge--m',
}

export type StatusBadgeProps = {
  tone?: StatusTone
  size?: StatusSize
  children?: React.ReactNode
  className?: string
}

export function StatusBadge({ tone = 'grey', size = 'l', children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        /* A pill hugs its label and overhangs rather than wrapping — Centralize
           Log's Success badge is 61 in a 60 column and the file lets it out. */
        'webds-pattern-status-badge',
        SIZE[size],
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
