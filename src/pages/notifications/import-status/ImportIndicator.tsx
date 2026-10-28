import { useEffect, useRef } from 'react'
import { Icon } from '@/bbl/icon'
import { Popover } from '@/bbl/popover'
import { IMPORT_COPY } from '@/data/import-spec'
import { cn } from '@/lib/cn'
import type { ImportJob } from './jobs'
import { JobRow } from './JobRow'

/**
 * Direction C — an indicator beside Import, as Safari's downloads button
 * (and Contractbook's "Importing…" in its header; Mobbin, 28 Oct 2026). A
 * 44 Outline-sized square with the transaction-history mark: while a job
 * imports, a ring in Border/Highlight turns around it (the server gives no
 * percentage, so the ring does not fill); when every job is done, a Positive
 * tick sits on its corner, a Negative one if any failed. A click opens a
 * webds Popover (beak top, end) with the jobs as rows. It opens by itself on
 * Import, as Safari shows its list when a download starts. webds ships no
 * progress ring: authored from tokens (gap).
 */
export function ImportIndicator({
  jobs,
  open,
  onOpenChange,
  onRetry,
}: {
  jobs: ImportJob[]
  open: boolean
  onOpenChange: (open: boolean) => void
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

  if (!jobs.length) return null
  const busy = jobs.some((j) => j.status === 'processing')
  const failed = !busy && jobs.some((j) => j.status === 'failed')
  const done = !busy && !failed
  return (
    <div ref={box} className="relative flex">
      <button
        type="button"
        aria-label={IMPORT_COPY.indicator}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="relative flex size-[44px] items-center justify-center rounded-[var(--radius-2)] hover:bg-[var(--color-surface-primary-hovered)]"
      >
        {busy && <Ring />}
        <Icon slug="transaction-history" size={24} color="var(--color-icon-highlight-default)" />
        {(done || failed) && (
          <span className="absolute right-[var(--space-1)] bottom-[var(--space-1)] flex rounded-full bg-[var(--color-surface-primary-default)]">
            <Icon
              slug={failed ? 'close-filled' : 'tick-filled'}
              size={16}
              color={failed ? 'var(--color-icon-negative-default)' : 'var(--color-icon-positive-default)'}
            />
          </span>
        )}
      </button>
      {open && (
        <div className="absolute top-full right-0 z-40 mt-[var(--space-1)] w-[400px]">
          <Popover side="top" align="end" className="h-auto">
            <div className="flex w-full flex-col px-[var(--space-4)] py-[var(--space-1)]">
              {jobs.map((job) => (
                <JobRow key={job.id} job={job} onRetry={onRetry} />
              ))}
            </div>
          </Popover>
        </div>
      )}
    </div>
  )
}

/** An indeterminate ring: a quarter arc of Border/Highlight turning on a Border/Primary track. */
function Ring() {
  return (
    <svg aria-hidden viewBox="0 0 44 44" className={cn('pointer-events-none absolute inset-0 size-full animate-spin')}>
      <circle cx="22" cy="22" r="20" fill="none" strokeWidth="2" className="stroke-[var(--color-border-primary-default)]" />
      <circle
        cx="22"
        cy="22"
        r="20"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="31.4 94.2"
        className="stroke-[var(--color-border-highlight-default)]"
      />
    </svg>
  )
}
