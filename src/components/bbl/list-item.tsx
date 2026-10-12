import { cn } from '@/lib/utils'
import { ListContent, type ListContentType } from './building-block-list-content'

/* BBL List Item — `public/r/specs/list.json`, set "List Item", 20 variants:
 * `Type` (Default / Icon / Avatar / Slot) × `State` (Default / Hovered /
 * Clicked / Selected / Disabled).
 *
 * A `List Surface` carrying a List Content row. The surface is the only thing
 * the spec records as a child, and it is where every state lives:
 *
 *   Default   Surface/Primary/Default      Selected  Surface/Highlight/Subtle/Default
 *   Hovered   Surface/Primary/Hovered      Disabled  Surface/Disabled/Default
 *   Clicked   Surface/Primary/Pressed
 *
 * Type only changes what the row holds, and the marks for Icon and Avatar sit
 * deeper than the spec captures — which is why all three of Default, Icon and
 * Avatar record the same shape. Slot is the shorter one: 32 tall against 58,
 * because a slot row has no two lines of text.
 *
 * **The 58 assumes two lines.** A row with a title and no description needs
 * neither the second line nor the space kept for it, and a consuming file draws
 * exactly that at **38** — one Label XL line inside the same 8 padding
 * (`JjvzdUwg5LlKHDQvo2fny0` · sidebar nav row 288 x 38, radius 8). The set
 * publishes no such variant, so the height came from the consumer, who had to
 * rebuild the row out of `ListContent` to get it. `titleOnly` is that height,
 * and `radius` is the `List Surface|Radius=Rounded` the same file draws — both
 * off by default, so nothing measured moves.
 *
 * Hovered and Clicked are drawn states here rather than CSS ones: the harness
 * measures them as variants, and a list row's press state is usually driven by
 * the row's own selection logic. They are props, and the component also carries
 * the matching `:hover` / `:active` rules so it behaves without them. */

export type ListItemType = 'default' | 'icon' | 'avatar' | 'slot'
export type ListItemState = 'default' | 'hovered' | 'clicked' | 'selected' | 'disabled'

const SURFACE: Record<ListItemState, string> = {
  default: 'webds-list-item--default',
  hovered: 'webds-list-item--hovered',
  clicked: 'webds-list-item--clicked',
  selected: 'webds-list-item--selected',
  disabled: 'webds-list-item--disabled',
}

const CONTENT_TYPE: Record<ListItemType, ListContentType> = {
  default: 'text',
  icon: 'icon',
  avatar: 'avatar',
  slot: 'custom',
}

export type ListItemProps = {
  type?: ListItemType
  state?: ListItemState
  /** A title with no description: one line, 38 tall instead of 58. */
  titleOnly?: boolean
  /** `List Surface|Radius=Rounded` — radius 8 on the surface. */
  rounded?: boolean
  /**
   * List Content's `Size`. M (Label XL) is the set's default; S (Label L) is what
   * the library's Dropdown Menu places — 36 tall with `titleOnly`
   * (`Financial planning` IfUYUQApZfEDkjIho9klKw · I8002:65923).
   */
  size?: 'm' | 's'
  onClick?: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  /** List Content's trailing mark (a 16 icon). */
  trailing?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function ListItem({
  type = 'default',
  state = 'default',
  titleOnly,
  rounded,
  size = 'm',
  onClick,
  title,
  description,
  trailing,
  children,
  className,
}: ListItemProps) {
  return (
    <div className={cn('webds-list-item', className)}>
      <div
        data-part="List Surface"
        onClick={onClick}
        className={cn(
          'webds-list-item-2',
          type === 'slot'
            ? 'webds-list-item-2--s1'
            : titleOnly
              ? size === 's'
                ? 'webds-list-item-2--title-s'
                : 'h-[38px]'
              : 'h-[58px]',
          rounded && 'webds-list-item-2--s2',
          onClick && 'webds-list-item-2--s3',
          SURFACE[state],
        )}
      >
        <ListContent
          type={CONTENT_TYPE[type]}
          size={size}
          state={state === 'selected' ? 'selected' : state === 'disabled' ? 'disabled' : 'default'}
          title={title}
          /* Title only means no second line — not the placeholder "Description". */
          description={titleOnly ? null : description}
          trailing={trailing}
        >
          {children}
        </ListContent>
      </div>
    </div>
  )
}
