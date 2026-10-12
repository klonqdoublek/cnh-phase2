import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/bbl/avatar'
import { Divider } from '@/bbl/divider'
import { GhostButton } from '@/bbl/ghost-button'
import { ListContent } from '@/bbl/building-block-list-content'

/* **Profile Menu** — the card that opens off a console's profile row: who you
 * are, a rule, and the one or two things you can do about it.
 *
 * TWO MEASUREMENTS, and they disagree on nearly every number — so this is one
 * `density` axis, not six knobs. Both are recorded; neither is a correction of
 * the other.
 *
 * `default` — `JjvzdUwg5LlKHDQvo2fny0` · 1:138455:
 *
 *   card    288 × **151** · Radius 2 · Surface/Primary/Default · 1px stroke
 *           INSIDE on Border/Primary · p 16 · gap 16
 *   who     List Content 256 × 42 — Avatar, then name over role
 *           name Label XL · role Body S
 *   rule    Divider 256
 *   action  Ghost Button 256 × 44, padding 0/16, gap 4 — label at x85, mark at
 *           x141, BOTH on the left (`profile__module.json` §0.1.0.2)
 *
 * `compact` — `3DimTxlt5i66CiH5wGmUvN` · 3045:214525 (the same screen, redrawn):
 *
 *   card    216 · Radius 2 · same surface and stroke · p 8 · gap 0
 *   who     row 200 × 46, px 8 py 8 gap 8 — Avatar, then name over role
 *           name Label M Emphasized 12/16 · role Body XXS 10/14
 *   rule    Divider inset px 16 → 168 of the 200
 *   action  row 200 × 36, px 16 py 8 gap 8 — the mark LEADS, at 16px, and the
 *           label is Body S 14/20 REGULAR, not the Ghost Button's Medium
 *
 * Two things in the redraw are NOT adopted, and the reason is the same for
 * both: they are hand-drawn, not placed. Its avatar is a plain frame at 30 with
 * `borderRadius 203.588` and a literal fill, where `Avatar` is a component
 * fixed at 32 with its own token — so the DS's 32 stands, 2px off the drawing.
 * Its type steps ARE adopted: every one of them resolves to a style this system
 * owns (Label M Emphasized, Body XXS, Body S in the dash-free roster), so they
 * are a design decision rather than a stray drag.
 *
 * **Dismissal is from the document, not from a catcher.** The first build of
 * this put a full-screen transparent div under the card to catch the outside
 * click — and it swallowed that click, so the first press anywhere on the page
 * only closed the menu: pressing a row, a filter or the search box appeared to
 * be ignored. A document listener registered on the next tick closes it without
 * eating the press, and the tick is what stops the click that OPENED it from
 * closing it again.
 *
 * Consumer-measured. */

export type ProfileMenuAction = {
  label: React.ReactNode
  /** The row's mark — at the far end on `default`, leading on `compact`. Pass
   *  the artwork; none is invented. */
  icon?: React.ReactNode
  onClick?: () => void
}

export type ProfileMenuDensity = 'default' | 'compact'

export type ProfileMenuProps = {
  name: React.ReactNode
  role?: React.ReactNode
  /** The Avatar's letters. Pass `avatar` instead for a picture. */
  initials?: string
  avatar?: React.ReactNode
  actions?: ProfileMenuAction[]
  onDismiss?: () => void
  /** Which of the two measurements above to draw. */
  density?: ProfileMenuDensity
  /** 288 on `default`, 216 on `compact` — both drawn. */
  width?: number
  className?: string
}

export function ProfileMenu({
  name,
  role,
  initials,
  avatar,
  actions = [],
  onDismiss,
  density = 'default',
  width,
  className,
}: ProfileMenuProps) {
  const compact = density === 'compact'
  const card = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onDismiss) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    const onDown = (e: MouseEvent) => {
      if (!card.current?.contains(e.target as Node)) onDismiss()
    }
    const id = setTimeout(() => document.addEventListener('mousedown', onDown), 0)
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onDismiss])

  return (
    <div
      ref={card}
      role="dialog"
      style={{ width: width ?? (compact ? 216 : 288) }}
      className={cn(
        'webds-pattern-profile-menu',
        compact
          ? /* `stroke-inside`, not a border: the redraw's 99 is padding plus
               children with the stroke ON the edge, so a border that takes part
               in layout ships 101. Same trap `MultiSelectPanel` carries. */
            'webds-pattern-profile-menu--s1'
          : /* `stroke-inside` here too: the spec records the Card Surface's 1px
               stroke as `INSIDE` and the card as 288 x **151**, which is
               16 + 42 + 16 + 1 + 16 + 44 + 16 exactly. A CSS border sits
               outside the auto height and shipped 153. */
            'webds-pattern-profile-menu--s2',
        className,
      )}
    >
      {compact ? (
        /* NO horizontal padding on this row, whatever the codegen says. Figma's
           auto-layout reports `px 8` on `Staff Profile Info`, but the node's own
           216 x 99 render puts the avatar's left edge at **8** — the card's
           padding and nothing more — while the rule below it starts at 24 and
           the Logout row's icon at 24. Padding it to match the codegen pushed
           the avatar and both text runs 8 to the right of where the file draws
           them. The render is the measurement; the reported padding is a claim. */
        <div className="webds-pattern-profile-menu-2">
          {avatar ?? (
            /* 30, inside the set's own 24–56 range — see `bbl/avatar.tsx`. */
            <Avatar type="letter" initials={initials} size={30} className="webds-pattern-profile-menu-3" />
          )}
          <div className="webds-pattern-profile-menu-4">
            <span className="webds-pattern-profile-menu-5">
              {name}
            </span>
            {role != null && (
              <span className="webds-pattern-profile-menu-6">
                {role}
              </span>
            )}
          </div>
        </div>
      ) : (
        <ListContent type="custom" size="m">
          {avatar ?? <Avatar type="letter" initials={initials} className="webds-pattern-profile-menu-7" />}
          <div className="webds-pattern-profile-menu-8">
            <span className="webds-pattern-profile-menu-9">{name}</span>
            {role != null && (
              <span className="webds-pattern-profile-menu-10">{role}</span>
            )}
          </div>
        </ListContent>
      )}
      {actions.length > 0 &&
        (compact ? (
          /* The rule does not run the card's full width here: its wrapper is
             `px 16` over the 200, which leaves 168 drawn. */
          <div className="webds-pattern-profile-menu-11">
            <Divider />
          </div>
        ) : (
          <Divider />
        ))}
      {actions.map((a, i) =>
        compact ? (
          <button
            key={i}
            type="button"
            className="webds-pattern-profile-menu-12"
            onClick={a.onClick}
          >
            {a.icon}
            <span className="webds-pattern-profile-menu-13">{a.label}</span>
          </button>
        ) : (
          /* `justify-start`, not `justify-between`. The Ghost Button is 256
             wide with padding 0/16 and its own gap 4, and the file draws the
             label at x85 with the mark at x141 — 4 after the label ends at 137,
             not parked at the far edge. `justify-between` was a reading of the
             render at a glance; the spec puts both runs on the left. */
          <GhostButton key={i} className="webds-pattern-profile-menu-14" onClick={a.onClick}>
            {a.label}
            {a.icon}
          </GhostButton>
        ),
      )}
    </div>
  )
}
