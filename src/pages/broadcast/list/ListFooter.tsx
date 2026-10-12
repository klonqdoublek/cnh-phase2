import { useEffect, useRef } from 'react'
import { TablePagination } from '@/bbl/table-pagination'
import { cn } from '@/lib/cn'

/** The list's footer — 68, pad 16, a top rule, webds `TablePagination` with
 *  the counter and chevrons only, right-aligned: "1-6 of 6".
 *
 *  GAP (also in CMS, HANDOFF D6): the installed pagination has no disabled
 *  state. The chevrons are greyed from outside — `data-*` flags drive the
 *  colour and an effect sets the native `disabled`. */
export function ListFooter({
  page,
  pageSize,
  total,
  onPrevious,
  onNext,
}: {
  /** 0-based, as the original keeps it. */
  page: number
  pageSize: number
  total: number
  onPrevious: () => void
  onNext: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const atFirst = page <= 0
  const atLast = page >= pageCount - 1
  const first = total === 0 ? 0 : page * pageSize + 1
  const last = Math.min((page + 1) * pageSize, total)

  useEffect(() => {
    const [previous, next] = ref.current?.querySelectorAll('button[data-part="Icon Button"]') ?? []
    if (previous instanceof HTMLButtonElement) previous.disabled = atFirst
    if (next instanceof HTMLButtonElement) next.disabled = atLast
  }, [atFirst, atLast])

  return (
    <div
      ref={ref}
      data-prev-disabled={atFirst || undefined}
      data-next-disabled={atLast || undefined}
      className={cn(
        'flex h-[68px] w-full shrink-0 items-center justify-end bg-[var(--color-surface-primary-default)] px-[var(--space-4)] shadow-[inset_0_1px_0_0_var(--color-border-primary-default)]',
        '[&_button:disabled]:cursor-default',
        '[&[data-prev-disabled]_.webds-table-pagination-8]:fill-[var(--color-icon-disabled-subtle-default)]',
        '[&[data-next-disabled]_.webds-table-pagination-10]:fill-[var(--color-icon-disabled-subtle-default)]',
      )}
    >
      <TablePagination
        showPageSize={false}
        range={`${first}-${last}`}
        count={String(total)}
        onPrevious={atFirst ? undefined : onPrevious}
        onNext={atLast ? undefined : onNext}
      />
    </div>
  )
}
