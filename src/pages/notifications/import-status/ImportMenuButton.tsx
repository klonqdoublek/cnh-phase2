import { useEffect, useRef } from 'react'
import { Divider } from '@/bbl/divider'
import { Icon } from '@/bbl/icon'
import { ListItem } from '@/bbl/list-item'
import { OutlineButton } from '@/bbl/outline-button'
import { IMPORT_COPY } from '@/data/import-spec'
import type { ImportJob } from './jobs'
import { JobRow } from './JobRow'

/**
 * Direction G — the Import button opens a menu: Import file at the top, then
 * each import of this visit with its status, result and Download result /
 * Try again (requester, 29 Oct 2026; after Grok's "Upload documents" split
 * button, Remote's "Create" menu button and Railway's header list; Mobbin,
 * 29 Oct 2026). The indicator hangs at the button's bottom right: a turning
 * ring while a job is Processing, a Positive tick once all are Completed, a
 * Negative mark if one is in Error. The menu opens by itself on Import, as
 * Safari shows its list when a download starts.
 *
 * The menu wears webds Dropdown Menu's box (p 8, gap 4, Radius 3,
 * Border/Primary inset, Surface/Primary, --shadow-overlay) with a List Item S
 * for Import file; Dropdown Menu itself takes plain options only. The ring is
 * authored from Border tokens: webds ships no progress ring (gap).
 */
export function ImportMenuButton({
  jobs,
  open,
  onOpenChange,
  onImportFile,
  onRetry,
}: {
  jobs: ImportJob[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportFile: () => void
  onRetry: (id: number) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) onOpenChange(false)
    }
    addEventListener('pointerdown', away)
    return () => removeEventListener('pointerdown', away)
  }, [open, onOpenChange])

  const busy = jobs.some((j) => j.status === 'processing')
  const failed = !busy && jobs.some((j) => j.status === 'failed')
  const done = !busy && !failed && jobs.length > 0

  return (
    <div ref={box} className="relative flex">
      <OutlineButton aria-haspopup="menu" aria-expanded={open} onClick={() => onOpenChange(!open)}>
        Import
        <Icon slug={open ? 'chevron-up' : 'chevron-down'} size={16} color="currentColor" />
      </OutlineButton>
      {(busy || done || failed) && (
        <span
          role="img"
          aria-label={busy ? IMPORT_COPY.statusProcessing : failed ? IMPORT_COPY.statusFailed : IMPORT_COPY.statusDone}
          className="pointer-events-none absolute -right-[var(--space-1)] -bottom-[var(--space-1)] flex size-[16px] items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-surface-primary-default)]"
        >
          {busy ? (
            <svg aria-hidden viewBox="0 0 16 16" className="size-full animate-spin">
              <circle cx="8" cy="8" r="6" fill="none" strokeWidth="2" className="stroke-[var(--color-border-primary-default)]" />
              <circle cx="8" cy="8" r="6" fill="none" strokeWidth="2" strokeLinecap="round" strokeDasharray="9.4 28.3" className="stroke-[var(--color-border-highlight-default)]" />
            </svg>
          ) : (
            <Icon
              slug={failed ? 'close-filled' : 'tick-filled'}
              size={16}
              color={failed ? 'var(--color-icon-negative-default)' : 'var(--color-icon-positive-default)'}
            />
          )}
        </span>
      )}
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-40 mt-[var(--space-2)] flex w-[400px] flex-col gap-[var(--space-1)] rounded-[var(--radius-3)] bg-[var(--color-surface-primary-default)] p-[var(--space-2)] shadow-[inset_0_0_0_1px_var(--color-border-primary-default),var(--shadow-overlay)]"
        >
          <ListItem
            size="s"
            titleOnly
            title={IMPORT_COPY.importFile}
            onClick={() => {
              onOpenChange(false)
              onImportFile()
            }}
          />
          {jobs.length > 0 && (
            <>
              <Divider />
              <span className="px-[var(--space-2)] pt-[var(--space-2)] type-label-m-emphasized text-[var(--color-text-secondary-default)]">
                {IMPORT_COPY.indicator}
              </span>
              <div className="flex max-h-[320px] flex-col overflow-y-auto px-[var(--space-2)]">
                {jobs.map((job) => (
                  <JobRow key={job.id} job={job} onRetry={onRetry} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
