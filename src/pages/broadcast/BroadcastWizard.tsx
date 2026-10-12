import type { Broadcast } from '@/data/broadcast'
import type { FormPreset } from '@/data/broadcast-presets'

export type SaveKind = 'draft' | 'submit'

export type BroadcastWizardProps = {
  /** Edit: the Draft reopened, saved back under its own id. */
  initial?: Broadcast
  failNext?: boolean
  preset?: FormPreset
  onBack: () => void
  onCreate: (broadcast: Omit<Broadcast, 'id'>, kind: SaveKind) => void
}

/* STUB — ported by the broadcast wizard agent. */
export function BroadcastWizard(props: BroadcastWizardProps) {
  return <div className="p-[var(--space-6)] type-heading-m">{props.initial ? 'Edit broadcast' : 'Create broadcast'}</div>
}
