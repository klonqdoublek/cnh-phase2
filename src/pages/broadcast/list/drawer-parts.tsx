import { Alert } from '@/bbl/alert'
import { Divider } from '@/bbl/divider'
import { Icon } from '@/bbl/icon'
import { cn } from '@/lib/cn'

/* A broadcast drawer section — the `detail-drawer` pattern's own section
 * (Divider · a 40-tall head with the 24 mark at gap 12 · [label, value] rows at
 * 200), plus the one thing the pattern has no slot for: a status note under a
 * section's rows. GAP: `DetailDrawer.sections` carries rows only, and the note
 * belongs to the FIRST section, so the sections are drawn here through the
 * pattern's `children` with the pattern's own values. */

export type DrawerSectionSpec = {
  title: string
  icon: string
  rows: [string, string][]
  note?: string
  /** Negative for a System error broadcast (27 Oct 2026), so the note reads
   *  with its red badge; Brand otherwise. */
  noteTone?: 'brand' | 'negative'
}

export function DrawerSection({ section, first }: { section: DrawerSectionSpec; first: boolean }) {
  return (
    <div className="flex flex-col">
      {/* The original keeps the first rule's space and hides its line. */}
      <Divider className={cn(first && 'invisible')} />
      <div className="flex h-[40px] items-center gap-[var(--space-3)] py-[var(--space-2)]">
        <Icon slug={section.icon} size={24} />
        <span className="type-label-xl-emphasized text-[var(--color-text-primary-default)]">{section.title}</span>
      </div>
      {section.rows.map(([label, value]) => (
        <div key={label} className="flex items-center gap-[var(--space-4)] py-[var(--space-1)]">
          <span className="w-[200px] shrink-0 pt-[var(--space-0-5)] type-body-m text-[var(--color-text-secondary-default)]">
            {label}
          </span>
          {/* `–` for a value the record does not carry; pre-line keeps a
              message's own line breaks. */}
          <span className="min-w-px flex-1 type-body-m break-words whitespace-pre-line text-[var(--color-text-primary-default)]">
            {value || '–'}
          </span>
        </div>
      ))}
      {section.note && (
        <Alert
          appearance={section.noteTone ?? 'brand'}
          icon={
            section.noteTone === 'negative' ? (
              <Icon slug="close-circle" size={24} color="var(--color-icon-negative-default)" />
            ) : (
              <Icon slug="information" size={24} color="var(--color-icon-highlight-default)" />
            )
          }
          description={section.note}
          className="mt-[var(--space-2)]"
        />
      )}
    </div>
  )
}

/** One fact in the header's 24 row: a 16 mark on Icon/Tertiary and Body S. */
export function Meta({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-[var(--space-1-5)] type-body-s text-[var(--color-text-tertiary-default)]">
      <Icon slug={icon} size={16} color="var(--color-icon-tertiary-default)" />
      <span>{label}</span>
    </span>
  )
}
