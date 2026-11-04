import { useEffect, useRef, useState } from 'react'
import { CardSurface } from '@/bbl/building-block-card-surface'
import { Icon } from '@/bbl/icon'
import { Chevron } from '@/bbl/icons'
import { ListItem } from '@/bbl/list-item'
import { OutlineButton } from '@/bbl/outline-button'
import { IMPORT_COPY } from '@/data/import-spec'

/**
 * The Import button as a menu (requester, 2 Nov 2026: the Import Template page
 * becomes a sub-menu of Import and leaves the sidebar). It is the CMS
 * prototype's Create menu (`CreateMenuButton`, CMS final UI `527:105311`): a
 * Card Surface 15 under the button (pad 16, gap 16, 1 Border/Primary inside
 * stroke, raised shadow) holding a rounded, title-only List Item per option in
 * Label XL with a trailing Chevron-Right 16, Hovered / Clicked passed by hand
 * as CMS does (ListItem ships no :hover rule). webds has no dropdown menu, so
 * it is composed from those parts. Closes on a pick, a pointerdown outside or
 * Escape. Import file opens the Import dialog; Import Template opens the page
 * of every import. `open` holds it open for `#/list/import-menu`.
 */
export function ImportMenuButton({
  onImportFile,
  onViewImports,
  held = false,
}: {
  onImportFile: () => void
  onViewImports: () => void
  held?: boolean
}) {
  const [open, setOpen] = useState(held)
  const [hover, setHover] = useState<{ label: string; pressed: boolean } | null>(null)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => setOpen(held), [held])
  useEffect(() => {
    if (!open || held) return
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    const escape = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('pointerdown', away)
    addEventListener('keydown', escape)
    return () => {
      removeEventListener('pointerdown', away)
      removeEventListener('keydown', escape)
    }
  }, [open, held])

  const options = [
    { label: IMPORT_COPY.menuImportFile, onSelect: onImportFile },
    { label: IMPORT_COPY.menuViewImports, onSelect: onViewImports },
  ]

  return (
    <div ref={box} className="relative flex">
      <OutlineButton aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Import
        <Icon slug="chevron-down" size={16} color="var(--color-icon-highlight-default)" />
      </OutlineButton>
      {open && (
        <div role="menu" className="absolute top-[calc(100%+15px)] right-0 z-40 w-[288px]">
          <CardSurface className="h-auto flex-col items-stretch gap-[var(--space-4)] p-[var(--space-4)] shadow-[var(--shadow-raised)] outline outline-1 -outline-offset-1 outline-[var(--color-border-primary-default)]">
            {options.map((option) => (
              <div
                key={option.label}
                onPointerEnter={() => setHover({ label: option.label, pressed: false })}
                onPointerLeave={() => setHover(null)}
                onPointerDown={() => setHover({ label: option.label, pressed: true })}
                onPointerUp={() => setHover({ label: option.label, pressed: false })}
              >
                <ListItem
                  type="slot"
                  rounded
                  state={hover?.label === option.label ? (hover.pressed ? 'clicked' : 'hovered') : 'default'}
                  onClick={() => {
                    setOpen(false)
                    setHover(null)
                    option.onSelect()
                  }}
                  className="h-[38px]"
                >
                  <span role="menuitem" className="flex w-full items-center gap-[var(--space-3)]">
                    <span className="min-w-px flex-1 type-label-xl text-[var(--color-text-primary-default)]">{option.label}</span>
                    <Chevron name="right-16" className="fill-[var(--color-icon-primary-default)]" />
                  </span>
                </ListItem>
              </div>
            ))}
          </CardSurface>
        </div>
      )}
    </div>
  )
}
