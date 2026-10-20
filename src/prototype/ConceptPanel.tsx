import { useEffect, useState } from 'react'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { OutlineButton } from '@/bbl/outline-button'
import { SegmentedTab } from '@/bbl/segmented-tab'
import { useHash } from '@/lib/hash'
import { FIGMA_FILE, IDEAS, ideaOf, setConcept, useConcept, type Layout, type Picker, type Placement } from './dynamic-field'

/* Prototype runner only — the Concept panel over Create / Edit broadcast. It
 * sits in the page header's empty right side and switches the dynamic-field
 * concept (./dynamic-field.ts): a draft at a time, or each axis on its own.
 * `?panel=0` keeps it out of the task flow's frames, as the Task flow button.
 * Not product UI: never hand this file to a dev team. */

const PICKERS: { value: Picker; label: string }[] = [
  { value: 'pills', label: 'Pills' },
  { value: 'button', label: 'Button + pop-up' },
]
const PLACEMENTS: { value: Placement; label: string }[] = [
  { value: 'shared', label: 'One for all' },
  { value: 'channel', label: 'Per channel' },
]
const LAYOUTS: { value: Layout; label: string }[] = [
  { value: 'columns', label: '3 columns' },
  { value: 'stacked', label: 'Stacked (CNH)' },
]

function Axis<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string
  items: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className="type-label-m text-[var(--color-text-secondary-default)]">{label}</span>
      <SegmentedTab
        items={items.map((i) => i.label)}
        selectedIndex={items.findIndex((i) => i.value === value)}
        onSelect={(i) => onChange(items[i].value)}
      />
    </div>
  )
}

export function ConceptPanel() {
  const hash = useHash()
  const concept = useConcept()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  if (new URLSearchParams(location.search).get('panel') === '0') return null
  if (!/^#\/broadcast\/(create|edit)/.test(hash)) return null

  const idea = ideaOf(concept)
  const name = idea ? idea.label : 'Mixed'

  return (
    <div className="fixed right-[var(--space-6)] top-[var(--space-4)] z-[1300] flex flex-col items-end gap-[var(--space-2)]">
      <OutlineButton appearance="neutral" aria-expanded={open} onClick={() => setOpen(!open)}>
        Dynamic field · {name}
        <Icon slug={open ? 'chevron-up' : 'chevron-down'} size={16} color="currentColor" />
      </OutlineButton>
      {open && (
        <div
          role="dialog"
          aria-label="Dynamic field concept"
          className="flex w-[400px] flex-col gap-[var(--space-4)] rounded-[var(--radius-3)] bg-[var(--color-surface-primary-default)] p-[var(--space-4)] shadow-[inset_0_0_0_1px_var(--color-border-primary-default),var(--shadow-overlay)]"
        >
          <span className="flex items-center justify-between">
            <span className="type-label-l-emphasized text-[var(--color-text-primary-default)]">Prototype control</span>
            <IconButton label="Close" icon={<Icon slug="close" size={16} />} size={16} onClick={() => setOpen(false)} />
          </span>
          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="type-label-m text-[var(--color-text-secondary-default)]">Draft</span>
            <SegmentedTab
              items={IDEAS.map((i) => i.id)}
              selectedIndex={idea ? IDEAS.indexOf(idea) : -1}
              onSelect={(i) => setConcept(IDEAS[i].concept)}
            />
            <span className="type-body-s text-[var(--color-text-secondary-default)]">
              {idea ? (
                <>
                  {idea.note} ·{' '}
                  <a
                    href={`${FIGMA_FILE}?node-id=${idea.node}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-text-link-default)] hover:underline"
                  >
                    Figma {idea.node.replace('-', ':')}
                  </a>
                </>
              ) : (
                'A mix of the axes below — no draft draws it.'
              )}
            </span>
          </div>
          <Axis label="Field picker" items={PICKERS} value={concept.picker} onChange={(picker) => setConcept({ picker })} />
          <Axis
            label="Placement"
            items={PLACEMENTS}
            value={concept.placement}
            onChange={(placement) => setConcept({ placement })}
          />
          <Axis label="Channel layout" items={LAYOUTS} value={concept.layout} onChange={(layout) => setConcept({ layout })} />
        </div>
      )}
    </div>
  )
}
