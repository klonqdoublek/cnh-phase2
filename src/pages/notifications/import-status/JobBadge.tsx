import { Badge, type BadgeType } from '@/bbl/badge'
import { IMPORT_COPY } from '@/data/import-spec'
import type { JobStatus } from './jobs'

const BADGE: Record<JobStatus, { type: BadgeType; label: string }> = {
  processing: { type: 'accent', label: IMPORT_COPY.statusProcessing },
  done: { type: 'positive', label: IMPORT_COPY.statusDone },
  failed: { type: 'negative', label: IMPORT_COPY.statusFailed },
}

/** An import's status as a webds Badge S: Accent Processing, Positive Completed, Negative Error (29 Oct 2026). */
export function JobBadge({ status }: { status: JobStatus }) {
  const badge = BADGE[status]
  return (
    <Badge type={badge.type} size="s" icon={false}>
      {badge.label}
    </Badge>
  )
}
