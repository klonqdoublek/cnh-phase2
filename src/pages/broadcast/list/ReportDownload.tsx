import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { BROADCAST_COPY, deliveryReportCsv, deliveryReportName, type Broadcast } from '@/data/broadcast'
import { downloadText } from '@/lib/download'
import { ListToast } from './ListToast'

/** What the last Download did: the file it saved, or that it failed. */
export type ReportResult = { ok: true; file: string } | { ok: false }

/**
 * Download report, as Notification management downloads a template: a confirm
 * dialog, then the file, then a toast. One broadcast, one file. When the
 * download fails ("Be able to download?" No, requester 22 Oct 2026, after
 * Notification management's flow), no file is saved and a Negative toast asks
 * to try again; the user downloads again from where they were. `failNext`
 * fails the next Download only, as the Create form's `/fail` route does;
 * `held` opens on a result and keeps its toast up (preset routes).
 * On the body, since the drawer's transform would pin a fixed layer inside it;
 * `data-report-download` lets the drawer tell these clicks from an outside one.
 */
export function ReportDownload({
  broadcast,
  onDone,
  failNext,
  held,
}: {
  broadcast: Broadcast | null
  onDone: () => void
  failNext?: boolean
  held?: ReportResult
}) {
  const [result, setResult] = useState<ReportResult | null>(held ?? null)
  const [failPending, setFailPending] = useState(!!failNext)
  const [holding, setHolding] = useState(!!held)
  const closeToast = useCallback(() => setResult(null), [])

  const download = () => {
    if (!broadcast) return
    onDone()
    setHolding(false)
    if (failPending) {
      setFailPending(false)
      setResult({ ok: false })
      return
    }
    const name = deliveryReportName(broadcast)
    downloadText(name, deliveryReportCsv(broadcast))
    setResult({ ok: true, file: name })
  }

  return createPortal(
    <div data-report-download>
      <ConfirmDialog
        open={broadcast !== null}
        anatomy="sectioned"
        contentType="label-xl"
        layer="fixed"
        width={600}
        title={BROADCAST_COPY.reportTitle}
        cancelLabel="Cancel"
        confirmLabel={BROADCAST_COPY.reportConfirm}
        onCancel={onDone}
        onDismiss={onDone}
        onConfirm={download}
        className="z-50"
      >
        {BROADCAST_COPY.reportBody}
      </ConfirmDialog>
      <ListToast
        open={result !== null}
        appearance={result?.ok === false ? 'negative' : 'positive'}
        title={result?.ok === false ? BROADCAST_COPY.reportFailTitle : BROADCAST_COPY.reportDoneTitle}
        description={
          !result ? '' : result.ok ? BROADCAST_COPY.reportDoneBody(result.file) : BROADCAST_COPY.reportFailBody
        }
        hold={holding}
        onClose={closeToast}
      />
    </div>,
    document.body,
  )
}
