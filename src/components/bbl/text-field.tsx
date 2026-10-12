import { cn } from "@/lib/utils";
import {
  FieldBox,
  FieldHint,
  FieldLabel,
  FieldRoot,
  FieldValue,
  toneFor,
  type FieldProps,
  type FieldTextColour,
} from "./field";

/* BBL Text Field — `public/r/specs/input.json`, set "Text Field", 9 variants.
 *
 * Figma carries all nine on one `State` axis: Default, Focused, Typing,
 * Completed, Disabled-Default, Disabled-Completed, Error-Default, Error-Typing,
 * Error-Completed. Those nine collapse to four visual outcomes on the box —
 * `toneFor` is that mapping, shared with the other field types — and to two
 * layouts, which are not the same split:
 *
 *   at rest    the label sits full size (Body M) in a 16-padded box
 *   shrunk     the label is Label M above the value, box padding 8/16
 *
 * "Completed" shrinks, "Error - Default" does not, and that is why the two axes
 * are read separately rather than derived from the tone.
 *
 * One irregularity, left as the library has it: the label turns
 * Text/Disabled/Default in Disabled-Completed but stays Text/Tertiary/Default in
 * Disabled-Default — so a disabled field's label greys out only once it has
 * shrunk. Select Field does not do this at all; its label stays tertiary in both.
 *
 * Not drawn here: `has Right Content` is switched on in every variant, but it
 * holds Figma's "Others/Placeholder" instance-swap slot rather than an icon. That
 * is a designer affordance, not artwork, and rendering something in its place
 * would be inventing content the library does not specify. The slot's own
 * geometry is below the depth the spec captures, so nothing measured depends on
 * it. */

/** The two axes Figma folds into `State`, read per state rather than derived. */
const STATE: Record<
  string,
  { shrunk: boolean; value?: FieldTextColour; label: FieldTextColour }
> = {
  Default: { shrunk: false, label: "tertiary" },
  Focused: { shrunk: true, value: "placeholder", label: "tertiary" },
  Typing: { shrunk: true, value: "primary", label: "tertiary" },
  Completed: { shrunk: true, value: "primary", label: "tertiary" },
  "Error - Default": { shrunk: false, label: "tertiary" },
  "Error - Typing": { shrunk: true, value: "primary", label: "tertiary" },
  "Error - Completed": { shrunk: true, value: "primary", label: "tertiary" },
  "Disabled - Default": { shrunk: false, label: "tertiary" },
  "Disabled - Completed": { shrunk: true, value: "disabled", label: "disabled" },
};

/* `Label Position=Outside`. **The published Text Field set does not carry this
 * axis** — its 9 variants are one `State` and nothing else, while Select Field
 * beside it does carry it. So this branch is CONSUMER-MEASURED, not library
 * measured: it comes from a product file that sets Outside on every Text Field
 * of a form page, and it matches the Select Field's own Outside branch part for
 * part, which is the closest thing to a library reading available.
 *
 * The geometry: a 24-tall label row, gap 4, then the SAME 56 box the Inside
 * layout uses — padded 16 on all four sides around ONE 24-tall value row, not
 * the shrunk 8/16 two-row layout. The value row is drawn in every state, so
 * unlike `Default` inside the box, an empty field still holds its input; a
 * consumer that needs a real `<input>` at rest can only get one here.
 *
 * Only the value colour moves across states; the box border comes from `toneFor`. */
const OUTSIDE: Record<string, FieldTextColour> = {
  Default: "placeholder",
  Focused: "placeholder",
  Typing: "primary",
  Completed: "primary",
  "Error - Default": "placeholder",
  "Error - Typing": "primary",
  "Error - Completed": "primary",
  "Disabled - Default": "disabled",
  "Disabled - Completed": "disabled",
};

export function TextField({
  state = "Default",
  force,
  label,
  labelPosition = "Inside",
  value,
  required,
  optional,
  message,
  counter,
  className,
  boxClassName,
}: FieldProps & {
  value?: React.ReactNode;
  /** The set's `Label Position`. Inside is the label the box holds; Outside
   *  lifts it to its own row above the box and the box shows the value.
   *  Consumer-measured — see the note above. */
  labelPosition?: "Inside" | "Outside";
  /** An override for the box height, for a consuming frame that does not draw
   *  the set's fixed 56. Leave unset and the 56 stands. */
  boxClassName?: string;
}) {
  const tone = toneFor(state);
  const s = STATE[state] ?? STATE.Default;
  if (labelPosition === "Outside") {
    return (
      <FieldRoot data-force={force ?? undefined} className={className}>
        <FieldLabel colour={s.label} required={required} optional={optional}>
          {label}
        </FieldLabel>
        <FieldBox
          part="Text Field"
          tone={tone}
          data-force={force ?? undefined}
          /* `items-start`, as the source draws it — identical to `items-center`
             at the set's 56 (16 + 24 + 16), and the only reading that keeps the
             value row at padding-top 16 when a consumer overrides the height. */
          className={cn("webds-text-field", boxClassName ?? "h-[56px]")}
        >
          <div className="webds-text-field-2">
            <FieldValue
              colour={OUTSIDE[state] ?? "placeholder"}
              className="webds-text-field-3"
            >
              {value}
            </FieldValue>
          </div>
        </FieldBox>
        <FieldHint message={message} counter={counter} tone={tone} />
      </FieldRoot>
    );
  }
  return (
    <FieldRoot data-force={force ?? undefined} className={className}>
      <FieldBox
        part="Text Field"
        tone={tone}
        data-force={force ?? undefined}
        className={cn(
          "webds-text-field-4",
          s.shrunk ? "webds-text-field-4--s1" : "webds-text-field-4--s2",
        )}
      >
        {s.shrunk ? (
          /* Main Content: label over value, no gap between them. */
          <div className="webds-text-field-5">
            <FieldLabel shrunk colour={s.label} required={required} optional={optional}>
              {label}
            </FieldLabel>
            <div className="webds-text-field-6">
              <FieldValue colour={s.value ?? "primary"}>{value}</FieldValue>
            </div>
          </div>
        ) : (
          <FieldLabel
            colour={s.label}
            required={required}
            optional={optional}
            className="webds-text-field-7"
          >
            {label}
          </FieldLabel>
        )}
      </FieldBox>
      <FieldHint message={message} counter={counter} tone={tone} />
    </FieldRoot>
  );
}
