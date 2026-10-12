import { cn } from '@/lib/utils'

/* **Sign In Split** — the way into a console: a picture on one side, who you
 * are about to sign into on the other, and one button.
 *
 * There is no form. These consoles authenticate through the bank's own SSO, so
 * the page collects nothing — which is the whole reason it can be a component
 * at all rather than a screen every product rebuilds. What varies is the
 * artwork, the wording and the one action.
 *
 * Measured on `JjvzdUwg5LlKHDQvo2fny0` · 1:74070:
 *
 *   page     1920 × 1000 · px 80 · a 1280 column, centred · gap 24
 *   banner   534 × 716 · py 40 · the image 534 × 713 at Radius 4
 *   content  746 · pl 80 · py 40 · column 666 · gap 40
 *     mark   250 × 62 — the same wordmark the sidebar carries, scaled
 *     block  gap 24 — a welcome line, the title, a contact line
 *     action 285 × 44
 *
 * **The title is off the type scale and it is drawn that way on purpose.** The
 * file sets 62.02/83 in BBL Sans Medium and binds it to no text style; this
 * system's display steps are 40 / 72 / 88. Reproduced rather than rounded to a
 * step, because rounding it would quietly redesign someone's login page — but
 * the FAMILY still comes from the system, through the `font-heading` utility.
 * Not `font-[var(--font-heading)]`: font-family and font-weight share that
 * prefix in Tailwind, so a bare `var()` does not resolve to a family and the
 * heading renders in the platform sans. That was the last non-BBL run on a
 * deployed BBL site, and it looked fine in devtools the whole time.
 *
 * Consumer-measured. */

export type SignInSplitProps = {
  /** The banner image, at 534 × 713 and Radius 4 in the file. */
  banner?: React.ReactNode
  /** The product wordmark, 250 × 62. */
  mark?: React.ReactNode
  /** The line above the title. Heading XS, and the file draws it Regular. */
  welcome?: React.ReactNode
  title?: React.ReactNode
  /** The line under the title, on Text/Secondary. */
  note?: React.ReactNode
  /** The single action, 285 wide in the file. */
  action?: React.ReactNode
  /** The title's size and leading. The file's 62/83 names no token — see above. */
  titleSize?: { size: number; leading: number }
  className?: string
}

export function SignInSplit({
  banner,
  mark,
  welcome,
  title,
  note,
  action,
  titleSize = { size: 62, leading: 83 },
  className,
}: SignInSplitProps) {
  return (
    <div
      className={cn(
        'webds-pattern-sign-in-split',
        className,
      )}
    >
      <div className="webds-pattern-sign-in-split-2">
        {banner != null && (
          <div className="webds-pattern-sign-in-split-3">{banner}</div>
        )}
        <div className="webds-pattern-sign-in-split-4">
          {mark}
          <div className="webds-pattern-sign-in-split-5">
            {welcome != null && (
              <p className="webds-pattern-sign-in-split-6">{welcome}</p>
            )}
            {title != null && (
              <h1
                style={{ fontSize: titleSize.size, lineHeight: `${titleSize.leading}px` }}
                className="webds-pattern-sign-in-split-7"
              >
                {title}
              </h1>
            )}
            {note != null && (
              <p className="webds-pattern-sign-in-split-8">{note}</p>
            )}
            {action}
          </div>
        </div>
      </div>
    </div>
  )
}
