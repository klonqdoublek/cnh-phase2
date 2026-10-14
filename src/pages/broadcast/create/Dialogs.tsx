import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { BROADCAST_COPY, fmtDateTime, fmtDnd } from '@/data/broadcast'
import { CHANNELS } from '@/data/templates'
import type { BroadcastForm } from './useBroadcastForm'

/* The form's dialogs — webds `confirm-dialog`, the `sectioned` shell the CNH
 * file draws (600 wide, Cancel as the outline on the left, the answer filled on
 * the right). */
export function Dialogs({ f, onBack }: { f: BroadcastForm; onBack: () => void }) {
  return (
    <>
      {f.creating && (
        /* Submitting covers the whole page, opaque, with the brand spinner. */
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 grid place-items-center bg-[var(--color-surface-primary-default)] opacity-90"
        >
          <SpinnerLoader size="l" appearance="brand" />
        </div>
      )}

      {f.leaveOpen && (
        <ConfirmDialog
          anatomy="sectioned"
          contentType="label-xl"
          layer="fixed"
          width={600}
          title="You are about to leave this page"
          cancelLabel="Leave"
          confirmLabel="Stay"
          onCancel={() => {
            f.setLeaveOpen(false)
            onBack()
          }}
          onConfirm={() => f.setLeaveOpen(false)}
          onDismiss={() => f.setLeaveOpen(false)}
          className="z-50"
        >
          The changes you made will not be saved
        </ConfirmDialog>
      )}

      {f.confirmOpen && (
        <ConfirmDialog
          anatomy="sectioned"
          contentType="label-xl"
          layer="fixed"
          width={600}
          title={BROADCAST_COPY.submitTitle}
          cancelLabel="Cancel"
          confirmLabel="Submit"
          onCancel={() => f.setConfirmOpen(false)}
          onConfirm={f.create}
          onDismiss={() => f.setConfirmOpen(false)}
          className="z-50"
        >
          <dl className="m-0 grid grid-cols-[140px_1fr] gap-x-[var(--space-4)] gap-y-[var(--space-2)] type-body-m">
            <dt className="text-[var(--color-text-secondary-default)]">Broadcast</dt>
            <dd className="m-0 text-[var(--color-text-primary-default)]">{f.name}</dd>
            <dt className="text-[var(--color-text-secondary-default)]">Recipients</dt>
            <dd className="m-0 text-[var(--color-text-primary-default)]">
              {(f.check?.valid ?? 0).toLocaleString('en-US')} from {f.file?.name} · by {f.column}
            </dd>
            <dt className="text-[var(--color-text-secondary-default)]">Channel</dt>
            <dd className="m-0 text-[var(--color-text-primary-default)]">
              {CHANNELS.filter((c) => f.channels.includes(c)).join(', ')}
            </dd>
            <dt className="text-[var(--color-text-secondary-default)]">Delivery</dt>
            <dd className="m-0 text-[var(--color-text-primary-default)]">
              {f.mode === 'now' ? 'As soon as possible' : f.start && fmtDateTime(f.start)}
            </dd>
            <dt className="text-[var(--color-text-secondary-default)]">Do Not Disturb</dt>
            <dd className="m-0 whitespace-pre-line text-[var(--color-text-primary-default)]">{fmtDnd(f.dnd)}</dd>
          </dl>
        </ConfirmDialog>
      )}

      {f.failed && (
        <ConfirmDialog
          anatomy="sectioned"
          contentType="label-xl"
          layer="fixed"
          width={600}
          title={BROADCAST_COPY.submitFailTitle}
          cancelLabel="Close"
          confirmLabel="Try again"
          onCancel={() => f.setFailed(false)}
          onConfirm={() => {
            f.setFailed(false)
            f.create()
          }}
          onDismiss={() => f.setFailed(false)}
          className="z-50"
        >
          Please try again
        </ConfirmDialog>
      )}
    </>
  )
}
