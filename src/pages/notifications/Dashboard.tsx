import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, type BadgeType } from '@/bbl/badge'
import { Button } from '@/bbl/button'
import { Checkbox, type CheckboxSelection } from '@/bbl/checkbox'
import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { OutlineButton } from '@/bbl/outline-button'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { TableDataCell } from '@/bbl/table-data-cell'
import { TableHeaderCell } from '@/bbl/table-header-cell'
import { TablePagination } from '@/bbl/table-pagination'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { PageHeader } from '@/patterns/page-header'
import { IMPORT_COPY, presetTemplates, type ImportPreset } from '@/data/import-spec'
import {
  CHANNELS,
  FILE_EXT,
  SERVICE_CODE_LOV,
  STATUSES,
  toExport,
  toJsonl,
  type Template,
  type TemplateStatus,
} from '@/data/templates'
import { cn } from '@/lib/cn'
import { FilterSelect } from './FilterSelect'
import { ImportDialog } from './ImportDialog'
import { ListSearch } from './ListSearch'
import { ListToast } from './ListToast'

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
  /** File names imported before; importing one again asks first. */
  importedNames: string[]
  /** `replace`: the user chose to import over an earlier import of `fileName`. */
  onImport: (templates: Template[], fileName?: string, replace?: boolean) => void
}

const TONE: Record<TemplateStatus, BadgeType> = { Published: 'positive', Inactive: 'disabled', Draft: 'caution' }
const EMPTY = '–'
/** Typing this into search draws the error state — the prototype's way to reach it. */
const FAIL_QUERY = 'error'
const PAGE_SIZE = 50
const SEARCH_LABEL = 'Search by notification name, description or product name'

const NOTICES: Record<ListNotice, { title: string; description: string }> = {
  published: { title: 'Notification created', description: 'Your notification status is published' },
  draft: { title: 'Draft saved', description: 'You can continue editing this draft and publish it later' },
  updated: { title: 'Changes saved', description: 'The information has been updated' },
}

/* The board's 1600 table: 56 · 240 · 450 · 213.5 × 4, fixed — below 1920 the
   region scrolls sideways rather than re-dealing the columns. */
const COLUMNS: { label: string; width: number }[] = [
  { label: 'Notification name', width: 240 },
  { label: 'Description', width: 450 },
  { label: 'Product name', width: 213.5 },
  { label: 'Service code', width: 213.5 },
  { label: 'Channel', width: 213.5 },
  { label: 'Status', width: 213.5 },
]

const ROW_RULE = 'shadow-[inset_0_-1px_0_0_var(--color-border-primary-default)]'

/**
 * Notification management — the Phase 1 list, with Phase 2's Import beside
 * Create. Layer 3 only: the `page-header` band (`compact`, the CNH 82), a
 * filter row, the table and its pagination.
 */
export function Dashboard({
  templates,
  state = 'ready',
  onRetry,
  onCreate,
  onOpenTemplate,
  notice = null,
  onNoticeClose,
  downloadRequest = null,
  onDownloadRequestHandled,
  onImport,
  importPreset,
  importedNames,
}: DashboardProps) {
  const [query, setQuery] = useState('')
  const [serviceCodes, setServiceCodes] = useState<string[]>([...SERVICE_CODE_LOV])
  const [channels, setChannels] = useState<string[]>([...CHANNELS])
  const [statuses, setStatuses] = useState<string[]>([...STATUSES])
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [hovered, setHovered] = useState<string | null>(null)
  const [toDownload, setToDownload] = useState<Template[] | null>(null)
  const [downloadFailed, setDownloadFailed] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [imported, setImported] = useState<number | null>(null)
  const landed = useRef(false)
  const onImportRef = useRef(onImport)
  onImportRef.current = onImport

  /* `#/list/import/<preset>` opens the dialog in that state; `success` lands
     the preset templates on the list once and holds the toast. */
  useEffect(() => {
    if (!importPreset) return
    if (importPreset !== 'success') return setImportOpen(true)
    setImportOpen(false)
    if (landed.current) return
    landed.current = true
    const templates = presetTemplates()
    onImportRef.current?.(templates)
    setImported(templates.length)
  }, [importPreset])

  const clearSelection = () => setSelected(new Set())

  useEffect(() => {
    if (!downloadRequest) return
    setToDownload([downloadRequest])
    onDownloadRequestHandled?.()
  }, [downloadRequest, onDownloadRequestHandled])

  const failing = query.trim().toLowerCase() === FAIL_QUERY

  /* Last updated, newest first (Korn, 2026-10-05), then the filters. A filter
     with nothing — or everything — ticked filters nothing. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const updated = (t: Template) => Date.parse(t.detail.lastUpdated) || 0
    return [...templates]
      .sort((a, b) => updated(b) - updated(a))
      .filter((t) => {
        const matches =
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.productName.toLowerCase().includes(q)
        const channel =
          channels.length === CHANNELS.length || channels.length === 0 || t.channels.some((c) => channels.includes(c))
        const status = statuses.length === 0 || statuses.includes(t.status)
        const code =
          serviceCodes.length === SERVICE_CODE_LOV.length ||
          serviceCodes.length === 0 ||
          serviceCodes.includes(t.detail.serviceCode)
        return matches && channel && status && code
      })
  }, [templates, query, channels, statuses, serviceCodes])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const togglePage = () =>
    setSelected((s) => {
      const all = rows.length > 0 && rows.every((r) => s.has(r.id))
      const next = new Set(s)
      rows.forEach((r) => (all ? next.delete(r.id) : next.add(r.id)))
      return next
    })
  const selectAll = () => setSelected(new Set(filtered.map((t) => t.id)))
  const allSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.id))
  const headSelection: CheckboxSelection =
    rows.length > 0 && rows.every((r) => selected.has(r.id))
      ? 'selected'
      : rows.some((r) => selected.has(r.id))
        ? 'indeterminate'
        : 'none'

  /** Any filter change goes back to page 1 and drops the selection. */
  const refilter = (change: () => void) => {
    change()
    setPage(0)
    clearSelection()
  }

  const download = () => {
    const list = toDownload ?? []
    const inactive = list.some((t) => t.status === 'Inactive')
    setToDownload(null)
    clearSelection()
    if (inactive) return setDownloadFailed(true)
    const blob = new Blob([toJsonl(list.map(toExport))], { type: 'application/jsonl' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = list.length === 1 ? `${list[0].detail.templateRefCode}${FILE_EXT}` : `templates${FILE_EXT}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setDownloaded(true)
  }

  /* The CNH filter row: search 520 · three 304 filters · Clear 72, gap 16, in a
     105 band (pt 20 / pb 21) that shares the header's rule. webds' filter-bar
     was measured on another console (p 16/24/24/24, gap 24) — composed here. */
  const filters = (
    <div className="-mt-px flex h-[105px] w-full shrink-0 items-start gap-[var(--space-4)] bg-[var(--color-surface-primary-default)] px-[var(--space-4)] pt-[var(--space-5)] pb-[21px] shadow-[inset_0_-1px_0_0_var(--color-border-primary-default)]">
      <div className="min-w-[200px] flex-[0_1_520px]">
        <ListSearch label={SEARCH_LABEL} value={query} onChange={(v) => refilter(() => setQuery(v))} />
      </div>
      <div className="min-w-[180px] flex-[0_1_304px]">
        <FilterSelect
          label="Service code"
          options={SERVICE_CODE_LOV}
          value={serviceCodes}
          onChange={(v) => refilter(() => setServiceCodes(v))}
        />
      </div>
      <div className="min-w-[180px] flex-[0_1_304px]">
        <FilterSelect label="Channel" options={CHANNELS} value={channels} onChange={(v) => refilter(() => setChannels(v))} />
      </div>
      <div className="min-w-[180px] flex-[0_1_304px]">
        <FilterSelect label="Status" options={STATUSES} value={statuses} onChange={(v) => refilter(() => setStatuses(v))} />
      </div>
      <div className="flex h-[64px] shrink-0 items-center">
        <GhostButton
          appearance="highlight"
          className="w-[72px] whitespace-nowrap"
          onClick={() =>
            refilter(() => {
              setQuery('')
              setServiceCodes([...SERVICE_CODE_LOV])
              setChannels([...CHANNELS])
              setStatuses([...STATUSES])
            })
          }
        >
          Clear
        </GhostButton>
      </div>
    </div>
  )

  /* The state card: Surface/Primary/Hovered at Radius 2 round a 765 slot, the
     block 100 from its top. webds' empty-state is a different measurement
     (py 48 · gap 16, Label XL title) — composed here. */
  const card = (children: React.ReactNode) => (
    <div className="w-full rounded-[var(--radius-2)] bg-[var(--color-surface-primary-hovered)] p-[var(--space-6)]">
      <div className="flex h-[765px] w-full flex-col">{children}</div>
    </div>
  )
  const centred = (children: React.ReactNode) => (
    <div className="flex w-full flex-col items-center gap-[var(--space-6)] pt-[100px] text-center">{children}</div>
  )
  const stateLine = (text: string) => (
    <p className="type-label-xl text-[var(--color-text-secondary-default)]">{text}</p>
  )
  const errorState = (retry: () => void) =>
    card(
      centred(
        <>
          <img src="/illustrations/error.svg" alt="" width={124} height={124} />
          <div className="flex flex-col items-center gap-[var(--space-8)]">
            {stateLine('Unable to get information')}
            <Button onClick={retry}>Try again</Button>
          </div>
        </>,
      ),
    )

  let body: React.ReactNode
  if (failing) body = errorState(() => refilter(() => setQuery('')))
  else if (state === 'loading')
    body = card(
      <div className="flex h-full w-full items-center justify-center">
        <SpinnerLoader size="l" />
      </div>,
    )
  else if (state === 'error') body = errorState(onRetry)
  else if (state === 'empty')
    body = card(
      centred(
        <>
          <img src="/illustrations/empty.svg" alt="" width={124} height={124} />
          <div className="flex flex-col items-center gap-[var(--space-8)]">
            <p className="type-heading-xs-emphasized text-[var(--color-text-primary-default)]">
              No notifications created yet
            </p>
            {stateLine(
              'Get started by creating notifications to keep users informed through push notification, email and SMS',
            )}
            <Button onClick={onCreate}>
              Create notification
              <Icon slug="plus" size={16} color="currentColor" />
            </Button>
          </div>
        </>,
      ),
    )

  const isReady = !failing && state === 'ready'

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--color-surface-primary-default)]">
      <PageHeader
        band="compact"
        rule
        title="Notification management"
        actions={[
          <div key="actions" className="flex items-center gap-[var(--space-4)]">
            <OutlineButton onClick={() => setImportOpen(true)}>Import</OutlineButton>
            <Button onClick={onCreate}>
              Create notification
              <Icon slug="plus" size={16} color="currentColor" />
            </Button>
          </div>,
        ]}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {filters}
        {!isReady ? (
          body
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-auto bg-[var(--color-surface-primary-default)]">
              {rows.length === 0 ? (
                card(
                  centred(
                    <>
                      <img src="/illustrations/no-results.svg" alt="" width={124} height={124} />
                      {stateLine('No results found')}
                    </>,
                  ),
                )
              ) : (
                <>
                  {selected.size > 0 && (
                    /* Sticky: the control surface for the selection being scrolled
                       (Korn, 2026-09-01). */
                    <div className="sticky top-0 z-[2] flex h-[64px] w-full items-center gap-[var(--space-4)] bg-[var(--color-surface-primary-default)] p-[var(--space-4)] shadow-[inset_0_-1px_0_0_var(--color-border-primary-default)]">
                      <span className="shrink-0 type-body-m text-[var(--color-text-primary-default)]">
                        {`${selected.size} item${selected.size === 1 ? '' : 's'} selected`}
                      </span>
                      <span aria-hidden className="block h-[20px] w-px shrink-0 bg-[var(--color-component-divider-default)]" />
                      <div className="flex min-w-0 flex-1 items-center">
                        <GhostButton appearance="highlight" padding="none" onClick={allSelected ? clearSelection : selectAll}>
                          {allSelected ? 'Clear selection' : 'Select all items'}
                        </GhostButton>
                      </div>
                      <GhostButton
                        appearance="highlight"
                        padding="none"
                        onClick={() => setToDownload(filtered.filter((t) => selected.has(t.id)))}
                      >
                        Download selected items
                        <Icon slug="download" size={16} color="currentColor" />
                      </GhostButton>
                    </div>
                  )}
                  <table aria-label="Notification management" className="w-full min-w-[1600px] table-fixed border-collapse">
                    <colgroup>
                      <col style={{ width: 56 }} />
                      {COLUMNS.map((c) => (
                        <col key={c.label} style={{ width: c.width }} />
                      ))}
                    </colgroup>
                    <thead>
                      <tr>
                        <th className={cn('sticky z-[1] p-0', selected.size > 0 ? 'top-[64px]' : 'top-0')}>
                          <TableHeaderCell type="slot" state="hovered" className="justify-center">
                            <Checkbox
                              selection={headSelection}
                              aria-label="Select all templates on this page"
                              onClick={togglePage}
                            />
                          </TableHeaderCell>
                        </th>
                        {COLUMNS.map((c) => (
                          <th
                            key={c.label}
                            className={cn('sticky z-[1] p-0 text-left font-normal', selected.size > 0 ? 'top-[64px]' : 'top-0')}
                          >
                            <TableHeaderCell type="slot" state="hovered">
                              <span className="block type-label-xl text-[var(--color-text-tertiary-default)]">{c.label}</span>
                            </TableHeaderCell>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((t) => {
                        const isSelected = selected.has(t.id)
                        const cellState = isSelected ? 'selected' : hovered === t.id ? 'hovered' : 'default'
                        const text = (value: React.ReactNode, wrap = false) => (
                          <TableDataCell type="slot" state={cellState} className={ROW_RULE}>
                            <span
                              className={cn(
                                'block w-full overflow-hidden type-body-m text-[var(--color-text-primary-default)]',
                                wrap ? 'line-clamp-2' : 'truncate',
                              )}
                            >
                              {value}
                            </span>
                          </TableDataCell>
                        )
                        return (
                          <tr
                            key={t.id}
                            onClick={() => onOpenTemplate?.(t)}
                            onMouseEnter={() => setHovered(t.id)}
                            onMouseLeave={() => setHovered((h) => (h === t.id ? null : h))}
                            className="group h-[64px] cursor-pointer"
                          >
                            <td className="p-0" onClick={(e) => e.stopPropagation()}>
                              <TableDataCell type="slot" state={cellState} className={cn('justify-center', ROW_RULE)}>
                                <Checkbox
                                  selection={isSelected ? 'selected' : 'none'}
                                  aria-label={`Select ${t.name}`}
                                  onClick={() => toggle(t.id)}
                                />
                              </TableDataCell>
                            </td>
                            <td className="p-0">{text(t.name)}</td>
                            <td className="p-0">{text(t.description)}</td>
                            <td className="p-0">{text(t.productName || EMPTY)}</td>
                            <td className="p-0">{text(t.serviceCode)}</td>
                            <td className="p-0">{text(t.channels.join(', ') || EMPTY, true)}</td>
                            <td className="p-0">
                              <TableDataCell type="slot" state={cellState} className={ROW_RULE}>
                                {/* The download mark sits at one position on every row,
                                    20 clear of the widest badge — not after each badge. */}
                                <div className="relative flex w-full items-center">
                                  {/* The original sets showIcon off; webds Badge draws its
                                      placeholder unless the slot is given something. */}
                                  <Badge type={TONE[t.status]} size="xs" icon={false}>
                                    {t.status}
                                  </Badge>
                                  <button
                                    type="button"
                                    aria-label={`Download ${t.name}`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setToDownload([t])
                                    }}
                                    className="invisible absolute top-1/2 left-[87px] inline-flex h-[16px] w-[24px] -translate-y-1/2 cursor-pointer items-center group-focus-within:visible group-hover:visible"
                                  >
                                    <Icon slug="download" size={16} color="var(--color-icon-highlight-default)" />
                                  </button>
                                </div>
                              </TableDataCell>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
            {rows.length > 0 && (
              <div className="flex h-[68px] w-full shrink-0 items-center justify-end bg-[var(--color-surface-primary-default)] px-[var(--space-4)] shadow-[inset_0_1px_0_0_var(--color-border-primary-default)]">
                <TablePagination
                  showPageSize={false}
                  range={`${current * PAGE_SIZE + 1}-${current * PAGE_SIZE + rows.length}`}
                  count={String(filtered.length)}
                  onPrevious={() => current > 0 && setPage(current - 1)}
                  onNext={() => current < pages - 1 && setPage(current + 1)}
                />
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={toDownload !== null}
        anatomy="sectioned"
        contentType="label-xl"
        layer="fixed"
        width={600}
        title="Download the selected items?"
        cancelLabel="Cancel"
        confirmLabel="Download"
        onCancel={() => setToDownload(null)}
        onDismiss={() => setToDownload(null)}
        onConfirm={download}
        className="z-50"
      >
        Each selected item will be saved as a separate JSON file
      </ConfirmDialog>

      <ListToast
        open={notice !== null}
        appearance="positive"
        title={notice ? NOTICES[notice].title : ''}
        description={notice ? NOTICES[notice].description : ''}
        onClose={() => onNoticeClose?.()}
      />
      <ListToast
        open={downloaded}
        appearance="positive"
        title="Download Success"
        description="Please try again"
        onClose={() => setDownloaded(false)}
      />
      <ImportDialog
        open={importOpen}
        preset={importPreset === 'success' ? undefined : importPreset}
        importedNames={importedNames}
        onClose={() => setImportOpen(false)}
        onImported={(list, fileName, replace) => {
          setImportOpen(false)
          setPage(0)
          clearSelection()
          onImport?.(list, fileName, replace)
          setImported(list.length)
        }}
      />
      <ListToast
        open={imported !== null}
        appearance="positive"
        title={IMPORT_COPY.successTitle}
        description={imported === null ? '' : IMPORT_COPY.successBody(imported)}
        autoHideMs={importPreset === 'success' ? undefined : 3000}
        onClose={() => setImported(null)}
      />
      <ListToast
        open={downloadFailed}
        appearance="negative"
        title="Unable to download"
        description="Please try again"
        onClose={() => setDownloadFailed(false)}
      />
    </div>
  )
}
