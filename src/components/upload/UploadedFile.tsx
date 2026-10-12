import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { cn } from '@/lib/cn'

/**
 * A picked file, taken from the CMS prototype's `UploadedAssetSlot`
 * (`~/kkdevmode/CMS/src/components/asset/UploadedAssetSlot.tsx`): the file
 * name (Body S Emphasized) and a highlight trash mark on the first row, its
 * meta (Body XS, Text/Placeholder) on the second, with an optional status at
 * the right. In error the border turns Negative and the meta reads in
 * Text/Negative.
 *
 * `density="row"` is the one-line form for a list of many files (CNH Import):
 * same type and trash mark, no box, a rule under each row.
 */
export function UploadedFile({
  name,
  meta,
  status,
  error = false,
  density = 'slot',
  onRemove,
}: {
  name: string
  meta?: React.ReactNode
  /** Right of the meta — e.g. "File validated". */
  status?: React.ReactNode
  error?: boolean
  density?: 'slot' | 'row'
  onRemove?: () => void
}) {
  const remove = onRemove && (
    <IconButton
      label={`Remove ${name}`}
      icon={<Icon slug="trash" size={16} color="var(--color-icon-highlight-default)" />}
      onClick={onRemove}
    />
  )
  const metaText = meta != null && (
    <span
      title={typeof meta === 'string' ? meta : undefined}
      className={cn(
        'min-w-px truncate type-body-xs',
        error ? 'text-[var(--color-text-negative-default)]' : 'text-[var(--color-text-placeholder-default)]',
      )}
    >
      {meta}
    </span>
  )

  if (density === 'row')
    return (
      <div className="flex min-h-[40px] items-center gap-[var(--space-3)] py-[var(--space-1)] shadow-[inset_0_-1px_0_0_var(--color-border-primary-default)]">
        <span title={name} className="min-w-[120px] flex-1 basis-0 truncate type-body-s-emphasized text-[var(--color-text-primary-default)]">
          {name}
        </span>
        <span className="flex max-w-[60%] justify-end">{metaText}</span>
        {status}
        {remove}
      </div>
    )

  return (
    <div
      data-invalid={error ? 'true' : undefined}
      className={cn(
        'flex flex-col justify-between gap-[var(--space-2)] rounded-2 border p-[var(--space-3)]',
        error ? 'border-[var(--color-border-negative-default)]' : 'border-[var(--color-border-primary-default)]',
      )}
    >
      <span className="flex items-center gap-[var(--space-2)]">
        <span title={name} className="min-w-px flex-1 truncate type-body-s-emphasized text-[var(--color-text-primary-default)]">
          {name}
        </span>
        {remove}
      </span>
      <span className="flex items-center gap-[var(--space-4)]">
        <span className="flex min-w-px flex-1">{metaText}</span>
        {status}
      </span>
    </div>
  )
}
