import { cn } from '@/lib/utils'

/* BBL Inline Message — `public/r/specs/inline-message.json`, 6 variants:
 * Appearance (Default / Negative / Positive) × Size (XS / S).
 *
 * One text run and nothing else. Size is a type role, not a scale factor —
 * XS is Body XS 12/16 and S is Body S 14/20, both bound in the file — and
 * Appearance only moves the colour.
 *
 * The frame's gap of 10 is carried even though it holds a single run: it is what
 * the file says, and the next thing put in this row would sit 10 from the text. */

export type InlineMessageAppearance = 'default' | 'negative' | 'positive'
export type InlineMessageSize = 'xs' | 's'

const COLOUR: Record<InlineMessageAppearance, string> = {
  default: 'webds-inline-message--default',
  negative: 'webds-inline-message--negative',
  positive: 'webds-inline-message--positive',
}

const TYPE: Record<InlineMessageSize, string> = {
  xs: 'webds-inline-message--xs',
  s: 'webds-inline-message--s',
}

export type InlineMessageProps = {
  appearance?: InlineMessageAppearance
  size?: InlineMessageSize
  children?: React.ReactNode
  className?: string
}

export function InlineMessage({
  appearance = 'default',
  size = 'xs',
  children,
  className,
}: InlineMessageProps) {
  return (
    <div className={cn('webds-inline-message', className)}>
      <span data-part="Message" className={cn(TYPE[size], COLOUR[appearance])}>
        {children}
      </span>
    </div>
  )
}
