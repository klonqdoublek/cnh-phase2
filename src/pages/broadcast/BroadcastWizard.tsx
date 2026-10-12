import { useRef } from 'react'
import { Button } from '@/bbl/button'
import { Icon } from '@/bbl/icon'
import { OutlineButton } from '@/bbl/outline-button'
import { ConsolePage } from '@/patterns/console-page'
import { BROADCAST_COPY, type Broadcast } from '@/data/broadcast'
import type { FormPreset } from '@/data/broadcast-presets'
import { Dialogs } from './create/Dialogs'
import { AudienceFile, BasicInfo, ChannelCards, Delivery, DndPanel, FieldChips, Mapping, Section, type FocusRef } from './create/sections'
import { useBroadcastForm } from './create/useBroadcastForm'

export type SaveKind = 'draft' | 'submit'

export type BroadcastWizardProps = {
  /** Edit: the Draft reopened, saved back under its own id. */
  initial?: Broadcast
  failNext?: boolean
  preset?: FormPreset
  onBack: () => void
  onCreate: (broadcast: Omit<Broadcast, 'id'>, kind: SaveKind) => void
}

/**
 * Create / Edit broadcast — one page, six steps, the actions pinned below.
 * The frame is webds `console-page` (CNH's own: 82 header with a back mark,
 * a 1280 column scrolling in px 80 / py 32, a 76 footer); each step is its
 * `FormStep`. No Figma frame exists for this page; layout and copy are the
 * cnh-tm-phase2 build's.
 */
export function BroadcastWizard({ onBack, onCreate, failNext, preset, initial }: BroadcastWizardProps) {
  const f = useBroadcastForm({ onCreate, failNext, preset, initial })
  const body = useRef<HTMLDivElement>(null)
  const focus: FocusRef = useRef(null)

  return (
    <div className="relative h-full bg-[var(--color-surface-secondary-default)]">
      <ConsolePage
        className="h-full"
        bodyRef={body}
        back={
          <button
            type="button"
            aria-label="Back"
            onClick={() => (f.dirty ? f.setLeaveOpen(true) : onBack())}
            className="grid size-[24px] cursor-pointer place-items-center"
          >
            <Icon slug="chevron-left" size={24} />
          </button>
        }
        title={f.editing ? BROADCAST_COPY.edit : BROADCAST_COPY.create}
        actions={
          <>
            <OutlineButton className="w-[177px]" onClick={() => f.saveDraft(body.current)}>
              Save draft
            </OutlineButton>
            <Button className="w-[177px]" onClick={() => f.submit(body.current)}>
              Submit
            </Button>
          </>
        }
      >
        <Section title="Step 1: Basic information">
          <BasicInfo f={f} />
        </Section>
        <Section title="Step 2: Audience file">
          <AudienceFile f={f} />
        </Section>
        <Section title="Step 3: Recipient mapping & channels">
          <Mapping f={f} />
        </Section>
        <Section title="Step 4: Manual content" bare>
          <FieldChips f={f} focus={focus} />
          <ChannelCards f={f} focus={focus} />
        </Section>
        <Section title="Step 5: Delivery">
          <Delivery f={f} />
        </Section>
        <Section title="Step 6: Do Not Disturb (DND)">
          <DndPanel f={f} />
        </Section>
      </ConsolePage>
      <Dialogs f={f} onBack={onBack} />
    </div>
  )
}
