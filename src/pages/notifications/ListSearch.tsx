import { useRef, useState } from 'react'
import { SearchField } from '@/bbl/search-field'

/**
 * The list's search box — webds `SearchField` at the CNH board's 64 tall with
 * no Cancel (`JjvzdUwg5LlKHDQvo2fny0` · 1:135387 / 1:135841). The field is a
 * spec render that takes its value as a node, so the live <input> is passed
 * through the value slot; at rest it shows the resting label.
 */
export function ListSearch({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const active = focused || value.length > 0

  if (!active)
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        className="cursor-text"
        onClick={() => setFocused(true)}
        onFocus={() => setFocused(true)}
      >
        <SearchField state="Default" label={label} boxClassName="h-[64px]" />
      </div>
    )

  return (
    <SearchField
      state={focused ? (value ? 'Typing' : 'Focused') : 'Completed'}
      label={label}
      showCancel={false}
      boxClassName="h-[64px] flex-1"
      onClear={
        value
          ? () => {
              onChange('')
              input.current?.focus()
            }
          : undefined
      }
      value={
        <input
          ref={input}
          autoFocus
          type="search"
          aria-label={label}
          placeholder={label}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent type-body-m text-[var(--color-text-primary-default)] outline-none placeholder:text-[var(--color-text-placeholder-default)] [&::-webkit-search-cancel-button]:appearance-none"
        />
      }
    />
  )
}
