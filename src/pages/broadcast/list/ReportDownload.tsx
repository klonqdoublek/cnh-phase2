import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { BROADCAST_COPY, deliveryReportCsv, deliveryReportName, type Broadcast } from '@/data/broadcast'
import { downloadText } from '@/lib/download'
import { ListToast } from './ListToast'

/**
 * Download report, as Notification management downloads a template: a confirm
 * dialog, then the file, then a toast. One broadcast, one file. On the body,
 * since the drawer's transform would pin a fixed layer inside it;
 * `data-report-download` lets the drawer tell these clicks from an outside one.
 */
export function ReportDownload({ broadcast, onDone }: { broadcast: Broadcast | null; onDone: () => void }) {
  const [saved, setSaved] = useState<string | null>(null)
  const closeToast = useCallback(() => setSaved(null), [])

  const download = () => {
    if (!broadcast) return
    const name = deliveryReportName(broadcast)
    downloadText(name, deliveryReportCsv(broadcast))
    onDone()
    setSaved(name)
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
        open={saved !== null}
        title={BROADCAST_COPY.reportDoneTitle}
        description={saved ? BROADCAST_COPY.reportDoneBody(saved) : ''}
        hold={false}
        onClose={closeToast}
      />
    </div>,
    document.body,
  )
}
