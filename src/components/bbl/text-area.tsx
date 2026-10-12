import { cn } from "@/lib/utils";
import {
  FieldBox,
  FieldHint,
  FieldLabel,
  FieldRoot,
  FieldValue,
  FIELD_TEXT,
  toneFor,
  type FieldProps,
  type FieldTextColour,
} from "./field";

/* BBL Text Area — `public/r/specs/input.json`, set "Text Area", 8 variants.
 *
 * The same column as the other fields, with two differences that matter:
 *
 *   1. **The label does not float.** Text Area is the only set with a `has Label`
 *      boolean, and the label is a static row ABOVE the box (16/22), not a mark
 *      that shrinks into it. So the box keeps its 16 padding in every state.
 *   2. The box is 156 tall and its value sits at the top, filling the width.
 *
 * Its state axis drops the Disabled-Completed pairing and names the plain error
 * state `Error` rather than `Error - Default`; the visual outcomes are the same
 * four.
 *
 * One thing left as the library has it: `Error` paints its placeholder
 * Text/Disabled/Default, the same token as the Disabled variant, where every
 * other empty state uses Text/Placeholder/Default. An empty errored field
 * therefore reads as greyed out. Rendered as drawn (9210:26180).
 *
 * `has Scroll Bar` is drawn but switched off in all eight variants, and the
 * scroll bar is its own component page. It is not implemented here. */

const VALUE: Record<string, FieldTextColour> = {
  Default: "placeholder",
  Focused: "placeholder",
  Typing: "primary",
  Completed: "primary",
  Disabled: "disabled",
  /* See above — the library's own token, not a copy of Disabled by mistake. */
  Error: "disabled",
  "Error - Typing": "primary",
  "Error - Completed": "primary",
};

export function TextArea({
  state = "Default",
  force,
  label,
  value,
  required,
  optional,
  message,
  counter,
  onChange,
  placeholder,
  maxLength,
  className,
  boxClassName,
}: FieldProps & {
  value?: React.ReactNode;
  /**
   * Makes the field **editable**. Without it this renders the spec — the value
   * as a span, exactly as the library draws it — which is all a documentation
   * page needs and is not enough for anything a user types into.
   *
   * The control that appears carries the same `type-body-m` and the same state
   * colour as the span it replaces, so the two render identically; what changes
   * is that one takes keystrokes. Every other field on this page is still the
   * spec, so a consumer opts in per field rather than the component guessing.
   */
  onChange?: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  /** The box height where a consuming file does not draw the set's 156. */
  boxClassName?: string;
}) {
  const tone = toneFor(state);
  return (
    <FieldRoot data-force={force ?? undefined} className={className}>
      {label != null && (
        <FieldLabel required={required} optional={optional}>
          {label}
        </FieldLabel>
      )}
      <FieldBox
        part="Text Area"
        tone={tone}
        data-force={force ?? undefined}
        /* 156 is the BOX, not the column. All 8 spec variants measure the root
           at 156 AND their `Text Area` child at 156 — they are the same node,
           because those variants draw neither a label nor a hint. What grows
           when something is added is the COLUMN, which is BBL's own rule for
           the sibling set: "Fixed Height = 56pt. Dynamically change to 76pt if
           it has hint." With the 156 on FieldRoot instead, the box took
           `flex-1` of what was left and came out 136 with a counter, 128 with a
           label.

           `boxClassName` exists because one consuming file disagrees:
           Comment Box (`3034:100069`) is 404 × 186 = label 22 + gap 8 + a Text
           Area of 156 that already contains its counter, i.e. a 136 box. Two
           files, one number each; the set's own spec and BBL's prose decide the
           default and the other file passes what it draws. */
        className={cn("webds-text-area", boxClassName ?? "h-[156px]")}
      >
        {onChange ? (
          <textarea
            data-part="Input text"
            value={typeof value === "string" ? value : ""}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={state === "Disabled"}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "webds-text-area-2",
              FIELD_TEXT[VALUE[state] ?? "placeholder"],
            )}
          />
        ) : (
          <FieldValue colour={VALUE[state] ?? "placeholder"} className="webds-text-area-3">
            {value}
          </FieldValue>
        )}
      </FieldBox>
      <FieldHint message={message} counter={counter} tone={tone} />
    </FieldRoot>
  );
}
