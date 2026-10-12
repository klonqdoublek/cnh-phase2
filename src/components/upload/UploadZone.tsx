import { useRef, useState } from 'react'
import { GhostButton } from '@/bbl/ghost-button'
import { cn } from '@/lib/cn'

/**
 * The file drop zone, taken from the CMS prototype's `EmptyAssetSlot`
 * (`~/kkdevmode/CMS/src/components/asset/EmptyAssetSlot.tsx`), so both
 * consoles upload the same way. webds ships no upload control — authored
 * from tokens and reported as a gap, as CMS does.
 *
 *   empty       dashed Border/Highlight, unfilled, a highlight Ghost Button
 *               over a Body XS hint in Text/Placeholder
 *   hover/drag  Surface/Highlight/Subtle
 *   error       Negative border and fill, negative Ghost Button
 *
 * The whole zone opens the file chooser, not only its button (CMS v4.48);
 * the Ghost Button stays as the focusable control and its click bubbles up.
 *
 * `layout="bar"` is the one-line form for adding more files once some are
 * picked (CNH Import, sized for 10–50 files): hint first, button after.
 */
export function UploadZone({
  buttonLabel,
  hint,
  accept,
  multiple = false,
  error = false,
  layout = 'slot',
  onFiles,
  className,
}: {
  buttonLabel: React.ReactNode
  /** One line, or an array for several lines. */
  hint?: React.ReactNode | React.ReactNode[]
  accept?: string
  multiple?: boolean
  error?: boolean
  layout?: 'slot' | 'bar'
  onFiles: (files: FileList | null) => void
  className?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const hints = Array.isArray(hint) ? hint : hint != null ? [hint] : []
  const bar = layout === 'bar'

  return (
    <div
      onClick={(event) => {
        // The hidden input's own click bubbles here too; don't re-open from it.
        if (event.target !== input.current) input.current?.click()
      }}
      onDragOver={(event) => {
        event.preventDefault()
        if (!over) setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setOver(false)
        onFiles(event.dataTransfer.files)
      }}
      className={cn(
        'flex cursor-pointer rounded-2 border border-dashed',
        bar
          ? 'items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-2)]'
          : 'min-h-[84px] flex-col items-center justify-center gap-[var(--space-1)] p-[var(--space-3)] text-center',
        error
          ? 'border-[var(--color-border-negative-default)] bg-[var(--color-surface-negative-default)]'
          : over
            ? 'border-[var(--color-border-highlight-default)] bg-[var(--color-surface-highlight-subtle-default)]'
            : 'border-[var(--color-border-highlight-default)] hover:bg-[var(--color-surface-highlight-subtle-default)]',
        className,
      )}
    >
      {!bar && (
        <GhostButton appearance={error ? 'negative' : 'highlight'} padding="none">
          {buttonLabel}
        </GhostButton>
      )}
      {hints.map((line, i) => (
        <span
          key={i}
          className={cn('type-body-xs text-[var(--color-text-placeholder-default)]', bar && 'min-w-px flex-1')}
        >
          {line}
        </span>
      ))}
      {bar && (
        <GhostButton appearance={error ? 'negative' : 'highlight'} padding="none">
          {buttonLabel}
        </GhostButton>
      )}
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(event) => {
          onFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}
