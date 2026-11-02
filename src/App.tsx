import { useEffect, useRef, useState } from 'react'
import { BROADCASTS, deliveryReportName, type Broadcast, type ListToast } from '@/data/broadcast'
import { LIST_TOAST, REPORT_DEMO_ID, formPreset, listPreset, reportPreset } from '@/data/broadcast-presets'
import { IMPORT_HISTORY, IMPORT_PRESETS, type ImportPreset } from '@/data/import-spec'
import { TEMPLATES, type Template, type TemplateStatus } from '@/data/templates'
import { fromValues, stampImported, toValues, togglesOf, type FormValues, type Toggles } from '@/data/template-form'
import { go, useHash } from '@/lib/hash'
import { AppShell } from '@/shell/AppShell'
import { Login } from '@/pages/Login'
import { Dashboard, type ListNotice, type ListState } from '@/pages/notifications/Dashboard'
import { TemplateForm } from '@/pages/template/TemplateForm'
import { TemplateDrawer } from '@/pages/template/TemplateDrawer'
import { BroadcastList } from '@/pages/broadcast/BroadcastList'
import { BroadcastDrawer } from '@/pages/broadcast/BroadcastDrawer'
import { BroadcastWizard, type SaveKind } from '@/pages/broadcast/BroadcastWizard'
import { useImportJobs } from '@/pages/notifications/import-status/jobs'
import { IMPORT_RECORDS, type ImportRecord } from '@/data/import-history'
import { ImportTemplateList } from '@/pages/import-template/ImportTemplateList'
import { ImportTemplateDrawer } from '@/pages/import-template/ImportTemplateDrawer'
import { recordOfJob } from '@/pages/import-template/records'
import { ImportDialog } from '@/pages/notifications/ImportDialog'

/* Routes are the cnh-tm-phase2 build's, one per state, so the webds flow
 * archive (cnh-phase2) and its task flow still point at the right screen. */
/** The next running number: past the highest id, so ids stay unique once an import over a file removes rows. */
const nextRunning = (list: Template[]) =>
  list.reduce((max, t) => Math.max(max, Number(t.id.replace(/\D/g, '')) || 0), list.length) + 1

/** How long an imported row stays highlighted (PROPOSAL: 24 hours, pending BA). */
const HIGHLIGHT_MS = 24 * 60 * 60 * 1000

export default function App() {
  const hash = useHash()
  const [openTemplate, setOpenTemplate] = useState<Template | null>(null)
  const [downloadRequest, setDownloadRequest] = useState<Template | null>(null)
  const [notice, setNotice] = useState<ListNotice | null>(null)
  const [templates, setTemplates] = useState<Template[]>(TEMPLATES)
  /** File name → ids of the templates its last import added (requester, 15 Oct 2026). */
  const [importHistory, setImportHistory] = useState<Record<string, string[]>>(IMPORT_HISTORY)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(BROADCASTS)
  const [created, setCreated] = useState<ListToast | null>(null)
  const [openBroadcast, setOpenBroadcast] = useState<Broadcast | null>(null)
  const [openImport, setOpenImport] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  /* Rows an import just added are highlighted (PROPOSAL, 2 Nov 2026, pending BA): id → when it landed. */
  const [fresh, setFresh] = useState<ReadonlyMap<string, number>>(new Map())

  /* Puts imported templates on the list. Importing over a file replaces the templates its earlier import added. */
  const landImport = (imported: Template[], fileName?: string, replace?: boolean) => {
    const gone = new Set(replace && fileName ? importHistory[fileName] : [])
    const base = nextRunning(templates)
    const stamped = imported.map((t, i) => stampImported(t, base + i))
    setTemplates((list) => [...stamped, ...list.filter((t) => !gone.has(t.id))])
    if (fileName) setImportHistory((h) => ({ ...h, [fileName]: stamped.map((t) => t.id) }))
    const now = Date.now()
    setFresh((m) => new Map([...m, ...stamped.map((t) => [t.id, now] as const)]))
  }
  /* Since 28 Oct 2026 (BA / Dev) Import submits a job; the templates land when the server is done, about 10 minutes later. */
  const importJobs = useImportJobs(landImport)

  const unfresh = (gone: (id: string, landed: number) => boolean) =>
    setFresh((m) => ([...m].some(([id, at]) => gone(id, at)) ? new Map([...m].filter(([id, at]) => !gone(id, at))) : m))

  /* The highlight goes three ways (requester, 2 Nov 2026):
     1. after HIGHLIGHT_MS, as Gmail's new mail stops standing out (?hl=<seconds> shortens it for a demo);
     2. when the user leaves Notification management after seeing it, so a new visit starts plain;
        a row that lands while the user is elsewhere keeps it until seen;
     3. when the user opens that template. */
  const highlightMs = (Number(new URLSearchParams(location.search).get('hl')) || 0) * 1000 || HIGHLIGHT_MS
  useEffect(() => {
    if (fresh.size === 0) return
    const next = Math.min(...fresh.values()) + highlightMs - Date.now()
    const timer = setTimeout(() => unfresh((_, at) => Date.now() - at >= highlightMs), Math.max(0, next))
    return () => clearTimeout(timer)
  }, [fresh, highlightMs])
  const onNotificationList = hash === '' || hash === '#/' || hash.startsWith('#/list')
  const seenFresh = useRef(new Set<string>())
  useEffect(() => {
    if (onNotificationList) {
      fresh.forEach((_, id) => seenFresh.current.add(id))
      return
    }
    if (seenFresh.current.size === 0) return
    const seen = seenFresh.current
    seenFresh.current = new Set()
    unfresh((id) => seen.has(id))
  }, [onNotificationList, fresh])

  const backToList = (n: ListNotice) => {
    setNotice(n)
    go('/list')
  }
  const saveTemplate = (status: TemplateStatus, n: ListNotice) => (values: FormValues, toggles: Toggles) => {
    setTemplates((list) => [fromValues(values, toggles, status, nextRunning(list)), ...list])
    backToList(n)
  }

  if (hash === '#/login') return <Login onSignIn={() => go('/list')} />

  const createBroadcast = (b: Omit<Broadcast, 'id'>, kind: SaveKind) => {
    const next = Math.max(0, ...broadcasts.map((x) => Number(x.id.slice(3)))) + 1
    const id = `BC-${String(next).padStart(4, '0')}`
    setBroadcasts((list) => [{ ...b, id }, ...list])
    setCreated({ name: b.name, draft: kind === 'draft' })
    go('/broadcast')
  }

  const editId = hash.match(/^#\/broadcast\/edit\/([A-Z]+-\d+)(?:\/(?:loading|fail))?$/)?.[1]
  const editing = editId ? broadcasts.find((b) => b.id === editId && b.status === 'Draft') : undefined
  if (editing)
    return (
      <BroadcastWizard
        key={hash}
        initial={editing}
        loading={hash.endsWith('/loading')}
        failNext={hash.endsWith('/fail')}
        onBack={() => go('/broadcast')}
        onCreate={(b, kind) => {
          setBroadcasts((list) => list.map((x) => (x.id === editing.id ? { ...b, id: editing.id } : x)))
          setCreated({ name: b.name, draft: kind === 'draft' })
          go('/broadcast')
        }}
      />
    )

  if (hash.startsWith('#/broadcast/create'))
    return (
      <BroadcastWizard
        key={hash}
        loading={hash.endsWith('/loading')}
        failNext={hash.endsWith('/fail')}
        preset={formPreset(hash.match(/^#\/broadcast\/create\/([a-z-]+)$/)?.[1])}
        onBack={() => go('/broadcast')}
        onCreate={createBroadcast}
      />
    )

  if (hash.startsWith('#/create'))
    return (
      <TemplateForm
        mode="create"
        title="Create notification"
        loading={hash.endsWith('/loading')}
        initialToggles={{ push: false, email: false, sms: false }}
        failNext={hash.endsWith('/fail')}
        onBack={() => go('/list')}
        onSaveDraft={saveTemplate('Draft', 'draft')}
        onSubmit={saveTemplate('Published', 'published')}
      />
    )

  const editMatch = hash.match(/^#\/edit\/([^/]+)/)
  const editTemplate = editMatch ? templates.find((t) => t.id === editMatch[1]) : undefined
  if (editMatch && editTemplate)
    return (
      <TemplateForm
        mode="edit"
        title="Edit"
        initialValues={toValues(editTemplate)}
        initialToggles={togglesOf(editTemplate)}
        failNext={hash.endsWith('/fail')}
        onBack={() => go('/list')}
        onSaveDraft={() => backToList('draft')}
        onUpdate={() => backToList('updated')}
        onSubmit={() => backToList('published')}
      />
    )

  const listState: ListState =
    hash === '#/list/loading'
      ? 'loading'
      : hash === '#/list/error' || (editMatch && !editTemplate)
        ? 'error'
        : hash === '#/list/empty'
          ? 'empty'
          : 'ready'
  const importMatch = hash.match(/^#\/list\/import(?:\/([a-z-]+))?$/)
  const importPreset =
    importMatch && (IMPORT_PRESETS as readonly string[]).includes(importMatch[1] ?? 'initial')
      ? ((importMatch[1] ?? 'initial') as ImportPreset)
      : undefined
  const onBroadcast = hash.startsWith('#/broadcast')
  /* Import Template (BA & Dev deck, 30 Oct 2026): this session's jobs on top of the seeded imports. */
  const onImportTemplate = hash.startsWith('#/import-template')
  const importRecords: ImportRecord[] = [...importJobs.history.map(recordOfJob), ...IMPORT_RECORDS]
  const importView = hash.match(/^#\/import-template\/view\/([A-Z]+-[A-Z]?\d+)(\/download)?$/)
  const importViewId = openImport ?? importView?.[1]
  const viewingImport = importViewId ? importRecords.find((r) => r.id === importViewId) : undefined
  const preset = listPreset(hash.match(/^#\/broadcast\/([a-z-]+)$/)?.[1])
  const viewMatch = hash.match(/^#\/broadcast\/view\/([A-Z]+-\d+)(\/cancel(?:-fail)?|\/download(?:\/fail)?)?$/)
  const viewId = viewMatch?.[1]
  const viewing = openBroadcast ?? (viewId ? broadcasts.find((b) => b.id === viewId) : undefined)
  /* Download report's presets, on App maintenance: the confirm (`/fail`: its
     Download fails) and each result held open. */
  const reportDemo = broadcasts.find((b) => b.id === REPORT_DEMO_ID)
  const reportConfirm = hash.match(/^#\/broadcast\/download(\/fail)?$/)
  const reportResult = reportPreset(hash.match(/^#\/broadcast\/([a-z-]+)$/)?.[1])

  return (
    <AppShell activeId={onBroadcast ? 'broadcast' : onImportTemplate ? 'import-template' : 'template-management'}>
      {onImportTemplate ? (
        <ImportTemplateList
          records={hash === '#/import-template/empty' ? [] : importRecords}
          onOpen={(r) => setOpenImport(r.id)}
          onImport={() => setImportOpen(true)}
          state={hash === '#/import-template/loading' ? 'loading' : hash === '#/import-template/error' ? 'error' : 'ready'}
          onRetry={() => go('/import-template')}
        />
      ) : onBroadcast ? (
        <BroadcastList
          key={reportConfirm || reportResult ? hash : 'list'}
          broadcasts={hash === '#/broadcast/empty' ? [] : broadcasts}
          onCreate={() => go('/broadcast/create')}
          onOpen={setOpenBroadcast}
          created={preset ? LIST_TOAST[preset] : created}
          holdToast={!!preset}
          onCreatedClose={() => setCreated(null)}
          reportOpen={reportConfirm ? reportDemo : undefined}
          reportFailNext={!!reportConfirm?.[1]}
          reportHeld={
            reportResult === 'download-failed'
              ? { ok: false }
              : reportResult && reportDemo
                ? { ok: true, file: deliveryReportName(reportDemo) }
                : undefined
          }
          state={hash === '#/broadcast/loading' ? 'loading' : hash === '#/broadcast/error' ? 'error' : 'ready'}
          onRetry={() => go('/broadcast')}
        />
      ) : (
        <Dashboard
          templates={listState === 'empty' ? [] : templates}
          state={listState}
          notice={notice}
          onNoticeClose={() => setNotice(null)}
          onRetry={() => go('/list')}
          onCreate={() => go('/create')}
          onOpenTemplate={(t) => {
            setOpenTemplate(t)
            unfresh((id) => id === t.id)
          }}
          highlightIds={new Set(fresh.keys())}
          downloadRequest={downloadRequest}
          onDownloadRequestHandled={() => setDownloadRequest(null)}
          importPreset={importPreset}
          importedNames={Object.keys(importHistory)}
          onImport={landImport}
          importJobs={importJobs}
        />
      )}

      {onBroadcast && viewing && (
        <BroadcastDrawer
          key={`${viewing.id}${viewMatch?.[2] ?? ''}`}
          broadcast={viewing}
          onClose={() => {
            setOpenBroadcast(null)
            if (viewId) go('/broadcast')
          }}
          onEdit={() => {
            setOpenBroadcast(null)
            go(`/broadcast/edit/${viewing.id}`)
          }}
          confirmingCancel={viewMatch?.[2] === '/cancel'}
          cancelFailed={viewMatch?.[2] === '/cancel-fail'}
          confirmingDownload={!!viewMatch?.[2]?.startsWith('/download')}
          downloadFailNext={viewMatch?.[2] === '/download/fail'}
          onCancel={() => {
            setBroadcasts((list) => list.map((x) => (x.id === viewing.id ? { ...x, status: 'Cancelled' } : x)))
            setCreated({ name: viewing.name, draft: false, cancelled: true })
            setOpenBroadcast(null)
            go('/broadcast')
          }}
        />
      )}

      {/* Import from this page as well (PROPOSAL, 1 Nov 2026, pending BA). The
          submitted file shows as a Queue row on top of the list. */}
      {onImportTemplate && (
        <ImportDialog
          open={importOpen || hash === '#/import-template/import'}
          importedNames={Object.keys(importHistory)}
          onClose={() => {
            setImportOpen(false)
            if (hash === '#/import-template/import') go('/import-template')
          }}
          onImported={(list, fileName, replace) => {
            setImportOpen(false)
            if (hash === '#/import-template/import') go('/import-template')
            importJobs.submit(list, fileName, replace)
          }}
        />
      )}

      {onImportTemplate && viewingImport && (
        <ImportTemplateDrawer
          key={`${viewingImport.id}${importView?.[2] ?? ''}`}
          record={viewingImport}
          confirmingDownload={!!importView?.[2]}
          onClose={() => {
            setOpenImport(null)
            if (importView) go('/import-template')
          }}
        />
      )}

      {openTemplate && (
        <TemplateDrawer
          template={openTemplate}
          onClose={() => setOpenTemplate(null)}
          onEdit={() => {
            const t = openTemplate
            setOpenTemplate(null)
            go(`/edit/${t.id}`)
          }}
          onDownload={() => {
            const t = openTemplate
            setOpenTemplate(null)
            setDownloadRequest(t)
          }}
        />
      )}
    </AppShell>
  )
}
