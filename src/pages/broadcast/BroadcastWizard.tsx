import { useRef } from 'react'
import { Button } from '@/bbl/button'
import { Icon } from '@/bbl/icon'
import { OutlineButton } from '@/bbl/outline-button'
import { ConsolePage } from '@/patterns/console-page'
import { BROADCAST_COPY, type Broadcast } from '@/data/broadcast'
import type { FormPreset } from '@/data/broadcast-presets'
import { Dialogs } from './create/Dialogs'
import { AudienceFile, BasicInfo, ChannelAlert, ChannelCards, Delivery, DndPanel, Section, type FocusRef } from './create/sections'
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
 * Create / Edit broadcast — one page, five steps, the actions pinned below.
 * The frame is webds `console-page` (CNH's own: 82 header with a back mark,
 * a 1280 column scrolling in px 80 / py 32, a 76 footer); each step is its
 * `FormStep`. Layout and step copy are draft 2.2 (Figma 70:6699, 15 Oct 2026):
 * the channels moved from Step 3's checkboxes onto their own cards' switches,
 * so Recipient mapping folded into the audience step.
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
        <Section title="Step 2: Validate Audience file">
          <AudienceFile f={f} focus={focus} />
        </Section>
        <Section
          title="Step 3: Manual content"
          note={f.fields.length ? undefined : 'Available fields appear here once the audience file is uploaded.'}
          alert={<ChannelAlert f={f} />}
        >
          <ChannelCards f={f} focus={focus} />
        </Section>
        <Section title="Step 4: Delivery">
          <Delivery f={f} />
        </Section>
        <Section title="Step 5: DND" note="Prevent sending messages during quiet hours.">
          <DndPanel f={f} />
        </Section>
      </ConsolePage>
      <Dialogs f={f} onBack={onBack} />
    </div>
  )
}
