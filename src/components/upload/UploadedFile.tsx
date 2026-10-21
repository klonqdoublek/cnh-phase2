import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { OutlineButton } from '@/bbl/outline-button'
import { cn } from '@/lib/cn'

/**
 * A picked file, taken from the CMS prototype's `UploadedAssetSlot`
 * (`~/kkdevmode/CMS/src/components/asset/UploadedAssetSlot.tsx`, board
 * `1552:262191`): an 84-tall bordered slot with the file name (Body S
 * Emphasized) and a highlight trash mark on the first row, its meta (Body XS,
 * Text/Placeholder) and an Outline **Preview** (28) on the second, with an
 * optional status before the Preview.
 *
 * In error the border turns Negative and `errorMessage` sits under the slot
 * in Body XS, Text/Negative, as CMS draws its oversize hint. Without an
 * `errorMessage` the meta itself reads in Text/Negative (the Audience file's
 * older form).
 *
 * `errorPlacement="slot"` is CMS's `State=Error (upload failed)` (CMS file
 * `MI2zFydRz9Qi673VeklnkI`, node `136:92553`): the message takes the meta's
 * place on the second row in Body XS, Text/Negative, the Preview goes, and
 * `onRetry` adds a highlight Ghost Button (padding none) at the row's end —
 * CMS's "Try again". Without `onRetry` there is no button (a file over the
 * size limit cannot be retried).
 */
export function UploadedFile({
  name,
  meta,
  status,
  error = false,
  errorMessage,
  errorPlacement = 'below',
  retryLabel = 'Try again',
  onRetry,
  previewLabel = 'Preview',
  onPreview,
  onRemove,
}: {
  name: string
  meta?: React.ReactNode
  /** Right of the meta — e.g. "File validated". */
  status?: React.ReactNode
  error?: boolean
  /** Under the slot, in Text/Negative, when `error`. */
  errorMessage?: React.ReactNode
  /** `below` the slot, or in the `slot`'s second row in place of the meta (CMS upload failed). */
  errorPlacement?: 'below' | 'slot'
  retryLabel?: React.ReactNode
  /** With `errorPlacement="slot"`, shows the Ghost retry button. */
  onRetry?: () => void
  previewLabel?: React.ReactNode
  /** Shows the Outline Preview button. */
  onPreview?: () => void
  onRemove?: () => void
}) {
  const metaInRed = error && errorMessage == null
  const inSlot = error && errorMessage != null && errorPlacement === 'slot'
  return (
    <div className="flex flex-col gap-[var(--space-1)]">
      <div
        data-invalid={error ? 'true' : undefined}
        className={cn(
          'flex min-h-[84px] flex-col justify-between gap-[var(--space-2)] rounded-2 border p-[var(--space-3)]',
          error ? 'border-[var(--color-border-negative-default)]' : 'border-[var(--color-border-primary-default)]',
        )}
      >
        <span className="flex items-center gap-[var(--space-2)]">
          <span title={name} className="min-w-px flex-1 truncate type-body-s-emphasized text-[var(--color-text-primary-default)]">
            {name}
          </span>
          {onRemove && (
            <IconButton
              label={`Remove ${name}`}
              icon={<Icon slug="trash" size={16} color="var(--color-icon-highlight-default)" />}
              onClick={onRemove}
            />
          )}
        </span>
        {inSlot ? (
          <span className="flex items-center gap-[var(--space-4)]">
            <span role="alert" className="min-w-px flex-1 type-body-xs text-[var(--color-text-negative-default)]">
              {errorMessage}
            </span>
            {onRetry && (
              <GhostButton appearance="highlight" padding="none" onClick={onRetry}>
                {retryLabel}
              </GhostButton>
            )}
          </span>
        ) : (
          <span className="flex items-center gap-[var(--space-4)]">
            <span
              title={typeof meta === 'string' ? meta : undefined}
              className={cn(
                'min-w-px flex-1 truncate type-body-xs',
                metaInRed ? 'text-[var(--color-text-negative-default)]' : 'text-[var(--color-text-placeholder-default)]',
              )}
            >
              {meta}
            </span>
            {status}
            {onPreview && (
              <OutlineButton className="h-[28px]" onClick={onPreview}>
                {previewLabel}
              </OutlineButton>
            )}
          </span>
        )}
      </div>
      {error && errorMessage != null && !inSlot && (
        <span className="type-body-xs text-[var(--color-text-negative-default)]">{errorMessage}</span>
      )}
    </div>
  )
}
