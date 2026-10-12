import { cn } from '@/lib/utils'
import { Avatar } from './avatar'
import { PlaceholderIcon, PlaceholderIcon24 } from './icons'

/* BBL List Content — `public/r/specs/list.json`, set
 * "Building Block / List Content", 24 variants: `Type` (Text / Icon / Avatar /
 * Custom Content) × `Size` (M / S) × `State` (Default / Selected / Disabled).
 *
 * The row inside a list item: an optional leading mark and a title over a
 * description. Size moves both the gap and the type roles together —
 *
 *   M   gap 12, Title Label XL 16/22, Description Body S 14/20, icon 24
 *   S   gap 8,  Title Label L 14/20,  Description Body XS 12/16, icon 16
 *
 * — so a row is 42 tall at M and 36 at S, which is just its two lines.
 *
 * **Selected makes the title Medium and turns both lines
 * `Text/Highlight/Default`**; Disabled turns both `Text/Disabled/Default` and
 * leaves the weight alone. The description follows the title's colour but never
 * its weight.
 *
 * `Custom Content` is the slot type: BBL draws it as three red #FF0000 @10%
 * markers reading "Replace with your own content", which the extraction skips,
 * so all six of its variants are a 16-tall empty row — which is exactly what a
 * slot is. Whatever goes in it is the caller's. */

export type ListContentType = 'text' | 'icon' | 'avatar' | 'custom'
export type ListContentSize = 'm' | 's'
export type ListContentState = 'default' | 'selected' | 'disabled'

const SIZE = {
  m: { gap: 'webds-building-block-list-content--m-gap', title: 'webds-building-block-list-content--m-title', description: 'webds-building-block-list-content--m-description' },
  s: { gap: 'webds-building-block-list-content--s-gap', title: 'webds-building-block-list-content--s-title', description: 'webds-building-block-list-content--s-description' },
} as const

const TITLE: Record<ListContentState, string> = {
  default: 'webds-building-block-list-content--title-default',
  selected: 'webds-building-block-list-content--title-selected',
  disabled: 'webds-building-block-list-content--title-disabled',
}

const DESCRIPTION: Record<ListContentState, string> = {
  default: 'webds-building-block-list-content--description-default',
  selected: 'webds-building-block-list-content--description-selected',
  disabled: 'webds-building-block-list-content--description-disabled',
}

export type ListContentProps = {
  type?: ListContentType
  size?: ListContentSize
  state?: ListContentState
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  /**
   * The set's `Trailing Container` — a 16 mark after the text. The library's
   * Dropdown Menu puts `Icon/16px/General Icon/Check` there on the selected row
   * (`Financial planning` IfUYUQApZfEDkjIho9klKw · I8002:65946).
   */
  trailing?: React.ReactNode
  className?: string
}

export function ListContent({
  type = 'text',
  size = 'm',
  state = 'default',
  title = 'Title',
  description = 'Description',
  children,
  trailing,
  className,
}: ListContentProps) {
  const s = SIZE[size]
  const iconFill =
    state === 'disabled'
      ? 'webds-building-block-list-content-icon-fill-t'
      : 'webds-building-block-list-content-icon-fill-f'
  return (
    <div
      className={cn(
        'webds-list-content',
        /* A slot row is as tall as whatever is dropped into it — BBL's own
           markers are 16, which is content, not a rule — so the row fills what
           it is given instead of pinning a height. The other three types hug
           their two lines, which is where 42 and 36 come from. */
        type === 'custom' && 'webds-list-content--s1',
        s.gap,
        className,
      )}
    >
      {type === 'icon' &&
        (size === 'm' ? <PlaceholderIcon24 className={iconFill} /> : <PlaceholderIcon className={iconFill} />)}
      {type === 'avatar' && (
        <Avatar type="image" state={state === 'selected' ? 'selected' : 'default'} className="webds-list-content-2" />
      )}
      {type === 'custom' ? (
        children
      ) : (
        <div className="webds-list-content-3">
          <span data-part="Title" className={cn(s.title, TITLE[state])}>
            {title}
          </span>
          {description !== null && (
            <span data-part="Description" className={cn(s.description, DESCRIPTION[state])}>
              {description}
            </span>
          )}
        </div>
      )}
      {trailing}
    </div>
  )
}
