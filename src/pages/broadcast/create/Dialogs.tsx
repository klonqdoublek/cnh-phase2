import { Button } from '@/bbl/button'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { BROADCAST_COPY, RECIPIENT_TYPE_LABEL, fmtDateTime, fmtDnd } from '@/data/broadcast'
import { CHANNELS } from '@/data/templates'
import { NOTE } from './fields'
import { MiniTable, NeverSendsAlert } from './sections'
import type { BroadcastForm } from './useBroadcastForm'

/* The form's dialogs — webds `confirm-dialog`, the `sectioned` shell the CNH
 * file draws (600 wide, Cancel as the outline on the left, the answer filled on
 * the right). */
/** `dndWarn`: the confirm dialog warns about Do Not Disturb that never ends
 *  (the Prototype control's On submit option, 28 Oct 2026). */
export function Dialogs({ f, onBack, dndWarn }: { f: BroadcastForm; onBack: () => void; dndWarn: boolean }) {
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
          {dndWarn && f.neverSends && (
            <div className="mb-[var(--space-4)]">
              <NeverSendsAlert />
            </div>
          )}
          <dl className="m-0 grid grid-cols-[140px_1fr] gap-x-[var(--space-4)] gap-y-[var(--space-2)] type-body-m">
            <dt className="text-[var(--color-text-secondary-default)]">Broadcast</dt>
            <dd className="m-0 text-[var(--color-text-primary-default)]">{f.name}</dd>
            <dt className="text-[var(--color-text-secondary-default)]">Recipients</dt>
            <dd className="m-0 text-[var(--color-text-primary-default)]">{f.file?.name}</dd>
            <dt className="text-[var(--color-text-secondary-default)]">Recipient type</dt>
            <dd className="m-0 text-[var(--color-text-primary-default)]">{RECIPIENT_TYPE_LABEL[f.recipientType]}</dd>
            <dt className="text-[var(--color-text-secondary-default)]">Recipient column</dt>
            <dd className="m-0 text-[var(--color-text-primary-default)]">{f.column}</dd>
            <dt className="text-[var(--color-text-secondary-default)]">Channel</dt>
            <dd className="m-0 text-[var(--color-text-primary-default)]">
              {CHANNELS.filter((c) => f.channels.includes(c)).join(', ')}
            </dd>
            <dt className="text-[var(--color-text-secondary-default)]">Delivery</dt>
            <dd className="m-0 text-[var(--color-text-primary-default)]">
              {f.mode === 'now' ? 'As soon as possible' : f.start && fmtDateTime(f.start)}
            </dd>
            <dt className="text-[var(--color-text-secondary-default)]">Broadcast end</dt>
            <dd className="m-0 text-[var(--color-text-primary-default)]">
              {f.end ? fmtDateTime(new Date(f.end)) : 'No end date'}
            </dd>
            <dt className="text-[var(--color-text-secondary-default)]">Do Not Disturb</dt>
            <dd className="m-0 whitespace-pre-line text-[var(--color-text-primary-default)]">{fmtDnd(f.dnd)}</dd>
          </dl>
          {!!f.check?.invalid && (
            /* Moved here from Step 2 (BA, 19 Oct 2026): rows are checked only
               once Submit reads the whole file. */
            <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-2)]">
              <p className={NOTE}>{BROADCAST_COPY.invalidNote}</p>
              <MiniTable
                columns={['Row', f.column, 'Problem']}
                widths="80px 200px 1fr"
                rows={f.check.rows
                  .filter((r) => r.errors.length)
                  .map((r) => [String(r.line), r.id || '–', r.errors.join(', ')])}
                negativeLast
                maxHeight
              />
            </div>
          )}
        </ConfirmDialog>
      )}

      {f.blocked && (
        <ConfirmDialog
          anatomy="sectioned"
          contentType="label-xl"
          layer="fixed"
          width={600}
          title={BROADCAST_COPY.fileBlockedTitle}
          /* One filled answer, as the file's own Ok dialog draws it (1:201082). */
          actions={<Button onClick={f.closeBlocked}>Close</Button>}
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
