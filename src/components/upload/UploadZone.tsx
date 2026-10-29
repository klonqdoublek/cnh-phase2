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
 *   error       Negative border and fill, negative Ghost Button; an
 *               `errorHint` replaces the hint in Text/Negative, as CMS's
 *               "1 File Only" does
 *   refused     with `maxFiles`, a drag carrying more files than that shows
 *               the error look and `tooManyHint` while it is over the zone.
 *               Released outside, the zone goes back to its own look.
 *               Released on it, the drop still reaches `onFiles`, so the
 *               consumer can hold the error (Korarit's comment and the
 *               requester, 29 Oct 2026; was: the drop was refused with
 *               dropEffect none and the files flew back, design critique,
 *               20 Oct 2026)
 *
 * The whole zone opens the file chooser, not only its button (CMS v4.48);
 * the Ghost Button stays as the focusable control and its click bubbles up.
 */
export function UploadZone({
  buttonLabel,
  hint,
  accept,
  multiple = false,
  maxFiles,
  tooManyHint,
  error = false,
  errorHint,
  onFiles,
  className,
}: {
  buttonLabel: React.ReactNode
  /** One line, or an array for several lines. */
  hint?: React.ReactNode | React.ReactNode[]
  accept?: string
  multiple?: boolean
  /** A drag carrying more files than this shows the error look while it is over the zone. */
  maxFiles?: number
  /** Shown in Text/Negative while a refused drag is over the zone. */
  tooManyHint?: React.ReactNode
  error?: boolean
  /** Shown in place of the hint, in Text/Negative, while `error`. */
  errorHint?: React.ReactNode
  onFiles: (files: FileList | null) => void
  className?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [refused, setRefused] = useState(false)
  const tooMany = (data: DataTransfer) => maxFiles != null && data.items.length > maxFiles
  const errorLook = error || refused
  const shownErrorHint = refused ? tooManyHint : errorHint
  const showErrorHint = errorLook && shownErrorHint != null
  const hints = showErrorHint ? [shownErrorHint] : Array.isArray(hint) ? hint : hint != null ? [hint] : []

  return (
    <div
      onClick={(event) => {
        // The hidden input's own click bubbles here too; don't re-open from it.
        if (event.target !== input.current) input.current?.click()
      }}
      onDragOver={(event) => {
        event.preventDefault()
        const refuse = tooMany(event.dataTransfer)
        event.dataTransfer.dropEffect = 'copy'
        if (refused !== refuse) setRefused(refuse)
        if (!over) setOver(true)
      }}
      onDragLeave={(event) => {
        // Moving onto a child also fires dragleave; only leaving the zone counts.
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
        setOver(false)
        setRefused(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setOver(false)
        setRefused(false)
        onFiles(event.dataTransfer.files)
      }}
      className={cn(
        'flex min-h-[84px] cursor-pointer flex-col items-center justify-center gap-[var(--space-1)] rounded-2 border border-dashed p-[var(--space-3)] text-center',
        errorLook
          ? 'border-[var(--color-border-negative-default)] bg-[var(--color-surface-negative-default)]'
          : over
            ? 'border-[var(--color-border-highlight-default)] bg-[var(--color-surface-highlight-subtle-default)]'
            : 'border-[var(--color-border-highlight-default)] hover:bg-[var(--color-surface-highlight-subtle-default)]',
        className,
      )}
    >
      <GhostButton appearance={errorLook ? 'negative' : 'highlight'} padding="none">
        {buttonLabel}
      </GhostButton>
      {hints.map((line, i) => (
        <span
          key={i}
          className={cn(
            'type-body-xs',
            showErrorHint ? 'text-[var(--color-text-negative-default)]' : 'text-[var(--color-text-placeholder-default)]',
          )}
        >
          {line}
        </span>
      ))}
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
