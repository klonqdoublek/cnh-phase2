import { cn } from '@/lib/utils'

/* Field Info — measured on `I4046:4425;5326:85426`.
 *
 * A definition-list row: the label sits on a fixed column so the values line up
 * down the card, and the value fills the rest. gap 8; label Emphasized, value
 * Regular; label column 112 in a card, 80 inside a table's expanded panel — the
 * two widths the file uses.
 *
 * The library's List Item is a *navigation* row (chevron, press state, 56 tall),
 * which is a different thing wearing a similar shape. */

export type FieldInfoSize = 'm' | 's'

/**
 * Which half of the row carries Medium.
 *
 * `label` is the CSP Portal reading this pattern was measured on, and stays the
 * default. `value` is not a variation someone wanted — it is what
 * `20260817_Customer Profile [NA]` draws on **every** pair of its Customer
 * profile page (`I6018:22271;7278:98369`, verified twice: `Body/Body S` resolves
 * to weight 400 on the label, `Body/Body S Emphasized` to 500 on the value).
 *
 * `none` — both halves Regular — is not new either: it is what Profile Summary
 * has always rendered, and that pattern now delegates its rows here instead of
 * drawing its own, which is how the two drifted apart in the first place.
 *
 * Three consuming files, three conventions, and a pattern is measured against a
 * consuming file — so this is a prop rather than a correction to any of them.
 * Before 2026-08-25 it was none of them, and that prototype composed the row by
 * hand instead.
 */
export type FieldInfoEmphasis = 'label' | 'value' | 'none'

/**
 * The label's colour. Primary is CSP Portal's.
 *
 * The Customer profile page uses BOTH of the others and keeps them apart on
 * purpose: Text/Secondary inside a Detail Box, Text/Tertiary in the profile card
 * above it. Passing the tone rather than a class keeps a caller from reaching for
 * an arbitrary colour.
 */
export type FieldInfoLabelTone = 'primary' | 'secondary' | 'tertiary'

const LABEL_TONE: Record<FieldInfoLabelTone, string> = {
  primary: 'webds-pattern-field-info--primary',
  secondary: 'webds-pattern-field-info--secondary',
  tertiary: 'webds-pattern-field-info--tertiary',
}

export type FieldInfoProps = {
  label: React.ReactNode
  value: React.ReactNode
  /** 112 in a card, 80 in a table panel — both from the file. */
  labelWidth?: number
  size?: FieldInfoSize
  /**
   * 8 everywhere in the CSP file; the Centralize Log file's compact Detail Box
   * (`3034:99172`) sets its rows 16 apart on an 80 column; Profile Summary's
   * groups sit their two halves 40 apart. All three are drawn.
   */
  gap?: 8 | 16 | 40
  emphasis?: FieldInfoEmphasis
  labelTone?: FieldInfoLabelTone
  /**
   * Cross-align the two halves. `start` is the file's default and the only one
   * that keeps a wrapping value's label at the top; `center` is what a row needs
   * when its value is a 28-tall Badge beside a 20-tall line of text, which is
   * how the Customer profile page draws every status row.
   */
  align?: 'start' | 'center'
  className?: string
}

export function FieldInfo({
  label,
  value,
  labelWidth = 112,
  size = 'm',
  gap = 8,
  emphasis = 'label',
  labelTone = 'primary',
  align = 'start',
  className,
}: FieldInfoProps) {
  /* Both weights are named outright rather than built by appending
     '-emphasized' to `role`. A concatenated class name cannot survive a rename
     — and Tailwind never generated it either, because its scanner only sees
     whole literals, so `emphasis` has been a no-op on this pattern. */
  const role = size === 'm' ? 'webds-pattern-field-info-role-t' : 'webds-pattern-field-info-role-f'
  const roleEmphasized = size === 'm' ? 'webds-pattern-field-info-role-emphasized-t' : 'webds-pattern-field-info-role-emphasized-f'
  return (
    <div
      className={cn(
        'webds-pattern-field-info',
        align === 'center' ? 'webds-pattern-field-info--s1' : 'webds-pattern-field-info--s2',
        gap === 40
          ? 'webds-pattern-field-info--s3'
          : gap === 16
            ? 'gap-[var(--space-4)]'
            : 'gap-[var(--space-2)]',
        className,
      )}
    >
      <span
        style={{ width: labelWidth }}
        className={cn(
          emphasis === 'label' ? roleEmphasized : role,
          'webds-pattern-field-info-2',
          LABEL_TONE[labelTone],
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          emphasis === 'value' ? roleEmphasized : role,
          'webds-pattern-field-info-3',
        )}
      >
        {value}
      </span>
    </div>
  )
}
