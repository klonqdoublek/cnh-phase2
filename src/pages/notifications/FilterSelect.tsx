import { MultiSelectDropdown } from '@/patterns/multi-select-dropdown'

/**
 * One of the list's three multi-select filters — webds `multi-select-dropdown`
 * in the CNH 291 panel shape (`JjvzdUwg5LlKHDQvo2fny0` · 1:136265): no search
 * row, no chips, the field carries the summary, and filters OPEN with every
 * option ticked so the field reads "All" (hence `lockWhenAllSelected` off).
 * Nothing ticked also reads "All" — the original treats it as no filter.
 */
export function FilterSelect({
  label,
  options,
  value,
  onChange,
  optionLabel = (o) => o,
}: {
  label: string
  options: readonly string[]
  value: string[]
  onChange: (value: string[]) => void
  /** What an option reads, when it differs from its value. */
  optionLabel?: (option: string) => string
}) {
  return (
    <MultiSelectDropdown
      label={label}
      options={options.map((o) => ({ value: o, label: optionLabel(o) }))}
      value={value}
      onChange={onChange}
      allLabel="All"
      placeholder="All"
      selectAllLabel="Select all"
      clearAllLabel="Clear"
      panelWidth={291}
      showSearch={false}
      showChips={false}
      lockWhenAllSelected={false}
      disableSpentActions
      fieldBoxClassName="h-[64px]"
      className="w-full"
    />
  )
}
