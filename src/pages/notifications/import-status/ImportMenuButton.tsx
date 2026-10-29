import { useEffect, useRef, useState } from 'react'
import { CardSurface } from '@/bbl/building-block-card-surface'
import { Divider } from '@/bbl/divider'
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
 * 29 Oct 2026). The indicator replaces the button's chevron: a turning ring
 * while a job is Processing, back to the chevron once it is done (the button
 * keeps opening the menu), a Negative mark while one is in Error. In the menu
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
}: {
  jobs: ImportJob[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportFile: () => void
  onRetry: (id: number) => void
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

  return (
    <div ref={box} className="relative flex">
      {/* The button's trailing mark carries the state (requester, 29 Oct 2026): a
          turning ring in place of the chevron while a job is Processing, the
          chevron again once it is done, a Negative mark while one is in Error.
          Was a badge at the button's bottom right. */}
      <OutlineButton
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={busy ? `Import, ${IMPORT_COPY.statusProcessing}` : failed ? `Import, ${IMPORT_COPY.statusFailed}` : undefined}
        onClick={() => onOpenChange(!open)}
      >
        Import
        {busy ? (
          <svg aria-hidden viewBox="0 0 16 16" className="size-[16px] animate-spin">
            <circle cx="8" cy="8" r="6.5" fill="none" strokeWidth="1.5" className="stroke-[var(--color-border-primary-default)]" />
            <circle cx="8" cy="8" r="6.5" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="10.2 30.6" className="stroke-[var(--color-border-highlight-default)]" />
          </svg>
        ) : failed ? (
          <Icon slug="close-filled" size={16} color="var(--color-icon-negative-default)" />
        ) : (
          <Icon slug={open ? 'chevron-up' : 'chevron-down'} size={16} color="currentColor" />
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
                  <span className="type-label-m-emphasized text-[var(--color-text-secondary-default)]">{IMPORT_COPY.indicator}</span>
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
