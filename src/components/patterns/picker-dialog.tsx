import { useState } from 'react'
import { Button } from '@/bbl/button'
import { OutlineButton } from '@/bbl/outline-button'
import { GhostButton } from '@/bbl/ghost-button'
import { Icon } from '@/bbl/icon'
import { Checkbox } from '@/bbl/checkbox'
import { RadioButton } from '@/bbl/radio-button'
import { ListContent } from '@/bbl/building-block-list-content'
import { ConfirmDialog } from './confirm-dialog'
import { EmptyState } from './empty-state'
import { FormField } from './form-field'

/* **Picker Dialog** — search a list and pick one or several. webds has no
 * combobox or searchable pick list; this is the dialog form of one.
 *
 * Measured on CMS Web Content Admin Portal (`MI2zFydRz9Qi673VeklnkI` ·
 * 1537:119725 "Link Document Type", four states — Default, No data, Can not
 * show data, Document Id — and final UI 3107:174450):
 *
 *   shell    Confirm Dialog, `sectioned`, 600 wide, `layer="fixed"`; the title
 *            and an Outline **Create new +** side by side in the title row
 *   search   Form Field `search` (the library's Search Field), 24 above the list
 *   list     393 tall, scrolling — the list's share of the board's fixed 641;
 *            no token. List Content rows 24 tall, 16 apart: Checkbox 24 (multi)
 *            or Radio Button (single) leading, gap 12, the label Label XL
 *   empty    Empty State `no-results`: nothing to pick at all, or a search that
 *            matched nothing — two lines each
 *   failed   Empty State with **Can not show data** and a Highlight Ghost
 *            **Refresh** + refresh 16, which calls `onRefresh`
 *   actions  Cancel, Confirm — right-aligned at their own widths; Confirm stays
 *            disabled until something is picked
 *
 * The board's rules under the title and above the actions are not drawn:
 * `sectioned` has none (CMS HANDOFF D23 — the build follows webds here).
 * Callers pass only what can be picked; an unavailable row is left out, not
 * listed disabled. Copy defaults are the board's English.
 *
 * Consumer-measured. */

export type PickerOption = { value: string; label: string }

export type PickerDialogCopy = {
  createNew: string
  cancel: string
  confirm: string
  search: string
  canNotShowData: string
  refresh: string
  /** A search that matches nothing. */
  noResult: [string, string]
}

export const PICKER_DIALOG_COPY_EN: PickerDialogCopy = {
  createNew: 'Create new',
  cancel: 'Cancel',
  confirm: 'Confirm',
  search: 'Search',
  canNotShowData: 'Can not show data',
  refresh: 'Refresh',
  noResult: ['No results found for your search.', 'Please try adjusting your keywords.'],
}

export type PickerDialogProps = {
  title: React.ReactNode
  options: PickerOption[]
  /** One pick only: radio rows, a second pick replaces the first. */
  single?: boolean
  /** What to say when there is nothing to pick at all — two lines. */
  empty: [React.ReactNode, React.ReactNode]
  /** The list could not load — draws the Can not show data state. */
  failed?: boolean
  onRefresh?: () => void
  /** Omit and the title row has no Create new button. */
  onCreate?: () => void
  onClose: () => void
  onConfirm: (values: string[]) => void
  /** Empty State's illustration slots; webds ships none (see empty-state). */
  emptyIcon?: React.ReactNode
  failedIcon?: React.ReactNode
  width?: number
  copy?: Partial<PickerDialogCopy>
}

export function PickerDialog({
  title,
  options,
  single = false,
  empty,
  failed = false,
  onRefresh,
  onCreate,
  onClose,
  onConfirm,
  emptyIcon,
  failedIcon,
  width = 600,
  copy: copyProp,
}: PickerDialogProps) {
  const copy = { ...PICKER_DIALOG_COPY_EN, ...copyProp }
  const [picked, setPicked] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const shown = options.filter((o) => !q || o.label.toLowerCase().includes(q))
  const message = options.length === 0 ? empty : shown.length === 0 ? copy.noResult : null
  const toggle = (value: string) =>
    setPicked((prev) => (single ? [value] : prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))

  return (
    <ConfirmDialog
      anatomy="sectioned"
      layer="fixed"
      width={width}
      title={
        <span className="webds-pattern-picker-dialog-title">
          <span className="webds-pattern-picker-dialog-title-text">{title}</span>
          {onCreate && (
            <OutlineButton onClick={onCreate}>
              {copy.createNew}
              <Icon slug="plus" size={16} color="var(--color-icon-highlight-default)" />
            </OutlineButton>
          )}
        </span>
      }
      onDismiss={onClose}
      actions={
        <>
          <OutlineButton onClick={onClose}>{copy.cancel}</OutlineButton>
          <Button disabled={picked.length === 0} onClick={() => onConfirm(picked)}>
            {copy.confirm}
          </Button>
        </>
      }
    >
      <span className="webds-pattern-picker-dialog-body">
        <FormField spec={{ label: copy.search, kind: 'search', autoFocus: true }} value={query} onChange={setQuery} />
        <span className="webds-pattern-picker-dialog-list">
          {failed ? (
            <EmptyState
              variant="no-results"
              className="webds-pattern-picker-dialog-empty"
              icon={failedIcon}
              action={
                <GhostButton appearance="highlight" padding="none" onClick={onRefresh}>
                  {copy.refresh}
                  <Icon slug="refresh" size={16} color="var(--color-icon-highlight-default)" />
                </GhostButton>
              }
            >
              {copy.canNotShowData}
            </EmptyState>
          ) : message ? (
            <EmptyState variant="no-results" className="webds-pattern-picker-dialog-empty" icon={emptyIcon}>
              <span className="webds-pattern-picker-dialog-line">{message[0]}</span>
              <span className="webds-pattern-picker-dialog-line">{message[1]}</span>
            </EmptyState>
          ) : (
            shown.map((o) => (
              /* A row keeps its own 24 — ListContent fills its parent, so a lone
                 row would otherwise stretch to the list's height. */
              <span key={o.value} className="webds-pattern-picker-dialog-row">
                <ListContent type="custom" size="m">
                  {single ? (
                    <RadioButton aria-label={o.label} selected={picked.includes(o.value)} onClick={() => toggle(o.value)} />
                  ) : (
                    <Checkbox
                      aria-label={o.label}
                      selection={picked.includes(o.value) ? 'selected' : 'none'}
                      onClick={() => toggle(o.value)}
                    />
                  )}
                  <button type="button" onClick={() => toggle(o.value)} className="webds-pattern-picker-dialog-label">
                    {o.label}
                  </button>
                </ListContent>
              </span>
            ))
          )}
        </span>
      </span>
    </ConfirmDialog>
  )
}
