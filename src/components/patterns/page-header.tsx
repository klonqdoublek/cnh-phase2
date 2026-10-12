import { cn } from '@/lib/utils'
import { Divider } from '@/bbl/divider'

/* Page Header — measured on `7080:34905` ("Head", 2 variants) in the Centralize
 * Log file, and on `3868:70245` (the same component redrawn) in
 * `UI - Activity Log[Call Center]`.
 *
 * The band at the top of a console page: the page's name on the left, and the
 * page-level actions on the right as Ghost Buttons with a rule between them.
 *
 *   band     1431 x 88 · H · gap 16 · p 32/24/24/24 · Surface/Primary/Default
 *   title    Heading XS Emphasized (24/32) on Text/Primary
 *   actions  Ghost Button at Padding=None, 24 tall, at gap 24, centred in the 32
 *   rule     the library's Divider, 24 long, between each pair
 *
 * The Centralize Log variants are one action and three; nothing else changes,
 * so this takes a list rather than a variant.
 *
 * **The meta row is the Activity Log file's addition** (`3867:84270`, 1431 x
 * 124). Under the title, a row of read-only facts about what the page is showing
 * — device, OS, app version — and the band grows by exactly that row:
 *
 *   column   title over meta · V · gap 16 → 32 + 16 + 20 = 68, band 124
 *   meta     H · gap 24 · pr 48 · 20 tall
 *   item     H · gap 8 → [icon 16 · gap 4 · label] then the value
 *   label    Body S on Text/Tertiary/Default
 *   value    Body S Emphasized on Text/Primary/Default
 *   rule     1 x 20 between items, `Border/Primary/Default`
 *
 * The row is a fixed 20 in the file, so its text does not wrap: below the width
 * the facts need, they run past the band rather than growing it. Reproduced —
 * `nowrap`, and the caller scrolls or drops facts.
 *
 * The rule is a Figma `LINE` rotated -90: it paints 1px and occupies **none** of
 * the row, so the facts sit 48 apart, not 49. `-mr-px` cancels the width the way
 * `.stroke-inside` does for a box — same reason, one axis.
 *
 * With a meta row the actions **bottom-align to it** — the file sets the
 * content row's cross axis to MAX, so Filter sits on the meta line, not beside
 * the title. Without one they stay centred on the title, which is the 88 band
 * unchanged.
 *
 * **The rule's colour is remapped, not transcribed.** The file binds the
 * separator to `colours/border/primary` — a token from another library this file
 * links, not Core Website. It resolves to #C8C8CC; Core's own
 * `Border/Primary/Default` is black at 10%, which is what a rule on this surface
 * is here. Same job, no foreign token carried in. Compare the same call in
 * `error-detail` and in `data-table`'s sort icon.
 *
 * **The icons are slots.** The file places `Icon/16px/Illustration/Mobile`,
 * `.../Verification/BeVerified` and `.../Illustration/T&C` from the icon
 * library. webds ships all three (`mobile-16`, `be-verified-16`, `t-c-16`) but
 * which icon belongs to which fact is the product's decision, not the pattern's.
 *
 * **`Console Shell` is not this.** That pattern is the app frame — nav, rail,
 * profile — around Layer 3. This is the first thing *inside* Layer 3, and a
 * squad draws it.
 *
 * **The fill is changed, not transcribed**, for the same reason as Filter Bar:
 * the file binds `Background/Primary/Default`, which the Core Website library
 * marks `❌DEPRECATED`. It resolves to #FFFFFF — `Surface/Primary/Default`.
 *
 * A Divider between two inline buttons is drawn as a *horizontal* 24 x 1 rule in
 * the file, not a vertical one. Reproduced as drawn. */

export type PageHeaderMetaItem = {
  /** 16 x 16, drawn 4 before the label. The file uses the icon library's set. */
  icon?: React.ReactNode
  label: React.ReactNode
  value: React.ReactNode
}

export type PageHeaderProps = {
  /**
   * A 1px rule under the band, drawn inside the frame rather than as a border —
   * Figma strokes inside, and a border would make the band 89 against the
   * file's 88.
   *
   * Off by default because the file this was measured on does not draw it.
   * `20260224_Centralized log` does, and hand-built the whole band to get it:
   * measured on that running screen the two are otherwise identical — pt 32 /
   * px 24 / pb 24, Surface/Primary/Default, title 24/32/500 — so the rule was
   * the only thing missing, and a whole re-drawn header was the cost.
   */
  rule?: boolean
  /**
   * The band with **no fill and no side padding** — the frame's own 40 gutter
   * carries the inset instead.
   *
   * Two product files draw it white at px 24 (Centralized log, Activity log),
   * and two draw it bare (`2631:34971` on Suspend/Unsuspend, `2001:5531` on
   * XC_L1 Unlock PIN). Both prototypes cancelled it with a `className` and both
   * recorded the conflict; that is two files asking for the same thing twice,
   * which is a prop, not a workaround. Vertical padding is unchanged in all
   * four: pt 32 / pb 24, band 87–88 tall.
   */
  bare?: boolean
  /**
   * The band's own metrics. `console` is what this was measured on — pt 32 /
   * px 24 / pb 24, the title top-aligned, 87–88 tall. `compact` is what a
   * second platform draws: **82**, px 16, centred (CNH `1:127401` › Header).
   *
   * A prop because they are two measurements of the same band, and the consumer
   * that met the second one first reached for a className override — which is a
   * consumer editing a component's box, the thing this lane exists to stop.
   */
  band?: 'console' | 'compact'
  title: React.ReactNode
  /** Ghost Buttons. A Divider is drawn between each pair, as the file does. */
  actions?: React.ReactNode[]
  /** The facts row under the title. Absent → the 88 band. */
  meta?: PageHeaderMetaItem[]
  className?: string
}

export function PageHeader({
  band = 'console',
  title,
  actions = [],
  meta = [],
  rule,
  bare,
  className,
}: PageHeaderProps) {
  const hasMeta = meta.length > 0
  return (
    <div
      className={cn(
        'webds-pattern-page-header',
        band === 'compact'
          ? 'webds-pattern-page-header--s1'
          : 'webds-pattern-page-header--s2',
        bare
          ? 'webds-pattern-page-header--s3'
          : band === 'compact'
            ? 'bg-[var(--color-surface-primary-default)] px-[var(--space-4)]'
            : 'bg-[var(--color-surface-primary-default)] pr-[var(--space-6)] pl-[var(--space-6)]',
        rule && 'webds-pattern-page-header--s4',
        className,
      )}
    >
      <div
        className={cn(
          'webds-pattern-page-header-2',
          hasMeta ? 'webds-pattern-page-header-2--s1' : 'webds-pattern-page-header-2--s2',
        )}
      >
        <div className="webds-pattern-page-header-3">
          <h1 className="webds-pattern-page-header-4">
            {title}
          </h1>
          {hasMeta && (
            <div className="webds-pattern-page-header-5">
              {meta.map((m, i) => (
                <div key={i} className="webds-pattern-page-header-6">
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="webds-pattern-page-header-7"
                    />
                  )}
                  <div className="webds-pattern-page-header-8">
                    <div className="webds-pattern-page-header-9">
                      {m.icon}
                      <span className="webds-pattern-page-header-10">
                        {m.label}
                      </span>
                    </div>
                    <span className="webds-pattern-page-header-11">
                      {m.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {actions.length > 0 && (
          <div
            className={cn(
              'webds-pattern-page-header-12',
              hasMeta ? 'webds-pattern-page-header-12--s1' : 'webds-pattern-page-header-12--s2',
            )}
          >
            {actions.map((a, i) => (
              <div key={i} className="webds-pattern-page-header-13">
                {i > 0 && <Divider className="webds-pattern-page-header-14" />}
                {a}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
