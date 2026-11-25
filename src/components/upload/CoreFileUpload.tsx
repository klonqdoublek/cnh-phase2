import { useRef } from 'react'
import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { InlineMessage } from '@/bbl/inline-message'
import { cn } from '@/lib/cn'

/**
 * File Upload, the Core Website Design Library's set (component set key
 * `65a09f4aea85f32940fb928d61eaa293de148ee4`, 10 states), as the Import
 * Template Figma file places it. webds does not ship this set (gap, webds
 * 1.1.3): its `file-upload` pattern is CMS's consumer-measured slot (84 tall,
 * a Ghost Button over the hint), a different anatomy. This is authored from
 * tokens off the Figma spec and replaces the CMS slot for Import (requester,
 * 24 Nov 2026). Named Core… so the audit does not read it as that pattern.
 *
 * One component, two looks:
 *   zone (no file)   100 tall, padding 16, Radius 2, dashed border, centred
 *                    Title (Label XL Emphasized, Text/Highlight) over
 *                    Description (Body XS, Text/Tertiary)
 *     default        Border/Primary dashed, Surface/Primary; hover
 *                    Surface/Primary/Hovered (State=Hovered - Mouse)
 *     error          Border/Negative dashed
 *     disabled       Border/Disabled/Subtlest, Surface/Disabled, Text/Disabled
 *   slot (a file)    100 tall, padding 16, solid border, file name (Body S
 *                    Emphasized) and a Highlight Icon Button 16 (trash) on row
 *                    one, Sub-detail (Body XS) under it; the metadata (Body XS,
 *                    Text/Tertiary) and a Highlight Ghost Button (padding none)
 *                    at the foot
 *     upload-success Border/Primary
 *     upload-error   Border/Negative
 *     read-only      no remove
 * An Inline Message XS under either look (Has Inline Message): Negative on
 * `error` and `upload-error`.
 *
 * Not built: Label (Has Label, off in Import), Uploading (progress bar),
 * Hovered - File and Hovered - File Invalid (drag states), the Files list.
 * No drag and drop (BA Natsinee, 18 Nov 2026, as Broadcast): files come from
 * the chooser only, and a file dragged over shows the no-drop cursor instead
 * of the browser opening it.
 */
export type FileUploadState = 'default' | 'error' | 'disabled' | 'upload-success' | 'upload-error' | 'read-only'

export function FileUpload({
  state = 'default',
  title,
  description,
  accept,
  onFiles,
  fileName,
  subDetail,
  fileMetadata,
  actionLabel,
  onAction,
  onRemove,
  inlineMessage,
  className,
}: {
  state?: FileUploadState
  /** Zone: the chooser's call to action, e.g. "Browse file". */
  title?: React.ReactNode
  /** Zone: the line under the title. */
  description?: React.ReactNode
  accept?: string
  /** Zone: the file the chooser returns (one file, no `multiple`). */
  onFiles?: (files: FileList | null) => void
  /** Slot: the picked file. */
  fileName?: string
  subDetail?: React.ReactNode
  fileMetadata?: React.ReactNode
  /** Slot: the Ghost Button at the foot (Has Action), shown with `onAction`. */
  actionLabel?: React.ReactNode
  onAction?: () => void
  /** Slot: the trash mark; not on `read-only`. */
  onRemove?: () => void
  /** Under the component (Has Inline Message). */
  inlineMessage?: React.ReactNode
  className?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const slot = state === 'upload-success' || state === 'upload-error' || state === 'read-only'
  const disabled = state === 'disabled'
  const negative = state === 'error' || state === 'upload-error'
  /* No drop target: stop the browser opening a dragged file, and show no-drop. */
  const noDrop = {
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'none'
    },
    onDrop: (event: React.DragEvent) => event.preventDefault(),
  }

  return (
    <div className={cn('flex flex-col gap-[var(--space-1)]', className)}>
      {slot ? (
        <div
          {...noDrop}
          data-invalid={negative ? 'true' : undefined}
          className={cn(
            'flex min-h-[100px] flex-col justify-between gap-[var(--space-2)] rounded-2 border bg-[var(--color-surface-primary-default)] p-[var(--space-4)]',
            negative ? 'border-[var(--color-border-negative-default)]' : 'border-[var(--color-border-primary-default)]',
          )}
        >
          <span className="flex flex-col gap-[var(--space-0-5)]">
            <span className="flex items-center gap-[var(--space-2)]">
              <span title={fileName} className="min-w-px flex-1 truncate type-body-s-emphasized text-[var(--color-text-primary-default)]">
                {fileName}
              </span>
              {onRemove && state !== 'read-only' && (
                <IconButton
                  appearance="highlight"
                  size={16}
                  label={`Remove ${fileName ?? 'file'}`}
                  icon={<Icon slug="trash" size={16} color="var(--color-icon-highlight-default)" />}
                  onClick={onRemove}
                />
              )}
            </span>
            {subDetail != null && <span className="type-body-xs text-[var(--color-text-tertiary-default)]">{subDetail}</span>}
          </span>
          <span className="flex items-end gap-[var(--space-4)]">
            <span className="min-w-px flex-1 truncate type-body-xs text-[var(--color-text-tertiary-default)]">{fileMetadata}</span>
            {onAction && (
              <GhostButton appearance="highlight" padding="none" onClick={onAction}>
                {actionLabel}
              </GhostButton>
            )}
          </span>
        </div>
      ) : (
        <div
          {...noDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          data-invalid={negative ? 'true' : undefined}
          onClick={(event) => {
            // The hidden input's own click bubbles here too; don't re-open from it.
            if (!disabled && event.target !== input.current) input.current?.click()
          }}
          onKeyDown={(event) => {
            if (disabled || (event.key !== 'Enter' && event.key !== ' ')) return
            event.preventDefault()
            input.current?.click()
          }}
          className={cn(
            'flex min-h-[100px] flex-col items-center justify-center gap-[var(--space-1)] rounded-2 border border-dashed p-[var(--space-4)] text-center',
            disabled
              ? 'cursor-not-allowed border-[var(--color-border-disabled-subtlest-default)] bg-[var(--color-surface-disabled-default)]'
              : cn(
                  'cursor-pointer bg-[var(--color-surface-primary-default)] hover:bg-[var(--color-surface-primary-hovered)]',
                  negative ? 'border-[var(--color-border-negative-default)]' : 'border-[var(--color-border-primary-default)]',
                ),
          )}
        >
          <span
            className={cn(
              'type-label-xl-emphasized',
              disabled ? 'text-[var(--color-text-disabled-default)]' : 'text-[var(--color-text-highlight-default)]',
            )}
          >
            {title}
          </span>
          {description != null && (
            <span
              className={cn(
                'w-full type-body-xs',
                disabled ? 'text-[var(--color-text-disabled-default)]' : 'text-[var(--color-text-tertiary-default)]',
              )}
            >
              {description}
            </span>
          )}
          <input
            ref={input}
            type="file"
            accept={accept}
            hidden
            disabled={disabled}
            onChange={(event) => {
              onFiles?.(event.target.files)
              event.target.value = ''
            }}
          />
        </div>
      )}
      {inlineMessage != null && (
        <InlineMessage appearance={negative ? 'negative' : 'default'} size="xs">
          {inlineMessage}
        </InlineMessage>
      )}
    </div>
  )
}
