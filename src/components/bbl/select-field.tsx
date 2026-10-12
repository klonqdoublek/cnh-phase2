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

/* BBL Select Field — `public/r/specs/input.json`, set "Select Field", 6 variants.
 *
 * The same column and the same box as Text Field. Its state axis is shorter and
 * names the open state `Selected - Empty` / `Selected - Completed` rather than
 * Focused — different word, same Border/Highlight/Default outcome, which is why
 * `toneFor` keys off the prefix rather than an exact list.
 *
 * The chevron is a real icon rather than a swap slot, so it is drawn, and it
 * carries three treatments measured off the file (9210:26052):
 *
 *   Default, Completed             Chevron-Down,  Icon/Primary/Default
 *   Disabled - Default/Completed   Chevron-Down,  Icon/Disabled/Default
 *   Selected - Empty/Completed     Chevron-Up,    Icon/Highlight/Default
 *
 * Two things the library does differently here than in Text Field, both left as
 * written:
 *
 *   1. The label stays Text/Tertiary/Default in both disabled variants. Text
 *      Field greys its label once the field has a value.
 *   2. The value run is named "Option" in three variants and "Input option" in
 *      Disabled - Completed. That is a layer name, not a design difference, but
 *      the harness joins parts by name, so the part name follows the file. */

/* **The Outside label has two measurements, and this is a prop rather than a
 * verdict.**
 *
 * The set's own spec measures it SHRUNK — Label M in a 16-tall row, which is how
 * the Outside variants come to 96 = 16 + 4 + 56 + 4 + 16. That is the default,
 * and the default is where the number came from, not which platform wins.
 *
 * A second platform draws it at Label XL in a 24-tall row (CNH,
 * `JjvzdUwg5LlKHDQvo2fny0` · …;1:171460): there the Select stands 84 beside a
 * Text Field of the same 84, where the spec's reading gives 76 and puts two
 * label sizes in one row.
 *
 * Same anatomy, measured twice, two answers — and one of them is a mistake
 * somewhere. A prop does not settle that and is not meant to: it lets the
 * platform that draws 24 build 1:1 instead of shipping a knowingly wrong copy
 * of this component, while the disagreement stays visible here for the library
 * owner to close. When it closes, delete the prop and the losing side's call.
 */
const STATE: Record<
  string,
  {
    shrunk: boolean;
    value?: FieldTextColour;
    /** Figma's layer name for the value run in this variant. */
    valuePart?: string;
    chevron: "down" | "up";
    icon: "primary" | "disabled" | "highlight";
  }
> = {
  Default: { shrunk: false, chevron: "down", icon: "primary" },
  Completed: {
    shrunk: true,
    value: "primary",
    valuePart: "Option",
    chevron: "down",
    icon: "primary",
  },
  "Selected - Empty": {
    shrunk: true,
    value: "primary",
    valuePart: "Option",
    chevron: "up",
    icon: "highlight",
  },
  "Selected - Completed": {
    shrunk: true,
    value: "primary",
    valuePart: "Option",
    chevron: "up",
    icon: "highlight",
  },
  /* Measured 2026-08-25 on 9210:26052: an error draws exactly like Default —
     label at rest, no value run, Chevron-Down in Icon/Primary/Default. Only the
     tone moves, and `toneFor` already reads the `Error` prefix, which is what
     paints Border/Negative on the box and Text/Negative on the hint. */
  "Error - Empty": { shrunk: false, chevron: "down", icon: "primary" },
  "Disabled - Default": { shrunk: false, chevron: "down", icon: "disabled" },
  "Disabled - Completed": {
    shrunk: true,
    value: "disabled",
    valuePart: "Input option",
    chevron: "down",
    icon: "disabled",
  },
};

/* Label Position=Outside, measured off 9210:26052 on 2026-08-25. The axis is new
 * upstream and it is not "the same field with the label moved": the box always
 * shows a value run, so every state that draws nothing inside the box when the
 * label is Inside draws a PLACEHOLDER when it is Outside — including
 * `Selected - Empty`, which is Text/Primary inside and Text/Placeholder outside.
 * The label itself is Label M / Text/Tertiary in every Outside variant, which is
 * what `FieldLabel shrunk` already paints. 96 tall = 16 label + 4 + 56 box + 4 +
 * 16 hint. */
const OUTSIDE: Record<string, { value: FieldTextColour; valuePart: string }> = {
  Default: { value: "placeholder", valuePart: "Option" },
  Completed: { value: "primary", valuePart: "Option" },
  "Selected - Empty": { value: "placeholder", valuePart: "Option" },
  "Selected - Completed": { value: "primary", valuePart: "Option" },
  "Error - Empty": { value: "placeholder", valuePart: "Option" },
  "Disabled - Default": { value: "disabled", valuePart: "Input option" },
  "Disabled - Completed": { value: "disabled", valuePart: "Input option" },
};

const ICON_FILL = {
  primary: "webds-select-field--primary",
  disabled: "webds-select-field--disabled",
  highlight: "webds-select-field--highlight",
} as const;

/* The 24px BBL chevrons, verbatim from public/webds-icons — each size is drawn
   separately in the library, so this is the 24 rather than a scaled 16. The
   shipped files bake a colour in; here it is bound to the measured token. */
const CHEVRON = {
  down: "M12.0003 18.3428L1.97168 8.31426L3.17168 7.11426L12.0003 15.9428L20.8288 7.11426L22.0288 8.31426L12.0003 18.3428Z",
  up: "M20.8288 16.8858L12.0003 8.05723L3.17168 16.8858L1.97168 15.6858L12.0003 5.65723L22.0288 15.6858L20.8288 16.8858Z",
} as const;

export function SelectField({
  state = "Default",
  force,
  label,
  labelPosition = "Inside",
  outsideLabel = "shrunk",
  boxClassName,
  value,
  required,
  optional,
  message,
  counter,
  className,
}: FieldProps & {
  value?: React.ReactNode;
  /** The set's `Label Position`. Inside is the label the box holds; Outside
   *  lifts it to its own row above the box and the box shows the value. */
  labelPosition?: "Inside" | "Outside";
  /**
   * Which measurement of the Outside label to draw — see the note above.
   * `shrunk` is the set's spec (Label M in 16, field 96 with a hint); `xl` is
   * what a second platform's file draws (Label XL in 24, field 84 against a
   * Text Field of 84).
   */
  outsideLabel?: "shrunk" | "xl";
  /**
   * The box height where a consuming file does not draw the set's fixed 56 —
   * the same escape TextField and TextArea already carry. A filter bar measured
   * at 291 x 64 (`Input Field Container`, p 8/16) is the case this exists for,
   * and it was being met with a CSS rule in the consumer, which is a project
   * reaching into a component's box.
   */
  boxClassName?: string;
}) {
  const tone = toneFor(state);
  const s = STATE[state] ?? STATE.Default;
  const o = OUTSIDE[state] ?? OUTSIDE.Default;
  if (labelPosition === "Outside") {
    return (
      <FieldRoot data-force={force ?? undefined} className={className}>
        <FieldLabel shrunk={outsideLabel !== "xl"} required={required} optional={optional}>
          {label}
        </FieldLabel>
        <FieldBox
          part="Input Field Container"
          tone={tone}
          data-force={force ?? undefined}
          className={cn("webds-select-field", boxClassName ?? "h-[56px]")}
        >
          {/* Same clipping rule as the Inside value row — see below. */}
          <div className="webds-select-field-2">
            <FieldValue part={o.valuePart} colour={o.value} className="webds-select-field-3">
              {value}
            </FieldValue>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="webds-select-field-4">
            <path d={CHEVRON[s.chevron]} className={ICON_FILL[s.icon]} />
          </svg>
        </FieldBox>
        <FieldHint message={message} counter={counter} tone={tone} />
      </FieldRoot>
    );
  }
  return (
    <FieldRoot data-force={force ?? undefined} className={className}>
      <FieldBox
        part="Input Field Container"
        tone={tone}
        data-force={force ?? undefined}
        className={cn(
          "webds-select-field-5",
          boxClassName ?? "h-[56px]",
          s.shrunk ? "webds-select-field-5--s1" : "webds-select-field-5--s2",
        )}
      >
        {s.shrunk ? (
          /* `min-w-0`, and the value row clips. A flex item's default minimum is
             its content, so a value longer than the field pushed the column —
             and the chevron with it — straight out of the box: an Activity
             filter holding five group names measured 596px of overflow in a 220
             field. Figma cannot do that. Its Select Field is 220 x 56 whatever
             the value is (measured on `8024:47620`, five names in the same box
             as the empty one), so the value is one clipped line. Pass a
             `truncate` node for an ellipsis; without one it cuts as Figma does. */
          <div className="webds-select-field-6">
            <FieldLabel shrunk required={required} optional={optional}>
              {label}
            </FieldLabel>
            <div className="webds-select-field-7">
              <FieldValue part={s.valuePart} colour={s.value ?? "primary"} className="webds-select-field-8">
                {value}
              </FieldValue>
            </div>
          </div>
        ) : (
          <FieldLabel required={required} optional={optional} className="webds-select-field-9">
            {label}
          </FieldLabel>
        )}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="webds-select-field-10"
        >
          <path d={CHEVRON[s.chevron]} className={ICON_FILL[s.icon]} />
        </svg>
      </FieldBox>
      <FieldHint message={message} counter={counter} tone={tone} />
    </FieldRoot>
  );
}
