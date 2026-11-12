import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { BROADCAST_COPY, deliveryReportCsv, deliveryReportName, type Broadcast } from '@/data/broadcast'
import { downloadText } from '@/lib/download'
import { ListToast } from './ListToast'

type Report = { name: string; text: () => string }

/** What the last Download did: the file it saved, or that it failed (with the
 *  report, so Try again can run it again). */
export type ReportResult = { ok: true; file: string } | { ok: false; report?: Report }

/**
 * Download report, as Notification management downloads a template: a confirm
 * dialog, then the file, then a toast. One broadcast, one file. When the
 * download fails ("Be able to download?" No, requester 22 Oct 2026, after
 * Notification management's flow), no file is saved and a Negative toast asks
 * to try again; the user downloads again from where they were. `failNext`
 * fails the next Download only, as the Create form's `/fail` route does;
 * `held` opens on a result and keeps its toast up (preset routes).
 * `failDialog` (Broadcast, BA Natsinee 12 Nov 2026: the failed toast does not
 * happen; "Unable to download" is a modal with Close / Try again) shows the
 * failure as Cancel's fail dialog instead: Close goes back to where the user
 * was, Try again runs the same download again.
 * On the body, since the drawer's transform would pin a fixed layer inside it;
 * `data-report-download` lets the drawer tell these clicks from an outside one.
 * The Import Template drawer reuses it with `file` and its own `title`
 * (30 Oct 2026) in place of a broadcast.
 */
export function ReportDownload({
  broadcast = null,
  file = null,
  title = BROADCAST_COPY.reportTitle,
  onDone,
  failNext,
  held,
  failDialog = false,
}: {
  broadcast?: Broadcast | null
  /** Any other report: its file name and its CSV. */
  file?: { name: string; text: () => string } | null
  title?: string
  onDone: () => void
  failNext?: boolean
  held?: ReportResult
  failDialog?: boolean
}) {
  const [result, setResult] = useState<ReportResult | null>(held ?? null)
  const [failPending, setFailPending] = useState(!!failNext)
  const [holding, setHolding] = useState(!!held)
  const closeToast = useCallback(() => setResult(null), [])

  const run = (report: Report) => {
    setHolding(false)
    if (failPending) {
      setFailPending(false)
      setResult({ ok: false, report })
      return
    }
    downloadText(report.name, report.text())
    setResult({ ok: true, file: report.name })
  }

  const download = () => {
    const report = file ?? (broadcast && { name: deliveryReportName(broadcast), text: () => deliveryReportCsv(broadcast) })
    if (!report) return
    onDone()
    run(report)
  }

  const failed = result?.ok === false
  const retry = () => {
    const report = result?.ok === false ? result.report : undefined
    setResult(null)
    if (report) run(report)
  }

  return createPortal(
    <div data-report-download>
      <ConfirmDialog
        open={broadcast !== null || file !== null}
        anatomy="sectioned"
        contentType="label-xl"
        layer="fixed"
        width={600}
        title={title}
        cancelLabel="Cancel"
        confirmLabel={BROADCAST_COPY.reportConfirm}
        onCancel={onDone}
        onDismiss={onDone}
        onConfirm={download}
        className="z-50"
      >
        {BROADCAST_COPY.reportBody}
      </ConfirmDialog>
      <ConfirmDialog
        open={failDialog && failed}
        anatomy="sectioned"
        contentType="label-xl"
        layer="fixed"
        width={600}
        title={BROADCAST_COPY.reportFailTitle}
        cancelLabel="Close"
        confirmLabel="Try again"
        onCancel={closeToast}
        onDismiss={closeToast}
        onConfirm={retry}
        className="z-50"
      >
        {BROADCAST_COPY.reportFailBody}
      </ConfirmDialog>
      <ListToast
        open={result !== null && !(failDialog && failed)}
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
