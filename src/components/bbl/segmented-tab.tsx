import { cn } from '@/lib/utils'
import { PillTab } from './pill-tab'
import { Tab } from './tab'

/* BBL Segmented Tab — `public/r/specs/tab.json`, set "Segmented Tab", 2
 * variants: `Tab Type` (Default / Pill).
 *
 * A tray around the other two: 32 tall, 2 of padding, gap 2, filled with
 * `Component/Tab/Segmented Tab/Container/Default`, holding tabs that each fill
 * an equal share. The tray's radius follows the tabs it holds — `Radius 2_5`
 * (10) around 8-radius Tabs, `Radius Full` around pills — which is 2 more than
 * the tab's own, exactly the padding.
 *
 * The tabs inside are On Secondary: the tray IS a secondary surface. The drawn
 * variants are 312 wide with five tabs at 60 each, and the tabs are FILL, so the
 * width is the tray's and the 60 follows from it.
 *
 * `data-part` on each tab is the name Figma gives the instance — `Tab` or
 * `Pill Tab` — which is why both accept a `part`. */

export type SegmentedTabType = 'default' | 'pill'

export type SegmentedTabProps = {
  type?: SegmentedTabType
  items: React.ReactNode[]
  selectedIndex?: number
  onSelect?: (index: number) => void
  className?: string
}

export function SegmentedTab({
  type = 'default',
  items,
  selectedIndex = 0,
  onSelect,
  className,
}: SegmentedTabProps) {
  const pill = type === 'pill'
  return (
    <div
      role="tablist"
      className={cn(
        'webds-segmented-tab',
        pill ? 'webds-segmented-tab--s1' : 'webds-segmented-tab--s2',
        className,
      )}
    >
      {items.map((item, i) =>
        pill ? (
          <PillTab
            key={i}
            part="Pill Tab"
            appearance="on-secondary"
            selected={i === selectedIndex}
            onClick={() => onSelect?.(i)}
            /* Inside the tray the pill is 28, not its own 32: the tray is 32 and
               takes 2 of padding either side. */
            className="webds-segmented-tab-2"
          >
            {item}
          </PillTab>
        ) : (
          <Tab
            key={i}
            part="Tab"
            appearance="on-secondary"
            selected={i === selectedIndex}
            onClick={() => onSelect?.(i)}
            className="webds-segmented-tab-3"
          >
            {item}
          </Tab>
        ),
      )}
    </div>
  )
}
