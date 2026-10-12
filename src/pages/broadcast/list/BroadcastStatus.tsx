import { StatusBadge, type StatusTone } from '@/patterns/status-badge'
import { STATUS_TONE, type BroadcastStatus as Status } from '@/data/broadcast'

/* The original draws its package's Badge with the icon off. webds `Badge`
 * always draws a mark (BBL's placeholder when none is passed), so the status
 * is the `status-badge` pattern — the accent rows with no icon, which is what
 * it exists for. The original's tones map onto its rows one to one. */
const TONE: Record<(typeof STATUS_TONE)[Status], StatusTone> = {
  caution: 'yellow',
  disabled: 'grey',
  accent: 'blue',
  positive: 'green',
}

export function BroadcastStatus({ status, size = 'm' }: { status: Status; size?: 'l' | 'm' }) {
  return (
    <StatusBadge tone={TONE[STATUS_TONE[status]]} size={size}>
      {status}
    </StatusBadge>
  )
}
