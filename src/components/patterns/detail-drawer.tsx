import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Divider } from '@/bbl/divider'
import { ScrollBar } from '@/bbl/scroll-bar'

/* **Detail Drawer** — a record read beside the list it came from, rather than
 * on a page of its own.
 *
 * The point of the arrangement is what it does NOT do: it does not navigate.
 * The table keeps its search, its filters and its page behind the panel, so
 * closing puts the reader back exactly where they were — which is why a console
 * reaches for this instead of a detail route whenever the answer is "let me
 * check one thing".
 *
 * Measured on `JjvzdUwg5LlKHDQvo2fny0` · 1:186729 (the Drawer inside 1:187272 —
 * one screen, not two sources):
 *
 *   panel   720 · Surface/Primary/Default · the library's Overlay elevation
 *   header  p 24 · gap 8 · a bottom rule — title, then a status row at gap 4,
 *           then a 24-tall row of facts at gap 16
 *   body    p 0/24/24/24 · gap 16 · a Scroll Bar inset 4 from the right
 *   section Divider, a 40-tall header row (24 mark · gap 12 · label), rows
 *   footer  77 · a top rule · p 16/24 · the actions at 44
 *
 * **The scroll bar is `Thick`.** Thin is 2 wide at rest and reads as a hairline
 * against a 720 panel; the file draws the thick one. It is also mounted a render
 * LATE — the overflow has to be measured before it is known to be needed — which
 * is worth knowing because a checker walking a stale tree will not see it.
 *
 * Consumer-measured. */

export type DetailDrawerSection = {
  /** The 24 mark at the head of the section. Pass artwork; none is invented. */
  icon?: React.ReactNode
  title: React.ReactNode
  /** `[label, value]` — a value the record does not carry is drawn, not hidden:
   *  an absent row and an empty one say different things. */
  rows: [React.ReactNode, React.ReactNode][]
}

export type DetailDrawerProps = {
  title: React.ReactNode
  /** The status row under the title — a label and a badge, at gap 4. */
  status?: React.ReactNode
  /** The 24-tall row of facts under it, at gap 16. */
  facts?: React.ReactNode
  sections?: DetailDrawerSection[]
  children?: React.ReactNode
  /** The footer's actions, at 44. Omit and no footer is drawn. */
  actions?: React.ReactNode
  /** 720 in the file. */
  width?: number
  /** The label column inside a section row. 200 in the file. */
  labelWidth?: number
  /** The close affordance in the header, if the consuming file draws one.
   *  A node, not a handler: the mark is the product's artwork, not this
   *  component's to invent. */
  close?: React.ReactNode
  className?: string
}

export function DetailDrawer({
  title,
  status,
  facts,
  sections = [],
  children,
  actions,
  width = 720,
  labelWidth = 200,
  close,
  className,
}: DetailDrawerProps) {
  const body = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)
  useLayoutEffect(() => {
    const el = body.current
    if (el) setOverflows(el.scrollHeight > el.clientHeight)
  }, [sections, children])

  return (
    <div
      role="dialog"
      aria-modal="false"
      style={{ width }}
      className={cn(
        'webds-pattern-detail-drawer',
        className,
      )}
    >
      <div
        data-part="Header"
        className="webds-pattern-detail-drawer-2"
      >
        <div className="webds-pattern-detail-drawer-3">
          <h2 className="webds-pattern-detail-drawer-4">
            {title}
          </h2>
          {close}
        </div>
        {status != null && <div className="webds-pattern-detail-drawer-5">{status}</div>}
        {facts != null && (
          <div className="webds-pattern-detail-drawer-6">{facts}</div>
        )}
      </div>

      <div className="webds-pattern-detail-drawer-7">
        <div
          ref={body}
          data-part="Body"
          className="webds-pattern-detail-drawer-8"
        >
          {sections.map((s, i) => (
            <div key={i} className="webds-pattern-detail-drawer-9">
              <Divider />
              <div className="webds-pattern-detail-drawer-10">
                {s.icon}
                <span className="webds-pattern-detail-drawer-11">
                  {s.title}
                </span>
              </div>
              {s.rows.map(([label, value], j) => (
                <div key={j} className="webds-pattern-detail-drawer-12">
                  <span
                    style={{ width: labelWidth }}
                    className="webds-pattern-detail-drawer-13"
                  >
                    {label}
                  </span>
                  <span className="webds-pattern-detail-drawer-14">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          ))}
          {children}
        </div>
        {overflows && (
          <ScrollBar appearance="thick" orientation="vertical" className="webds-pattern-detail-drawer-15" />
        )}
      </div>

      {actions != null && (
        <div
          data-part="Footer"
          className="webds-pattern-detail-drawer-16"
        >
          {actions}
        </div>
      )}
    </div>
  )
}
