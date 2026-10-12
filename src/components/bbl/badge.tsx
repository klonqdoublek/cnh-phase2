import { cn } from '@/lib/utils'
import { PlaceholderIcon } from './icons'

/* BBL Badge — `public/r/specs/badge.json`, 15 variants: `Type` (Accent /
 * Positive / Caution / Negative / Disabled) × `Size` (XS / S / M).
 *
 * A pill with a label and an icon, gap 4. Size moves the padding and the type
 * role — M is 6/12 with Body M, S and XS share 4/8 and differ only in role
 * (Body S against Body XS), which is why M is 34 tall, S 28 and XS 24.
 *
 * Type is five colour rows across three families at once: `Surface/*` for the
 * pill, `Text/*` for the label, `Icon/*` for the mark. Accent uses the Blue
 * accent row; Positive, Caution and Negative use their Strong text and icon
 * tokens on a plain surface.
 *
 * **The icon is `Others/Placeholder`** — BBL drew the swap slot itself in all
 * fifteen variants, and its vector is in the spec at 13.6 × 13.6, so the
 * component renders that artwork rather than leaving a hole the checker would
 * report. A caller passing `icon` replaces it. */

export type BadgeType = 'accent' | 'positive' | 'caution' | 'negative' | 'disabled'
export type BadgeSize = 'xs' | 's' | 'm'

const TYPE: Record<BadgeType, { surface: string; text: string; icon: string }> = {
  accent: {
    surface: 'webds-badge--accent-surface',
    text: 'webds-badge--accent-text',
    icon: 'webds-badge--accent-icon',
  },
  positive: {
    surface: 'webds-badge--positive-surface',
    text: 'webds-badge--positive-text',
    icon: 'webds-badge--positive-icon',
  },
  caution: {
    surface: 'webds-badge--caution-surface',
    text: 'webds-badge--caution-text',
    icon: 'webds-badge--caution-icon',
  },
  negative: {
    surface: 'webds-badge--negative-surface',
    text: 'webds-badge--negative-text',
    icon: 'webds-badge--negative-icon',
  },
  disabled: {
    surface: 'webds-badge--disabled-surface',
    text: 'webds-badge--disabled-text',
    icon: 'webds-badge--disabled-icon',
  },
}

const SIZE: Record<BadgeSize, { shell: string; type: string }> = {
  m: { shell: 'webds-badge--m-shell', type: 'webds-badge--m-type' },
  s: { shell: 'webds-badge--s-shell', type: 'webds-badge--s-type' },
  xs: { shell: 'webds-badge--xs-shell', type: 'webds-badge--xs-type' },
}

export type BadgeProps = {
  type?: BadgeType
  size?: BadgeSize
  /** Replaces the placeholder mark BBL drew. */
  icon?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function Badge({ type = 'accent', size = 'm', icon, children, className }: BadgeProps) {
  const t = TYPE[type]
  return (
    <span
      className={cn('webds-badge', SIZE[size].shell, t.surface, className)}
    >
      <span data-part="label" className={cn(SIZE[size].type, t.text)}>
        {children}
      </span>
      {icon ?? <PlaceholderIcon className={t.icon} />}
    </span>
  )
}
