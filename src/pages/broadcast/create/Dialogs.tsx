import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { BROADCAST_COPY } from '@/data/broadcast'
import type { BroadcastForm } from './useBroadcastForm'

/* The form's dialogs — webds `confirm-dialog`, the `sectioned` shell the CNH
 * file draws (600 wide, Cancel as the outline on the left, the answer filled on
 * the right). */
export function Dialogs({ f, onBack }: { f: BroadcastForm; onBack: () => void }) {
  return (
    <>
      {(f.creating || f.readingFile) && (
        /* Submitting covers the whole page, opaque, with the brand spinner; so
           does Submit's full read of the file. Spinner only, no text (requester,
           21 Oct 2026; the read showed "Checking file…"), which stays its label. */
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[var(--space-4)] bg-[var(--color-surface-primary-default)] opacity-90"
        >
          <SpinnerLoader size="l" appearance="brand" label={f.readingFile ? BROADCAST_COPY.checking : undefined} />
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

      {f.blocked && (
        <ConfirmDialog
          anatomy="sectioned"
          contentType="label-xl"
          layer="fixed"
          width={600}
          /* The job's own failure after Submit, the reason from dev: the system-fail
             dialog with Close / Try again (BA Natsinee and requester, 12 Nov 2026;
             was "The audience file cannot be used" with Close only). */
          title={BROADCAST_COPY.submitFailTitle}
          cancelLabel="Close"
          confirmLabel="Try again"
          onCancel={f.closeBlocked}
          onConfirm={f.retryBlocked}
          onDismiss={f.closeBlocked}
          className="z-50"
        >
          {f.blocked}
        </ConfirmDialog>
      )}

      {f.checkFailed && (
        <ConfirmDialog
          anatomy="sectioned"
          contentType="label-xl"
          layer="fixed"
          width={600}
          title={BROADCAST_COPY.submitFailTitle}
          cancelLabel="Close"
          confirmLabel="Try again"
          onCancel={() => f.setCheckFailed(false)}
          onConfirm={() => {
            f.setCheckFailed(false)
            f.readFile()
          }}
          onDismiss={() => f.setCheckFailed(false)}
          className="z-50"
        >
          Please try again
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
