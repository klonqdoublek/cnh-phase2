import { useState } from 'react'
import { cn } from '@/lib/utils'
import { GhostButton } from '@/bbl/ghost-button'
import { IconButton } from '@/bbl/icon-button'
import { FieldInfo } from './field-info'

/* Data Table — measured on `I4046:4507` (the CSP activity table).
 *
 * **Why not the library's Table.** Header Cell and Data Cell are both fixed at
 * 64 tall with 16 of padding, gap 8, one line of content. This table's rows hug:
 * 52 for the header, then 112 · 166 · 122 · 140, driven by whichever cell is
 * tallest — a three-line error message or an expanded panel. Built from the DS
 * cells it would be wrong on every row.
 *
 * Measured shell: rows `py 16 · gap 24`, a rule under each row
 * (`Border/Primary/Default`), header labels Body S on `Text/Tertiary`.
 *
 * The expanding column is the other half: a Ghost Button at Padding=None for the
 * label, a `More` + chevron affordance, and a panel on `Surface/Primary/Hovered`
 * at Radius 2 with 8 of padding — none of which the library draws (its Accordion
 * page is MUI reference, so it can never be verified).
 *
 * **Thai text uses `thai-chunk`.** Figma breaks Thai at spaces only; the browser
 * breaks inside words and fits more per line, which is how a row can come out
 * 20px short of the design. */

/** The type roles the two measured files put on a body cell. */
export type TableCellType = 'body-s' | 'body-s-emphasized' | 'label-l' | 'label-m'

const CELL_TYPE: Record<TableCellType, string> = {
  'body-s': 'webds-pattern-data-table--body-s',
  'body-s-emphasized': 'webds-pattern-data-table--body-s-emphasized',
  'label-l': 'webds-pattern-data-table--label-l',
  'label-m': 'webds-pattern-data-table--label-m',
}

export type TableColumn<Row> = {
  key: string
  label: React.ReactNode
  /** Fixed column width in px; omit for the column that takes the rest. */
  width?: number
  /**
   * The cell's type role. Defaults to Body S, which is what all 23 columns of
   * Centralize Log's log table read (`I6145:11243;7080:31786`); the CSP activity
   * table mixes Body S and Label L column by column, which is why this is per
   * column rather than one setting for the table.
   *
   * It matters more than it looks: **a body cell with no role inherits the
   * document's 16/24**, and at 16 every row of that log table came out a line
   * taller than the file — 200 against 152. The header already carries its role
   * for the same reason; the body was the half that was missing.
   */
  type?: TableCellType
  /**
   * Keep the cell on one line and let it run past its width, as an auto-width
   * Figma text node does: `Financial planning` (IfUYUQApZfEDkjIho9klKw ·
   * I8002:65949) sets "Created by customer" 131 wide in a 92 column and the row
   * stays 52.
   */
  nowrap?: boolean
  cell: (row: Row) => React.ReactNode
}

export type DataTableProps<Row> = {
  title?: React.ReactNode
  /**
   * A note the file sets **inline after** the title, in Heading XXS Emphasized
   * on Text/Highlight — `Unlock PIN history (for the past 90 days)`
   * (`0rkYsPNZNdn7weIJaRWkR2` · 2249:6388, measured 20/28 #0064FF).
   *
   * A prop rather than a caller-styled span: a template is copied, so a
   * hand-written `type-heading-xxs-emphasized text-[…highlight]` in one would
   * be a typographic decision no component owns and no restyle could reach.
   * What varies is the sentence, not its treatment.
   */
  titleNote?: React.ReactNode
  /**
   * A line above the header saying what the table covers — the file's
   * "History duration: 10/09/2024-10/09/2025" on `Table 5`'s second variant
   * (`3034:99893`, `UI - Notification Log`).
   *
   * Body XS on **Text/Primary/Default**, not the header's Text/Tertiary, in a row
   * of 24: the 16 of line plus 8 below it. It sits inside the table rather than
   * beside the title, which is why it is not just another `title` line.
   */
  caption?: React.ReactNode
  columns: TableColumn<Row>[]
  rows: Row[]
  /**
   * Drawn in place of the rows when there are none — pass an `EmptyState`.
   *
   * The file draws those state blocks **standalone**: `Table 4` (3034:99973) is
   * 1377 x {206,198,250} with no header row above it. Keeping the header here is
   * this pattern's decision, not something measured; render the Empty State on
   * its own if a screen wants it the way the file draws it.
   */
  empty?: React.ReactNode
  /**
   * Whether the column header survives the empty state. It does by default —
   * Centralize Log and Activity Log both keep it — but the CSP suspension board
   * (`2631:36594`) drops the whole Date/Activity/Details row and shows the block
   * alone under the title.
   *
   * This exists because of what its absence cost: with no way to say it, that
   * page passed no `empty` at all and drew the title itself, as an `<h2>` with
   * the type and colour classes copied out of this component. A page that draws
   * its own heading is a page the DS can no longer restyle — so the choice is
   * exposed here rather than left for every consumer to work around.
   * Third file, third answer, same as `columnGap`.
   */
  showHeaderWhenEmpty?: boolean
  /**
   * Below the last row: the file's `Show More` block — a count line and an
   * Outline Button, centred, at gap 16, with 16 above and 24 below
   * (5008:42978).
   */
  footer?: React.ReactNode
  /**
   * The footer block's own padding, `[top, bottom]`. **[16, 24] is Notification
   * table's** (`5008:42978`), the file this was measured on.
   *
   * `20260224_Activity log[Call Center]` draws the same block at **[24, 32]** —
   * `Frame 2085666803` at 136 tall and `Frame 2085666804` at 76, against 120 and
   * 60 here. Eight more at each end, on the same content.
   *
   * A prop for the same reason `labelWidth` is one: two product files disagree,
   * and there is nothing in either that says which is current. Pass what your
   * file draws.
   */
  footerPadding?: [number, number]
  /**
   * The second table shape the files draw — `Card detail` (`3034:99995`,
   * 1377 x 296), a flat list of card rows under a quiet header.
   *
   * It is one measured shape, not three knobs: the header loses its rule and
   * halves its padding (52 → 36) and the columns close from 24 to 8. The rows
   * are unchanged — `py 16`, hugging, each with its bottom rule.
   */
  density?: 'default' | 'compact'
  /**
   * The gap between columns, in px. Default 24 — Notification table's and
   * Activity Log's.
   *
   * A prop for the same reason `labelWidth` and `footerPadding` are: a third
   * product file disagrees. `XC_L1 - Suspend & Unsuspend` draws its Suspension
   * history header and rows at **64** (`I2631:34976;5068:58662`), on six fixed
   * columns that together leave 164 of slack rather than filling the row. Same
   * shape, different number, and nothing in either file says which is current.
   *
   * `density: 'compact'` still wins — that is a measured shape (Card detail),
   * not a knob, and it closes the columns to 8 as part of it.
   */
  columnGap?: number
  /**
   * A class per body row, for tables whose rows are not all the same kind.
   *
   * `XC1 - Customer profile` draws its credit-card table as primaries with the
   * cards issued to *other people* under them, revealed by a `+` on the parent
   * row; the child rows are the same six columns on a quieter surface. That is a
   * row-level distinction, and nothing else here can express it — the cell
   * renderers only own their own column, so a fill applied there stripes and
   * leaves the column gaps white.
   *
   * Additive and opt-in: with no `rowClassName` every row renders exactly as
   * before.
   */
  rowClassName?: (row: Row, index: number) => string | undefined
  /**
   * The header row's own surface. The pattern was measured on a file that
   * paints none, so none is the default; a second file
   * (`JjvzdUwg5LlKHDQvo2fny0` · 1:134939 row 0) paints it
   * `Surface/Primary/Hovered`. A value, not a product — pass what your file
   * draws.
   */
  headerSurface?: string
  /**
   * Whether a row lifts under the pointer. On, and painting
   * `Surface/Secondary/Default` — the one file that draws a hovered row draws
   * it that way (1:134939 row 4), and the files that do not draw one are
   * SILENT rather than opposed: a static frame rarely shows a hover, and a
   * table with no hover is a defect in any product. Nothing at rest moves, so
   * turning it on cannot change a measured screenshot.
   */
  hoverable?: boolean
  /**
   * Keep the header row in view while the body scrolls inside a fixed-height
   * parent. `Financial planning` (IfUYUQApZfEDkjIho9klKw · I8002:65951) draws its
   * Expense limit table scrolled to rows 43–50 with the header still on top.
   */
  stickyHeader?: boolean
  className?: string
}

export function DataTable<Row>({
  title,
  titleNote,
  caption,
  columns,
  rows,
  empty,
  showHeaderWhenEmpty = true,
  footer,
  footerPadding = [16, 24],
  density = 'default',
  columnGap,
  rowClassName,
  headerSurface,
  hoverable = true,
  stickyHeader = false,
  className,
}: DataTableProps<Row>) {
  const compact = density === 'compact'
  const colGap = compact ? 'webds-pattern-data-table-col-gap-t' : 'webds-pattern-data-table-col-gap-f'
  const gapStyle = !compact && columnGap != null ? { gap: columnGap } : undefined
  return (
    <div
      className={cn(
        'webds-pattern-data-table',
        className,
      )}
    >
      {title && (
        <h2 className="webds-pattern-data-table-2">
          {title}
          {titleNote && (
            <>
              {' '}
              <span className="webds-pattern-data-table-3">
                {titleNote}
              </span>
            </>
          )}
        </h2>
      )}
      <div className="webds-pattern-data-table-4">
        {caption && (
          <div className="webds-pattern-data-table-5">
            {caption}
          </div>
        )}
        {(rows.length > 0 || !empty || showHeaderWhenEmpty) && (
        <div
          data-part="Header Row"
          style={{ ...gapStyle, background: headerSurface }}
          className={cn(
            'webds-pattern-data-table-6',
            colGap,
            compact
              ? 'webds-pattern-data-table-6--s1'
              : 'webds-pattern-data-table-6--s2',
            stickyHeader && 'webds-pattern-data-table-6--sticky',
          )}
        >
          {/* The type role goes on the cell, not only on the label: a block cell
              keeps its own line strut, and at the inherited 16px that made the
              header row 56 against the file's 52. */}
          {columns.map((c) => (
            <div
              key={c.key}
              style={c.width ? { width: c.width } : undefined}
              className={cn(
                'webds-pattern-data-table-7',
                c.width ? 'webds-pattern-data-table-7--s1' : 'webds-pattern-data-table-7--s2',
              )}
            >
              {c.label}
            </div>
          ))}
        </div>
        )}

        {rows.length === 0 && empty
          ? empty
          : rows.map((row, i) => (
              <div
                key={i}
                style={gapStyle}
                className={cn(
                  'webds-pattern-data-table-8',
                  colGap,
                  hoverable && 'webds-pattern-data-table-8--s1',
                  rowClassName?.(row, i),
                )}
              >
                {columns.map((c) => (
                  <div
                    key={c.key}
                    style={c.width ? { width: c.width } : undefined}
                    className={cn(
                      CELL_TYPE[c.type ?? 'body-s'],
                      'webds-pattern-data-table-9',
                      c.nowrap && 'webds-pattern-data-table-9--nowrap',
                      c.width ? 'webds-pattern-data-table-9--s1' : 'webds-pattern-data-table-9--s2',
                    )}
                  >
                    {c.cell(row)}
                  </div>
                ))}
              </div>
            ))}
      </div>

      {footer && (
        <div
          style={{ paddingTop: footerPadding[0], paddingBottom: footerPadding[1] }}
          className="webds-pattern-data-table-10"
        >
          {footer}
        </div>
      )}
    </div>
  )
}

/* A sortable column header — measured on `5008:42978` (Notification table),
 * whose first three header cells are the label with
 * `Icon/16px/Navigation/Convert` 8 to its right; the other four are plain text.
 *
 * The label keeps the header's Body S on Text/Tertiary. **The icon's colour is
 * changed, not transcribed:** the file binds it to `colours/graphic/primary-active`,
 * which is not a Core Website token at all — it comes from another library that
 * this file also links. It resolves to #0064FF, which is `Icon/Highlight/Default`
 * here. Same pixel, no foreign token carried in.
 *
 * **The file draws this affordance two ways, and only one was shipped.** Table 3
 * (`3034:100295`) puts the same Convert glyph inside the library's **Icon
 * Button** at Size=16 — a Radius 1 box the size of the icon, `Surface/Primary/
 * Subtle/*`, so it is transparent at rest and only shows a surface on hover or
 * press. Notification table leaves the icon bare. Both readings are correct for
 * their own table, so `affordance` is a prop; `icon` stays the default because
 * that is what the first measured table draws.
 *
 * At rest the two are the same pixels — Icon Button's rest surface is black at
 * 0%. The difference is the hover and press states, and that the control is the
 * icon rather than the whole cell: with `button` the label is text, which is why
 * this stops rendering an outer `<button>` (one cannot nest the other).
 *
 * Table 3 marks 6 of 9 columns sortable in `New`, 8 of 11 in `Variant6`, and in
 * `Variant6` one of them — `Activity Type` — is a bare icon while its neighbours
 * are Icon Buttons. That is drift inside one header row, not two components. */
export function SortableHeader({
  children,
  onSort,
  affordance = 'icon',
  className,
}: {
  children?: React.ReactNode
  onSort?: () => void
  /** `button` = the Convert glyph inside an Icon Button, as Table 3 draws it. */
  affordance?: 'icon' | 'button'
  className?: string
}) {
  if (affordance === 'button') {
    return (
      <div className={cn('webds-pattern-sortable-header', className)}>
        <span>{children}</span>
        <IconButton onClick={onSort} label="Sort" icon={<ConvertIcon />} />
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onSort}
      className={cn('webds-pattern-sortable-header-2', className)}
    >
      <span>{children}</span>
      <ConvertIcon />
    </button>
  )
}

/* `public/webds-icons/convert-16.svg`, inlined so the pattern carries no asset
   dependency, with the baked #0064FF bound to its token. */
function ConvertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="webds-pattern-convert-icon">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.2 1.2793L14.96 5.0393L13.84 6.1593L12 4.3193V14.3993H10.4V4.3193L8.56004 6.1593L7.44004 5.0393L11.2 1.2793ZM5.60004 1.5993V11.6793L7.44004 9.8393L8.56004 10.9593L4.80004 14.7193L1.04004 10.9593L2.16004 9.8393L4.00004 11.6793V1.5993H5.60004Z"
        fill="var(--color-icon-highlight-default)"
      />
    </svg>
  )
}

export type ExpandingCellProps = {
  label: React.ReactNode
  /** Absent → the label stands alone, with no More affordance. */
  detail?: { label: React.ReactNode; value: React.ReactNode }[]
  /** The set's third variant ("2 colums", 3034:99660): panel 248 x 102, rows 20
   *  tall on a 22 pitch, label column 80 and value 144 with 8 between. The
   *  default panel stacks label over value instead. */
  columns?: 1 | 2
  /**
   * The label column of the two-column panel, in px. Default 80 — the width the
   * 248-wide instance draws.
   *
   * **It is a prop because the file gives no rule.** The Activity Log board's
   * own panel (`I8024:47719;3868:63231`) is 272 and sets the label column to
   * **101**, its value column to 147; the 248 one sets 80 and 144. Between them
   * the panel grows 24, the label 21 and the value 3 — so the column is neither
   * fixed nor a fraction of the panel, it is chosen per use. In the file the
   * label frame is `FIXED` and the value frame `FILL`, which is exactly this
   * shape.
   *
   * Left at 80 in a 272 panel, `Processed By` wraps and the row goes 20 → 40,
   * taking the panel to 122 and its table row to 186 against the file's 166.
   * Deriving a percentage from two samples would have fitted both and been an
   * invention; this exposes the decision instead.
   */
  labelWidth?: number
  /** The file draws these open. */
  defaultOpen?: boolean
  moreLabel?: string
}

export function ExpandingCell({
  label,
  detail,
  columns = 2,
  labelWidth = 80,
  defaultOpen = true,
  moreLabel = 'More',
}: ExpandingCellProps) {
  const [open, setOpen] = useState(defaultOpen)
  if (!detail?.length) {
    return (
      <div className="webds-pattern-expanding-cell">
        <GhostButton padding="none">{label}</GhostButton>
      </div>
    )
  }
  return (
    <div className="webds-pattern-expanding-cell-2">
      <div className="webds-pattern-expanding-cell-3">
        <GhostButton padding="none">{label}</GhostButton>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="webds-pattern-expanding-cell-4"
        >
          <span className="webds-pattern-expanding-cell-5">{moreLabel}</span>
          <Chevron open={open} />
        </button>
      </div>
      {open && (
        <div className="webds-pattern-expanding-cell-6">
          {detail.map((d, i) =>
            columns === 2 ? (
              <FieldInfo key={i} label={d.label} value={d.value} labelWidth={labelWidth} size="s" />
            ) : (
              <div key={i} className="webds-pattern-expanding-cell-7">
                <span className="webds-pattern-expanding-cell-8">
                  {d.label}
                </span>
                <span className="webds-pattern-expanding-cell-9">
                  {d.value}
                </span>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}

/* The file's `Icon/16px/Navigation/Chevron-Up`, drawn rather than imported so the
   pattern carries no asset dependency. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cn('webds-pattern-chevron', open ? 'webds-pattern-chevron--s1' : 'webds-pattern-chevron--s2')}
      aria-hidden
    >
      <path
        d="M3.2 10.1 8 5.3l4.8 4.8"
        /* Highlight, not secondary: the chevron is the affordance on a Text
           Button, so it takes the interactive blue while the `More details`
           label beside it stays Text/Secondary. Sampled #0064FF on both states
           of `8024:47738` — open (chevron up) and closed. */
        stroke="var(--color-icon-highlight-default)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Thai as Figma breaks it: only at spaces.
 *
 *  The space has to sit **outside** the nowrap span. With it inside, the whole
 *  string became one unbreakable run — the table's three-line error message came
 *  out on one line and its row measured 72 against the file's 112. */
/* ⚠️ **Only where the file's own breaks are at spaces.** The chunks are `nowrap`,
 * so a single space-delimited run wider than its column cannot break at all — it
 * paints straight out of the cell and across whatever is beside it, silently.
 * Measured on the Activity Log board (`I8024:47719;3868:63231`): a 230-wide Thai
 * run in a 192 column overflowed 239px into the next cell, and no CSS defeats
 * it (`overflow-wrap: anywhere`, `max-width: 100%` and an inline-block box were
 * all tried against the live node and changed nothing — `white-space: nowrap`
 * suppresses line breaking outright).
 *
 * Check the source text first. Where a Figma text node carries **literal
 * newlines**, those are the file's decision and `whitespace-pre-line` reproduces
 * them; where a run has no space in it, Figma breaks it mid-word too, and plain
 * text is the closer match. This is for the case in between. */
export function ThaiText({ children, className }: { children: string; className?: string }) {
  const chunks = children.trim().split(/\s+/)
  return (
    <span className={className}>
      {chunks.map((c, i) => (
        <span key={i}>
          <span className="webds-pattern-thai-text">{c}</span>
          {i < chunks.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}
