import { useEffect, useRef, useState } from 'react'
import { CardSurface } from '@/bbl/building-block-card-surface'
import { Divider } from '@/bbl/divider'
import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { Chevron } from '@/bbl/icons'
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
 * 29 Oct 2026). With no import in the menu it is the plain Import button and
 * opens the Import dialog. While one is there, Processing, in Error or
 * Completed, it opens the menu: a turning ring follows the label while a job
 * is Processing, a Negative mark while one is in Error. Finished imports stay
 * until Clear all, beside the Import Status heading, takes them all; a
 * Processing one stays until it finishes. In the menu
 * a Processing file carries the never-ending loading bar. The menu opens by
 * itself on Import, as Safari shows its list when a download starts.
 *
 * The menu is the CMS prototype's Create menu (`CreateMenuButton`, CMS final
 * UI `527:105311`; requester, 29 Oct 2026): a Card Surface 15 under the button
 * (pad 16, gap 16, 1 Border/Primary inside stroke, raised shadow) holding a
 * rounded, title-only List Item for Import file in Label XL with a trailing
 * Chevron-Right 16, Hovered / Clicked passed by hand as CMS does (ListItem
 * ships no :hover rule). It is 400 wide, not CMS's 288, to hold the job rows
 * under a divider. It closes on a pick, a pointerdown outside or Escape. The
 * ring is authored from Border tokens: webds ships no progress ring (gap).
 */
export function ImportMenuButton({
  jobs,
  open,
  onOpenChange,
  onImportFile,
  onRetry,
  onClear,
}: {
  jobs: ImportJob[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportFile: () => void
  onRetry: (id: number) => void
  /** Clear all: drops every finished import (Completed or Error) from the menu. */
  onClear: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ pressed: boolean } | null>(null)
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) onOpenChange(false)
    }
    const escape = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(false)
    addEventListener('pointerdown', away)
    addEventListener('keydown', escape)
    return () => {
      removeEventListener('pointerdown', away)
      removeEventListener('keydown', escape)
    }
  }, [open, onOpenChange])

  const busy = jobs.some((j) => j.status === 'processing')
  const failed = !busy && jobs.some((j) => j.status === 'failed')
  /* Any import not cleared yet — Processing, in Error, or Completed with its
     result still to read: while there is one, Import is a menu. */
  const pending = jobs.length > 0
  const finished = jobs.some((j) => j.status !== 'processing')

  return (
    <div ref={box} className="relative flex">
      {/* With no import in the menu Import is the plain button and opens the
          Import dialog (requester, 29 Oct 2026; was a chevron and the menu every
          time). While one is there it opens the menu: a turning ring follows the
          label while a job is Processing, a Negative mark while one is in Error,
          the plain label once all are Completed, until Clear all. */}
      <OutlineButton
        aria-haspopup={pending ? 'menu' : undefined}
        aria-expanded={pending ? open : undefined}
        aria-label={busy ? `Import, ${IMPORT_COPY.statusProcessing}` : failed ? `Import, ${IMPORT_COPY.statusFailed}` : undefined}
        onClick={() => (pending || open ? onOpenChange(!open) : onImportFile())}
      >
        Import
        {busy ? (
          <svg aria-hidden viewBox="0 0 16 16" className="size-[16px] animate-spin">
            <circle cx="8" cy="8" r="6.5" fill="none" strokeWidth="1.5" className="stroke-[var(--color-border-primary-default)]" />
            <circle cx="8" cy="8" r="6.5" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="10.2 30.6" className="stroke-[var(--color-border-highlight-default)]" />
          </svg>
        ) : (
          failed && <Icon slug="close-filled" size={16} color="var(--color-icon-negative-default)" />
        )}
      </OutlineButton>
      {open && (
        <div role="menu" className="absolute top-[calc(100%+15px)] right-0 z-40 w-[400px]">
          <CardSurface className="h-auto flex-col items-stretch gap-[var(--space-4)] p-[var(--space-4)] shadow-[var(--shadow-raised)] outline outline-1 -outline-offset-1 outline-[var(--color-border-primary-default)]">
            <div
              onPointerEnter={() => setHover({ pressed: false })}
              onPointerLeave={() => setHover(null)}
              onPointerDown={() => setHover({ pressed: true })}
              onPointerUp={() => setHover({ pressed: false })}
            >
              <ListItem
                type="slot"
                rounded
                state={hover ? (hover.pressed ? 'clicked' : 'hovered') : 'default'}
                onClick={() => {
                  onOpenChange(false)
                  onImportFile()
                }}
                className="h-[38px]"
              >
                <span role="menuitem" className="flex w-full items-center gap-[var(--space-3)]">
                  <span className="min-w-px flex-1 type-label-xl text-[var(--color-text-primary-default)]">{IMPORT_COPY.importFile}</span>
                  <Chevron name="right-16" className="fill-[var(--color-icon-primary-default)]" />
                </span>
              </ListItem>
            </div>
            {jobs.length > 0 && (
              <>
                <Divider />
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-[var(--space-3)]">
                    <span className="type-label-m-emphasized text-[var(--color-text-secondary-default)]">{IMPORT_COPY.indicator}</span>
                    {finished && (
                      <GhostButton
                        appearance="highlight"
                        padding="none"
                        onClick={() => {
                          onClear()
                          if (!busy) onOpenChange(false)
                        }}
                      >
                        {IMPORT_COPY.clearAll}
                      </GhostButton>
                    )}
                  </div>
                  <div className="flex max-h-[320px] flex-col overflow-y-auto">
                    {jobs.map((job) => (
                      <JobRow key={job.id} job={job} bar onRetry={onRetry} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardSurface>
        </div>
      )}
    </div>
  )
}
