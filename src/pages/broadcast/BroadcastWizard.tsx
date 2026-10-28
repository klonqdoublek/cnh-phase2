import { useRef } from 'react'
import { Button } from '@/bbl/button'
import { Icon } from '@/bbl/icon'
import { OutlineButton } from '@/bbl/outline-button'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { ConsolePage } from '@/patterns/console-page'
import { BROADCAST_COPY, type Broadcast } from '@/data/broadcast'
import type { FormPreset } from '@/data/broadcast-presets'
import { Dialogs } from './create/Dialogs'
import { AudienceFile, BasicInfo, Delivery, DndCard, MessageContent, Section, type FocusRef } from './create/sections'
import { useBroadcastForm } from './create/useBroadcastForm'
import { seedWithColumns, useConcept } from '@/prototype/dynamic-field'
import { useDndWarning } from '@/prototype/dnd-warning'

export type SaveKind = 'draft' | 'submit'

export type BroadcastWizardProps = {
  /** Edit: the Draft reopened, saved back under its own id. */
  initial?: Broadcast
  failNext?: boolean
  /** `…/loading`: the page while the form (or the draft) loads. */
  loading?: boolean
  preset?: FormPreset
  onBack: () => void
  onCreate: (broadcast: Omit<Broadcast, 'id'>, kind: SaveKind) => void
}

/**
 * Create / Edit broadcast — one page, three steps, the actions pinned below.
 * The frame is webds `console-page` (CNH's own: 82 header with a back mark,
 * a 1280 column scrolling in px 80 / py 32, a 76 footer); each step is its
 * `FormStep`. Layout and step copy are draft 2.2 webds-matched (Figma
 * 85:19401, 15 Oct 2026): the channels moved from checkboxes onto their own
 * cards' switches, and the message content sits under the audience step.
 * Do Not Disturb is its own card under Delivery Date, in the same step
 * (requester, 21 Oct 2026; Figma 409:75574).
 */
export function BroadcastWizard(props: BroadcastWizardProps) {
  /* The Prototype control's file size reseeds the form, so it remounts. */
  const { columns } = useConcept()
  return <Wizard key={columns} {...props} />
}

function Wizard({ onBack, onCreate, failNext, loading, preset, initial }: BroadcastWizardProps) {
  const { columns } = useConcept()
  const f = useBroadcastForm({ onCreate, failNext, preset, initial, adaptSeed: seedWithColumns(columns) })
  const body = useRef<HTMLDivElement>(null)
  const focus: FocusRef = useRef(null)
  /* Which dynamic-field draft the message area draws — the prototype's
     Concept panel switches it (src/prototype/ConceptPanel.tsx). */
  const concept = useConcept()
  /* Where Do Not Disturb that never ends is warned about (28 Oct 2026). */
  const dndWarning = useDndWarning()

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
            <OutlineButton className="w-[177px]" disabled={loading} onClick={() => f.saveDraft(body.current)}>
              Save draft
            </OutlineButton>
            <Button className="w-[177px]" disabled={loading} onClick={() => f.submit(body.current)}>
              Submit
            </Button>
          </>
        }
      >
        {loading ? (
          /* Create notification's loading body (#/create/loading). */
          <div className="flex min-h-[60vh] items-center justify-center">
            <SpinnerLoader size="l" appearance="brand" />
          </div>
        ) : (
          <>
            <Section title="Step 1: Basic information">
              <BasicInfo f={f} />
            </Section>
            <Section title="Step 2: Validate Audience file">
              <div className="flex flex-col gap-[var(--space-8)]">
                <AudienceFile f={f} />
                <MessageContent f={f} focus={focus} concept={concept} />
              </div>
            </Section>
            <Section title="Step 3: Delivery Date">
              <div className="flex flex-col gap-[var(--space-8)]">
                <Delivery f={f} />
                <DndCard f={f} warn={dndWarning === 'inline'} />
              </div>
            </Section>
          </>
        )}
      </ConsolePage>
      <Dialogs f={f} onBack={onBack} dndWarn={dndWarning === 'submit'} />
    </div>
  )
}
