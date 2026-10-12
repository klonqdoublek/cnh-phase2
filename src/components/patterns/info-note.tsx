import { cn } from '@/lib/utils'
import { Icon } from '@/bbl/icon'

/* Info Note — measured on `Financial planning` (IfUYUQApZfEDkjIho9klKw), the
 * `Content` row above the Expense limit table (I8002:65951):
 *
 *   Icon/24px/General Icon/Information on Icon/Highlight · 8 · one run of Body S on
 *   Text/Primary · no surface, no border
 *
 * Not Inline Message: the library's set is one text run in Body XS/S with no icon
 * (`public/r/specs/inline-message.json`), and not Alert, which paints a surface. */
export type InfoNoteProps = {
  children: React.ReactNode
  className?: string
}

export function InfoNote({ children, className }: InfoNoteProps) {
  return (
    <div className={cn('webds-pattern-info-note', className)}>
      <Icon slug="information" size={24} color="var(--color-icon-highlight-default)" />
      <span className="webds-pattern-info-note-text">{children}</span>
    </div>
  )
}
