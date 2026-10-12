import type { Broadcast } from '@/data/broadcast'

export type BroadcastDrawerProps = {
  broadcast: Broadcast
  onClose: () => void
  /** Draft only. */
  onEdit: () => void
}

/* STUB — ported by the broadcast list agent. */
export function BroadcastDrawer(_props: BroadcastDrawerProps) {
  return null
}
