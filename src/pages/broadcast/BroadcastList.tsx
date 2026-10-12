import type { Broadcast, ListToast } from '@/data/broadcast'

export type BroadcastListProps = {
  broadcasts: Broadcast[]
  onCreate: () => void
  onOpen: (b: Broadcast) => void
  /** The toast after Create returns; null when none. */
  created: ListToast | null
  /** On a preset route the toast is held open instead of timing out. */
  holdToast: boolean
  onCreatedClose: () => void
}

/* STUB — ported by the broadcast list agent. */
export function BroadcastList(props: BroadcastListProps) {
  return <div className="p-[var(--space-6)] type-heading-m">Broadcast message · {props.broadcasts.length}</div>
}
