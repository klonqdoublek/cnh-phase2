import { useEffect, useId, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/bbl/button'
import { OutlineButton } from '@/bbl/outline-button'

/* Confirm Dialog — measured on `4046:4419`, centred at 734,359 in a 1920 frame.
 *
 *   dialog   **616 wide** in the component set (5011:92018); the instance on the
 *            CSP screen is 452, so width is a prop and 616 is the default —
 *            the set is the stronger source
 *            radius 16 · pt 32 · px 24 · pb 24 · gap 48
 *   body     gap 24 · title Heading XS Emphasized
 *   actions  two buttons, equal width, gap 16 — Outline then Default
 *   scrim    the file's own `colours/background/overlay`, **70% black**
 *
 * The scrim is the one value here that is not a webds token: the library's
 * Component/Scrim/Default is 40%, and this file paints 70%. Rendered as drawn,
 * under its own name, because quietly swapping in the DS value would redesign
 * somebody's dialog. Raised with the DS owner rather than resolved here.
 *
 * The library's Dialog page is `(MUI)` — specification only, and permanently so.
 * That is why this exists at all.
 *
 * **A second dialog uses the same shell** — `Informative pop up` (3034:100464)
 * in the Centralize Log file, 744 wide: same radius, same pt 32 / px 24 / pb 24,
 * but the body sits 24 under the title rather than 48, the header carries a 24
 * Close, and the footer is two or three buttons at their natural widths instead
 * of a split pair. Those are `gap`, `onClose` and `actions` — one shell, not two
 * copies of a scrim.
 *
 * Its title is drawn at **28/36, which is not a role on the Device L
 * typescale** (the scale steps 24/32 → 32/36). Rendered at Heading XS
 * Emphasized like every other dialog title here, and recorded rather than
 * reproduced: a literal 28px would be a value no token can follow. */

/** 70% black — and it IS a webds token, which the note here used to deny. The
 *  comparison was made against `Component/Scrim/Default` (40%) without checking
 *  the rest of the ramp: `Component/Scrim/Strong/Default` is 70% exactly, and it
 *  is what a second file binds by name (`1:138456` §0.1.0, Appearance=Strong).
 *  Same rendered value as the literal it replaces. Override with `--scrim`. */
const SCRIM = 'var(--color-component-scrim-strong-default)'

/**
 * Which shell to draw.
 *
 * `confirm` — the one this pattern was measured on (`4046:4419`): radius 16, one
 * padded box (pt 32 / px 24 / pb 24), and two EQUAL buttons, Outline then
 * Default, gap 24.
 *
 * `sectioned` — the library's own `Dialog` set, which webds serves as
 * SPECIFICATION ONLY (`dialog-mui`: `install: null`, no React export), so there
 * was nothing to consume and no consumer could match a file that draws it.
 * Measured on `JjvzdUwg5LlKHDQvo2fny0` · 1:138456 (Confirm logout), 600 x 170:
 *
 *   dialog   radius 12 (Radius 3) · Surface/Primary/Default · Max Width S
 *   title    600 x 48 · p 16/16/0/16 · Heading XS Emphasized
 *   content  600 x 54 · p 16 · Label XL
 *   actions  600 x 68 · p 8/16/16/16 · gap 8 · right-aligned, NATURAL widths
 *
 * The action row is Cancel as an OUTLINE on the left and the confirm as the
 * FILLED primary on the right — measured identically on four of the file's five
 * dialogs (`1:138457` Sure, `1:198325` / `1:193900` Try again, `1:201082` Ok,
 * whose Cancel is drawn hidden so only the filled one shows).
 *
 * The fifth, `Confirm logout`, SWAPS them: the destructive answer is the outline
 * (`Log Out`, Appearance=Negative on Text/Negative/Default) and the safe one is
 * the filled primary. That is `destructive` — recorded as a decision, since a
 * file that draws the same row four ways one way and once the other is making a
 * point about which answer should look easy to press.
 *
 * Content type is measured, not chosen: four dialogs draw the body at
 * `Heading/Heading XXS` 20/28 and the logout one at `Label/Label XL` 16/22,
 * which is why the block measures 60 there and 54 here. Two runs, two steps, no
 * rule connecting them — so each consumer says which its frame draws.
 */
export type ConfirmDialogAnatomy = 'confirm' | 'sectioned'

export type ConfirmDialogProps = {
  anatomy?: ConfirmDialogAnatomy
  /** `sectioned` only — see the note above. */
  destructive?: boolean
  /** `sectioned` only. 20/28 is what four of the five frames draw. */
  contentType?: 'heading-xxs' | 'label-xl'
  open?: boolean
  title: React.ReactNode
  children?: React.ReactNode
  cancelLabel?: React.ReactNode
  confirmLabel?: React.ReactNode
  onCancel?: () => void
  onConfirm?: () => void
  /**
   * The Confirm button's Disabled variant. Drawn on four frames of
   * `XC_L1 - Suspend & Unsuspend` — the mobile question with nothing chosen
   * (2631:36614), the reason popup with nothing chosen (2631:36651) and the DEH
   * dialog before the CSR has been to DEH (2631:36632) — and it is the whole
   * difference between two of those variant pairs, so it belongs on the shell
   * rather than in every consumer's own `actions`.
   */
  confirmDisabled?: boolean
  /** 616 in the component set, 452 as drawn on the CSP screen, 744 for the
   *  Informative pop up. */
  width?: number
  /** 48 between title block and footer on the confirm dialog, 24 on the
   *  informative one, 32 on Suspend V6. All three are drawn. */
  gap?: 48 | 32 | 24
  /**
   * The shell's top padding. 32 is the component set (5011:92018); BOTH XC
   * Suspend boards pad their Reason popup 24 on all four sides (V5 2631:36660,
   * V6 2875:230331) — two files of one product agreeing, so it is a prop rather
   * than the className V5 passed. The default stays the set's.
   */
  paddingTop?: 32 | 24
  /** Title → body. 24 in the set; 16 on Suspend V6 (2875:230889, 2875:230706). */
  titleGap?: 24 | 16
  /** Draws the file's 24 Close in the title row. */
  onClose?: () => void
  /**
   * Escape, and a click on the scrim. One consuming file writes the rule out —
   * "Tap out of Pop up หรือกด esc" — and the files that do not are SILENT, not
   * opposed: a modal that traps you until you find its Cancel button is a
   * defect in any product, and a static frame cannot draw a dismissal.
   *
   * Only the scrim dismisses. The dialog is a child of the presentation layer,
   * so a click inside it must not close — the first consumer to write this got
   * that part right and it is the part that is easy to get wrong.
   */
  onDismiss?: () => void
  /**
   * How the scrim is positioned. `absolute` fills the nearest positioned
   * ancestor and is what this has always done; `fixed` fills the viewport.
   *
   * The default stays `absolute` because four consuming screens already place
   * this inside a full-screen frame and would not thank us for changing where
   * their dialog lands. But `absolute` is a trap for a consumer that does not:
   * dropped at the end of a page it centres inside a zero-height div and renders
   * half off the bottom of the window, which is exactly what happened to the
   * first console that used it and why that build wrapped the component rather
   * than calling it. A modal you have to wrap is a modal with a missing prop.
   */
  layer?: 'absolute' | 'fixed'
  /** Replaces the split cancel/confirm pair — the informative dialog's two or
   *  three buttons at their own widths, at gap 24.
   *
   *  `null` draws NO action row at all — CMS's User Profile pop-up
   *  (MI2zFydRz9Qi673VeklnkI · 351:43632) has a Close and nothing else. Until
   *  v0.40 `null` fell through to the default pair, which is why that product
   *  hand-built the dialog. `undefined` still means the default pair. */
  actions?: React.ReactNode
  /** Distance from the top of the scrim. The component centres by default, which
   *  is what a live dialog should do; a screen that reproduces a frame can pin it
   *  where the file draws it (the CSP screen puts it at 359 of 1080 — 14 below
   *  centre, which is a placement, not a rule). */
  offsetY?: number
  className?: string
}

/* `public/webds-icons/close-24.svg`, inlined so the pattern carries no asset
   dependency. The shipped file bakes #0064FF; here it is on its token. */
function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11.9949 10.783L4.63961 3.42773L3.42773 4.63961L10.783 11.9949L3.42773 19.3501L4.63961 20.562L11.9949 13.2067L19.3501 20.562L20.562 19.3501L13.2067 11.9949L20.562 4.63961L19.3501 3.42773L11.9949 10.783Z"
        fill="var(--color-icon-highlight-default)"
      />
    </svg>
  )
}

export function ConfirmDialog({
  anatomy = 'confirm',
  destructive = false,
  contentType = 'heading-xxs',
  open = true,
  title,
  children,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  onCancel,
  onConfirm,
  confirmDisabled,
  onDismiss,
  layer = 'absolute',
  width = 616,
  gap = 48,
  paddingTop = 32,
  titleGap = 24,
  onClose,
  actions,
  offsetY,
  className,
}: ConfirmDialogProps) {
  /* On the document, not on the dialog: the dialog does not necessarily hold
     focus, and a listener that only fires while it does is a dismissal that
     works sometimes. */
  useEffect(() => {
    if (!open || !onDismiss) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onDismiss])

  /* Focus moves INTO the dialog on open and Tab stays inside it — the dialog
     says aria-modal, and a modal that leaves focus on the page behind (the first
     Tab landed on the console rail) is not one. Focus goes back where it was on
     close. (QA of XC Suspend V6, 2026-10-06.) */
  const titleId = useId()
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const back = document.activeElement as HTMLElement | null
    const focusable = () =>
      Array.from(
        box.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
    /* preventScroll: inside a scaled or clipped frame, focus() scrolls the clipping
       ancestor to bring the element into view and the whole page slides sideways. */
    if (!box.current?.contains(document.activeElement)) (focusable()[0] ?? box.current)?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const list = focusable()
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus({ preventScroll: true })
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus({ preventScroll: true })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      back?.focus?.({ preventScroll: true })
    }
  }, [open])

  if (!open) return null
  return (
    /* The scrim colour is set in style, not in a class: Tailwind does not parse a
       `var()` fallback inside an arbitrary value, and the class silently produced
       a transparent background — a dialog with no scrim at all. */
    <div
      style={{ background: `var(--scrim, ${SCRIM})` }}
      className={cn(
        layer === 'fixed' ? 'webds-pattern-confirm-dialog--s1' : 'webds-pattern-confirm-dialog--s2',
        'webds-pattern-confirm-dialog',
        offsetY == null ? 'webds-pattern-confirm-dialog--s3' : 'webds-pattern-confirm-dialog--s4',
      )}
      role="presentation"
      onMouseDown={
        onDismiss
          ? (e) => {
              if ((e.target as HTMLElement).getAttribute('role') === 'presentation') onDismiss()
            }
          : undefined
      }
    >
      {anatomy === 'sectioned' ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          ref={box}
          style={{ width, marginTop: offsetY }}
          className={cn(
            'webds-pattern-confirm-dialog-2',
            className,
          )}
        >
          {/* 48 = pt 16 + a 32-tall Heading XS Emphasized, and pb 0 — the gap to
              the content is the content's own top padding, not a gap on the
              column. The three blocks sit flush (gap 0). */}
          <div className={cn('webds-pattern-confirm-dialog-3', onClose && 'webds-pattern-confirm-dialog-3--close')}>
            <h2 id={titleId} className="webds-pattern-confirm-dialog-4">
              {title}
            </h2>
            {/* CMS User Profile (351:43632): the 24 Close at the right of the
                48 title band, the confirm anatomy's own mark. */}
            {onClose && (
              <button type="button" onClick={onClose} aria-label="Close" className="webds-pattern-confirm-dialog-12">
                <CloseIcon />
              </button>
            )}
          </div>
          {/* 16 + the line + 16 — so 60 at Heading XXS and 54 at Label XL. */}
          <div className="webds-pattern-confirm-dialog-5">
            <span
              className={cn(
                'webds-pattern-confirm-dialog-6',
                contentType === 'label-xl' ? 'webds-pattern-confirm-dialog-6--s1' : 'webds-pattern-confirm-dialog-6--s2',
              )}
            >
              {children}
            </span>
          </div>
          {/* 68 = 8 + 44 + 16. Right-aligned at their own widths, not the split
              pair the other shell draws. */}
          {actions !== null && (
          <div className="webds-pattern-confirm-dialog-7">
            {actions ??
              (destructive ? (
                <>
                  <OutlineButton appearance="negative" onClick={onConfirm}>
                    {confirmLabel}
                  </OutlineButton>
                  <Button onClick={onCancel}>{cancelLabel}</Button>
                </>
              ) : (
                <>
                  <OutlineButton onClick={onCancel}>{cancelLabel}</OutlineButton>
                  <Button disabled={confirmDisabled} onClick={onConfirm}>
                    {confirmLabel}
                  </Button>
                </>
              ))}
          </div>
          )}
        </div>
      ) : (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={box}
        style={{ width, marginTop: offsetY }}
        className={cn(
          'webds-pattern-confirm-dialog-8',
          gap === 24 ? 'webds-pattern-confirm-dialog-8--s1' : gap === 32 ? 'webds-pattern-confirm-dialog-8--gap32' : 'webds-pattern-confirm-dialog-8--s2',
          paddingTop === 24 && 'webds-pattern-confirm-dialog-8--pt24',
          className,
        )}
      >
        <div className={cn('webds-pattern-confirm-dialog-9', titleGap === 16 && 'webds-pattern-confirm-dialog-9--gap16')}>
          <div className="webds-pattern-confirm-dialog-10">
            <h2 id={titleId} className="webds-pattern-confirm-dialog-11">
              {title}
            </h2>
            {onClose && (
              <button type="button" onClick={onClose} aria-label="Close" className="webds-pattern-confirm-dialog-12">
                <CloseIcon />
              </button>
            )}
          </div>
          {children}
        </div>
        {actions === null ? null : actions ? (
          /* The informative dialog's row: buttons at their own widths, gap 24. */
          <div className="webds-pattern-confirm-dialog-13">{actions}</div>
        ) : (
          /* Two equal buttons, 272 each with 24 between them at 616 wide. */
          <div className="webds-pattern-confirm-dialog-14">
            <OutlineButton className="webds-pattern-confirm-dialog-15" onClick={onCancel}>
              {cancelLabel}
            </OutlineButton>
            <Button className="webds-pattern-confirm-dialog-16" disabled={confirmDisabled} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
      )}
    </div>
  )
}

/** `XC_L1 - Suspend & Unsuspend_V6.0` — every dialog on the board (Reason popup
 *  2875:230331, DEH 2875:230889, Verify at branch 2875:230706): p 24 all round,
 *  title → body 16, body → actions 32. */
export const CONFIRM_DIALOG_XC_SUSPEND_V6 = {
  paddingTop: 24,
  titleGap: 16,
  gap: 32,
} satisfies Pick<ConfirmDialogProps, 'paddingTop' | 'titleGap' | 'gap'>
