import { cn } from '@/lib/utils'
import { Chevron } from './icons'

/* BBL Breadcrumbs — `public/r/specs/breadcrumbs.json`, 5 variants (Number of
 * Level 1–5).
 *
 * A row with gap 8: a Label per level (Label L 14/20), a chevron between them.
 * The last level is `Text/Highlight/Default` and the ones before it are
 * `Text/Primary/Default` — the current page is the blue one, which reads
 * backwards next to most systems and is what the file says.
 *
 * Hover comes from `.Building Block / Breadcrumb`, the internal set on the same
 * page: Default → Text/Primary/Default, Hovered → Text/Highlight/Hovered,
 * Active → Text/Highlight/Default. That set is dotted, so it is internal and is
 * not counted in coverage; its three states are still measured, and they are
 * where a link's hover colour comes from rather than a guess.
 *
 * The separator is the 16px chevron's vector, 7.78 × 13.59. The spec used to
 * carry a second `Union` inside it — the operand of the boolean operation Figma
 * drew it with, 12.6 × 6.3 before rotation — which no rendered node can measure.
 * The extraction no longer descends into a boolean operation. */

export type BreadcrumbItem = {
  label: React.ReactNode
  href?: string
  onClick?: () => void
}

export type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('webds-breadcrumbs', className)}>
      {items.map((item, i) => {
        const current = i === items.length - 1
        return (
          <span key={i} className="webds-breadcrumbs-2">
            {i > 0 && (
              <Chevron
                name="right-16"
                part="Union"
                className="webds-breadcrumbs-3"
              />
            )}
            <a
              data-part="Label"
              href={item.href}
              onClick={item.onClick}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'webds-breadcrumbs-4',
                current
                  ? 'webds-breadcrumbs-4--s1'
                  : 'webds-breadcrumbs-4--s2',
              )}
            >
              {item.label}
            </a>
          </span>
        )
      })}
    </nav>
  )
}
