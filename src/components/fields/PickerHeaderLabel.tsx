import { Icon } from '@/bbl/icon'
import { PickerView } from './date-parts'

/** A webds picker's header label as the CMS final UI draws it — "January
 *  2025" with a 16 chevron, down on the Date view and up (Icon/Highlight) on
 *  Month and Year. Pressing it switches views. From the CMS prototype (v4.56). */
export function PickerHeaderLabel({
  text,
  pickerView,
  onToggle,
}: {
  text: string
  pickerView: PickerView
  onToggle: () => void
}) {
  const onDate = pickerView === PickerView.Date
  return (
    <button
      type="button"
      aria-expanded={!onDate}
      onClick={onToggle}
      className="flex cursor-pointer items-center gap-[var(--space-1)]"
    >
      {text}
      <Icon
        slug={onDate ? 'chevron-down' : 'chevron-up'}
        size={16}
        color={onDate ? 'var(--color-icon-primary-default)' : 'var(--color-icon-highlight-default)'}
      />
    </button>
  )
}
