import type { Template } from '@/data/templates'
import type { ImportPreset } from '@/data/import-spec'

export type ListState = 'loading' | 'error' | 'empty' | 'ready'
/** The toast the list shows after the form returns. */
export type ListNotice = 'draft' | 'published' | 'updated'

export type DashboardProps = {
  templates: Template[]
  state: ListState
  notice: ListNotice | null
  onNoticeClose: () => void
  onRetry: () => void
  onCreate: () => void
  onOpenTemplate: (t: Template) => void
  /** Set by the drawer's Download; the list opens its download dialog for it. */
  downloadRequest: Template | null
  onDownloadRequestHandled: () => void
  /** Present on `#/list/import[/<preset>]` — the Import dialog opens in that state. */
  importPreset?: ImportPreset
  onImport: (templates: Template[]) => void
}

/* STUB — ported by the notification-list agent. */
export function Dashboard(props: DashboardProps) {
  return <div className="p-[var(--space-6)] type-heading-m">Notification management · {props.templates.length}</div>
}
