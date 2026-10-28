import { useState } from 'react'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { Divider } from '@/bbl/divider'
import { IMPORT_COPY } from '@/data/import-spec'
import type { ImportJob } from './jobs'
import { JobRow } from './JobRow'

/**
 * Direction A — an upload panel at the bottom right (Google Drive, Dropbox,
 * Proton Drive, Chatbase, ElevenLabs; Mobbin, 28 Oct 2026). It opens on
 * Import and lists every job of this visit, newest first. Its header names
 * the state ("Importing 1 file", "Import complete", "Import failed"), folds
 * the list (chevron) and closes the panel (close). webds ships no floating
 * panel: Surface/Primary, Radius 3, the Border/Primary inset and
 * --shadow-overlay, as the Prototype control draws its own (gap). It sits
 * 16 above the list's 68 footer so the pagination stays in reach.
 */
export function UploadPanel({
  jobs,
  onRetry,
  onClose,
}: {
  jobs: ImportJob[]
  onRetry: (id: number) => void
  onClose: () => void
}) {
  const [folded, setFolded] = useState(false)
  const processing = jobs.filter((j) => j.status === 'processing').length
  const failed = jobs.filter((j) => j.status === 'failed').length
  return (
    <section
      aria-label={IMPORT_COPY.indicator}
      className="fixed right-[var(--space-4)] bottom-[calc(68px+var(--space-4))] z-40 flex w-[400px] flex-col rounded-[var(--radius-3)] bg-[var(--color-surface-primary-default)] shadow-[inset_0_0_0_1px_var(--color-border-primary-default),var(--shadow-overlay)]"
    >
      <div className="flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)]">
        <span className="flex-1 type-label-l-emphasized text-[var(--color-text-primary-default)]">
          {IMPORT_COPY.panelTitle(processing, failed)}
        </span>
        <IconButton
          label={folded ? 'Expand' : 'Collapse'}
          icon={<Icon slug={folded ? 'chevron-up' : 'chevron-down'} size={16} color="var(--color-icon-primary-default)" />}
          onClick={() => setFolded((f) => !f)}
        />
        <IconButton label={IMPORT_COPY.close} icon={<Icon slug="close" size={16} color="var(--color-icon-primary-default)" />} onClick={onClose} />
      </div>
      {!folded && (
        <>
          <Divider />
          <div className="flex max-h-[320px] flex-col overflow-y-auto px-[var(--space-4)]">
            {jobs.map((job) => (
              <JobRow key={job.id} job={job} onRetry={onRetry} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
