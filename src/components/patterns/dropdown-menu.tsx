import { cn } from '@/lib/utils'
import { ListItem } from '@/bbl/list-item'
import { Icon } from '@/bbl/icon'

/* Dropdown Menu — the library's own set, `Dropdown Menu / List Type=Text,
 * Padding Type=Padded`, measured
 * where `Financial planning` (IfUYUQApZfEDkjIho9klKw) opens its filter fields
 * (I8002:65923 · 65946 · 65933 · 65927):
 *
 *   menu    p 8 · gap 4 · Radius 3 · 1 inside Border/Primary/Default ·
 *           Surface/Primary/Default · effect style `Overlay` · the field's width (240)
 *   item    List Item, List Content Size=S — 36 tall, p 8, Label L on Text/Primary;
 *           the current value drawn `State=Selected` (Label L Emphasized on
 *           Text/Highlight, Surface/Highlight/Subtle, a trailing Check 16), the
 *           pointer's `State=Hovered`
 *
 * Not Select List: that is Centralize Log's `Activity Option` — flush 36 rows at
 * p 8/16 in Body S Emphasized under a search field, Radius 2. Same job, a
 * different component, and the board names which one it placed. */
export type DropdownMenuOption = { value: string; label: React.ReactNode }

export type DropdownMenuProps = {
  options: DropdownMenuOption[]
  /** The current value — drawn Selected. */
  value?: string
  onSelect?: (value: string) => void
  /** Px, or `fill` to take the field's width. */
  width?: number | 'fill'
  className?: string
}

export function DropdownMenu({ options, value, onSelect, width = 'fill', className }: DropdownMenuProps) {
  return (
    <div
      role="listbox"
      style={width === 'fill' ? undefined : { width }}
      className={cn('webds-pattern-dropdown-menu', className)}
    >
      {options.map((o) => {
        const selected = o.value === value
        return (
          <ListItem
            key={o.value}
            size="s"
            titleOnly
            state={selected ? 'selected' : 'default'}
            title={o.label}
            trailing={selected && <Icon slug="check" size={16} color="var(--color-icon-highlight-default)" />}
            onClick={() => onSelect?.(o.value)}
          />
        )
      })}
    </div>
  )
}
