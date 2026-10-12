import { cn } from "@/lib/utils";
import type { ForceState } from "./force";

/* The anatomy every BBL input field shares — measured off
 * `public/r/specs/input.json` and, for the layout frames the extraction does not
 * reach (they paint nothing, so they are not captured as children), read off the
 * Figma file directly on 2026-07-31. Node ids are cited where that is the case.
 *
 * The field is a COLUMN, not a box:
 *
 *   root      vertical, padding 0, gap 4
 *   ├ Label   Text Area only — a static label ABOVE the box
 *   ├ box     56 tall (156 for Text Area), radius 2, 1px stroke
 *   │  └ the floating label, the value, and the left/right slots
 *   └ Hint    padding-left 16, gap 4 — inline message, and a counter pushed right
 *
 * BBL's own note: "Fixed Height = 56pt. Dynamically change to 76pt if it has
 * hint." 56 + gap 4 + a 16px message line is exactly 76, which is how the gap and
 * the hint row check out against prose rather than against our arithmetic.
 *
 * The box:
 *
 *   fill    Surface/Primary/Default, or Surface/Disabled/Default when disabled
 *   radius  Radius 2
 *   stroke  1px, and the only thing that moves with state:
 *             resting / completed → Border/Primary/Default
 *             focused / typing / selected → Border/Highlight/Default
 *             error → Border/Negative/Default
 *             disabled → Border/Disabled/Subtlest/Default
 *
 * **Width is deliberately fluid.** BBL's own note reads "Width: Adjustable and
 * dynamic. Can depend on container and responsive layout." The spec's 366 / 388 /
 * 441 are the widths those frames happened to be drawn at, not rules — so the
 * field fills its container and the verification harness renders it at the
 * captured width rather than the component pinning one.
 *
 * **The floating label moves the box's padding, not just its own size.** At rest
 * the box is padded 16 all round and holds one 24-tall row; once the label
 * shrinks the padding drops to 8/16 and the box holds a 40-tall column of label
 * (16) over value (24). 16+24+16 and 8+40+8 both come to 56 (Text Field
 * 9210:25896 / 9210:25899).
 *
 * **`data-part` names come from Figma, including where Figma is inconsistent.**
 * The box child is called "Text Field" in one set and "Input Field Container" in
 * the next, so the name is passed in by the caller rather than hard-coded here.
 *
 * One caveat for whoever adds hint coverage: Figma names the label run, the
 * inline message and the counter all "Message", and the harness keys parts by
 * name. No published variant shows a label and a hint at once, so the join is
 * unambiguous today. A variant that shows both will need the parts
 * disambiguated before it can be measured. */

export type FieldTone = "default" | "focused" | "error" | "disabled";

/** Which stroke a state resolves to. Kept as one table because all four field
 *  types share it, and because the mapping from nine Figma state names onto four
 *  visual outcomes is the part worth being able to read. */
export const FIELD_BORDER: Record<FieldTone, string> = {
  default: "webds-field--default",
  focused: "webds-field--focused",
  error: "webds-field--error",
  disabled: "webds-field--disabled",
};

export function toneFor(state: string): FieldTone {
  if (state.startsWith("Disabled")) return "disabled";
  if (state.startsWith("Error")) return "error";
  if (state === "Focused" || state === "Typing" || state.startsWith("Selected"))
    return "focused";
  return "default";
}

/** The four text colours the fields use, by the token that carries them. */
export const FIELD_TEXT = {
  tertiary: "webds-field--tertiary",
  placeholder: "webds-field--placeholder",
  primary: "webds-field--primary",
  disabled: "webds-field--field-text-disabled",
  negative: "webds-field--negative",
} as const;

export type FieldTextColour = keyof typeof FIELD_TEXT;

/** The outer column. It paints nothing — the box inside it does — and keeping the
 *  two levels rather than collapsing them is what lets the spec's root (no fill,
 *  no stroke, gap 4) and its box child (both) each be checked against the thing
 *  that implements them. */
export function FieldRoot({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("webds-field-root", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function FieldBox({
  part,
  tone = "default",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { part: string; tone?: FieldTone }) {
  return (
    <div
      data-part={part}
      data-tone={tone}
      className={cn(
        "webds-field-box",
        tone === "disabled"
          ? "webds-field-box--s1"
          : "webds-field-box--s2",
        FIELD_BORDER[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** The label row: the label itself, a required marker and an "(optional)" note,
 *  gap 4 between them (`.Building Block / Input Label`, 9210:26004).
 *
 *  Two sizes, and they are different type roles rather than one role scaled:
 *  Label XL 16/22 at rest, Label M 12/16 shrunk. Both come from the bound
 *  variables in the spec, not from the numbers — Body M is also 16/22, and
 *  writing that would have put the right pixels behind the wrong role. */
export function FieldLabel({
  shrunk = false,
  colour = "tertiary",
  required = false,
  optional = false,
  truncate = false,
  className,
  children,
}: {
  shrunk?: boolean;
  colour?: FieldTextColour;
  required?: boolean;
  optional?: boolean;
  /**
   * Keep the label on one line and cut it with an ellipsis.
   *
   * For a field whose box is a FIXED height this is not cosmetic: a label that
   * is one line in the source but a hair wider in the browser — a fallback font
   * measuring differently is enough — wraps to two and the second line spills
   * out of the box. `min-w-0` on the row is what lets it shrink at all, since a
   * flex item's default minimum is its own content.
   */
  truncate?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const type = shrunk ? "webds-field-type-t" : "webds-field-type-f";
  return (
    <div
      className={cn(
        "webds-field-label",
        shrunk ? "webds-field-label--s1" : "webds-field-label--s2",
        truncate && "webds-field-label--s3",
        className,
      )}
    >
      {/* `Main Label` (9210:26011) is its own group at gap 0 — the 4 above is the
          gap of the row OUTSIDE it (`Building Block / Input Label`, 9210:26004),
          which separates this group from the "(optional)" note. Rendering both
          at 4 put a double space before every `*`. Where a label does look spaced
          before its `*`, that is a trailing space inside the label string. */}
      <div className={cn("webds-field-label-2", truncate && "webds-field-label-2--s1")}>
        <span
          data-part="Message"
          className={cn(type, FIELD_TEXT[colour], truncate && "webds-field-label-3--s1")}
        >
          {children}
        </span>
        {required && <span className={cn(type, FIELD_TEXT[colour])}>*</span>}
      </div>
      {optional && (
        <span className={cn(type, FIELD_TEXT[colour])}>(optional)</span>
      )}
    </div>
  );
}

/** The value. Body M 16/22 in every field type; only its colour moves, and it
 *  sits in a 24-tall row (`.Building Block / Input State`, 9210:26027). */
export function FieldValue({
  part = "Input text",
  colour,
  className,
  children,
}: {
  part?: string;
  colour: FieldTextColour;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      data-part={part}
      className={cn("webds-field-value", FIELD_TEXT[colour], className)}
    >
      {children}
    </span>
  );
}

/** The hint row under the box: an inline message that fills, and a counter hugged
 *  to the right (Hint frame, padding-left 16, gap 4, 16 tall).
 *
 *  BBL models this as one boolean with two nested under it — `has Hint`, then
 *  `↳ has Message` and `↳ has Counter` — so the row exists to hold them and is
 *  not drawn when neither is present. Both are Body XS 12/16; the message turns
 *  Text/Negative/Default in the error states, the counter never does. */
export function FieldHint({
  message,
  counter,
  tone = "default",
}: {
  message?: React.ReactNode;
  counter?: React.ReactNode;
  tone?: FieldTone;
}) {
  if (message == null && counter == null) return null;
  return (
    /* `justify-end` — "a counter pushed right", which the note at the top of this
       file already said and the layout did not do. With a message present its
       `flex-1` pushed the counter over anyway, so the omission only showed on a
       counter-only field, and every published variant draws both. */
    <div className="webds-field-hint">
      {message != null && (
        <span
          data-part="Message"
          className={cn(
            /* A field can carry two rules at once, and the source writes them as
               ONE run with a line break in it rather than as two messages. */
            "webds-field-hint-2",
            tone === "error" ? FIELD_TEXT.negative : FIELD_TEXT.tertiary,
          )}
        >
          {message}
        </span>
      )}
      {counter != null && (
        <span
          data-part="Counter"
          className={cn("webds-field-hint-3", FIELD_TEXT.tertiary)}
        >
          {counter}
        </span>
      )}
    </div>
  );
}

export type FieldProps = {
  /** Figma models nine states on one axis; this is that axis, verbatim. */
  state?: string;
  force?: ForceState;
  /** The floating label. BBL draws every published variant with one. */
  label?: string;
  /** The `*` beside the label, and the "(optional)" note after it. */
  required?: boolean;
  optional?: boolean;
  /** `has Hint` → `↳ has Message` / `↳ has Counter`. */
  message?: React.ReactNode;
  counter?: React.ReactNode;
  className?: string;
};
