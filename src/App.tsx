import { useState } from 'react'
import { BROADCASTS, type Broadcast, type ListToast } from '@/data/broadcast'
import { LIST_TOAST, formPreset, listPreset } from '@/data/broadcast-presets'
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

/* Routes are the cnh-tm-phase2 build's, one per state, so the webds flow
 * archive (cnh-phase2) and its task flow still point at the right screen. */
/** The next running number: past the highest id, so ids stay unique once an import over a file removes rows. */
const nextRunning = (list: Template[]) =>
  list.reduce((max, t) => Math.max(max, Number(t.id.replace(/\D/g, '')) || 0), list.length) + 1

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

  const editId = hash.match(/^#\/broadcast\/edit\/([A-Z]+-\d+)$/)?.[1]
  const editing = editId ? broadcasts.find((b) => b.id === editId && b.status === 'Draft') : undefined
  if (editing)
    return (
      <BroadcastWizard
        key={hash}
        initial={editing}
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
  const preset = listPreset(hash.match(/^#\/broadcast\/([a-z-]+)$/)?.[1])
  const viewId = hash.match(/^#\/broadcast\/view\/([A-Z]+-\d+)$/)?.[1]
  const viewing = openBroadcast ?? (viewId ? broadcasts.find((b) => b.id === viewId) : undefined)

  return (
    <AppShell activeId={onBroadcast ? 'broadcast' : 'template-management'}>
      {onBroadcast ? (
        <BroadcastList
          broadcasts={hash === '#/broadcast/empty' ? [] : broadcasts}
          onCreate={() => go('/broadcast/create')}
          onOpen={setOpenBroadcast}
          created={preset ? LIST_TOAST[preset] : created}
          holdToast={!!preset}
          onCreatedClose={() => setCreated(null)}
        />
      ) : (
        <Dashboard
          templates={listState === 'empty' ? [] : templates}
          state={listState}
          notice={notice}
          onNoticeClose={() => setNotice(null)}
          onRetry={() => go('/list')}
          onCreate={() => go('/create')}
          onOpenTemplate={setOpenTemplate}
          downloadRequest={downloadRequest}
          onDownloadRequestHandled={() => setDownloadRequest(null)}
          importPreset={importPreset}
          importedNames={Object.keys(importHistory)}
          onImport={(imported, fileName, replace) => {
            /* Importing over a file replaces the templates its earlier import added. */
            const gone = new Set(replace && fileName ? importHistory[fileName] : [])
            const base = nextRunning(templates)
            const stamped = imported.map((t, i) => stampImported(t, base + i))
            setTemplates((list) => [...stamped, ...list.filter((t) => !gone.has(t.id))])
            if (fileName) setImportHistory((h) => ({ ...h, [fileName]: stamped.map((t) => t.id) }))
          }}
        />
      )}

      {onBroadcast && viewing && (
        <BroadcastDrawer
          key={viewing.id}
          broadcast={viewing}
          onClose={() => {
            setOpenBroadcast(null)
            if (viewId) go('/broadcast')
          }}
          onEdit={() => {
            setOpenBroadcast(null)
            go(`/broadcast/edit/${viewing.id}`)
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
