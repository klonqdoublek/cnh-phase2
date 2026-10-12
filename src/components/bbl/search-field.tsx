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

/* BBL Search Field — `public/r/specs/input.json`, set "Search Field", 7 variants.
 *
 * The odd one of the four. Its label does not shrink and it does not float: at
 * rest the field shows a magnifier and the word "Search" as a placeholder, and
 * once it is focused the placeholder is replaced by the value and a **Cancel
 * button appears beside the box**.
 *
 * That button changes the anatomy, not just the contents. In the four active
 * states the box stops being the root's child and sits inside an "Input
 * Container" row (gap 8) next to a Button Container — which is why the spec
 * records the box at level 2 and 296 wide there against level 1 and 388 at rest
 * (9210:26119). 296 + 8 + 84 = 388: the box fills whatever the button leaves.
 *
 * The Cancel button is an instance of `Button / Text`, which is NOT one of the
 * five sets on the Button page — it is 46 tall with 12/16 padding where every
 * Ghost Button is 44 with 0/16 — so it is drawn from its own measurements here
 * rather than composed out of `GhostButton`.
 *
 * The magnifier's colour is measured in the three resting variants
 * (Icon/Primary/Default, and Icon/Disabled/Default when disabled). In the four
 * active states the icon sits a level deeper than the spec captures, so it is
 * drawn with the same Icon/Primary/Default the other non-disabled states use —
 * the smallest assumption available, and flagged here because it is one. */

const STATE: Record<
  string,
  { active: boolean; value?: FieldTextColour; icon: "primary" | "disabled" }
> = {
  Default: { active: false, icon: "primary" },
  "Error - Empty": { active: false, icon: "primary" },
  Disabled: { active: false, icon: "disabled" },
  Focused: { active: true, value: "placeholder", icon: "primary" },
  Typing: { active: true, value: "primary", icon: "primary" },
  Completed: { active: true, value: "primary", icon: "primary" },
  "Error - Completed": { active: true, value: "primary", icon: "primary" },
};

/* The 24px BBL magnifier, verbatim from public/webds-icons/search-24.svg. Its
   path measures 20.31 × 20.31 inside the 24 box, which is the size the spec
   records for the `Union` child — so `data-part` sits on the path, whose
   bounding box is that geometry, and not on the <svg>, whose box is 24. */
const SEARCH_PATH =
  "M22.0282 20.8282L15.4282 14.2282C16.4567 12.9424 17.1424 11.2282 17.1424 9.42815C17.1424 5.14244 13.7139 1.71387 9.42815 1.71387C5.14244 1.71387 1.71387 5.14244 1.71387 9.42815C1.71387 13.7139 5.14244 17.1424 9.42815 17.1424C11.2282 17.1424 12.9424 16.5424 14.2282 15.4282L20.8282 22.0282L22.0282 20.8282ZM9.42815 15.4282C6.0853 15.4282 3.42815 12.771 3.42815 9.42815C3.42815 6.0853 6.0853 3.42815 9.42815 3.42815C12.771 3.42815 15.4282 6.0853 15.4282 9.42815C15.4282 12.771 12.771 15.4282 9.42815 15.4282Z";

function SearchIcon({ icon }: { icon: "primary" | "disabled" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="webds-search-icon">
      <path
        data-part="Union"
        d={SEARCH_PATH}
        className={
          icon === "disabled"
            ? "webds-search-icon-2--s1"
            : "webds-search-icon-2--s2"
        }
      />
    </svg>
  );
}

/* `Icon/24px/General Icon/Close-Circle`, verbatim from
   public/webds-icons/close-circle-24.svg — the mark the set puts in the box. */
const CLOSE_CIRCLE_24 =
  "M4.71381 4.71479C8.74238 0.686217 15.2567 0.686217 19.2852 4.71479C23.3138 8.74336 23.3138 15.2576 19.2852 19.2862C17.2281 21.2576 14.6567 22.2862 11.9995 22.2862C9.34238 22.2862 6.77095 21.2576 4.71381 19.2862C0.68524 15.2576 0.68524 8.74336 4.71381 4.71479ZM5.99953 18.0862C9.34238 21.4291 14.7424 21.4291 18.0852 18.0862C21.4281 14.7434 21.4281 9.25765 18.0852 5.91479C16.371 4.28622 14.2281 3.42907 11.9995 3.42907C9.77095 3.42907 7.6281 4.28622 5.91381 5.91479C2.57095 9.25765 2.57095 14.7434 5.99953 18.0862ZM11.9995 10.8005L15.6852 7.11479L16.8852 8.31479L13.1995 12.0005L16.8852 15.6862L15.6852 16.8862L11.9995 13.2005L8.31381 16.8862L7.11381 15.6862L10.7995 12.0005L7.11381 8.31479L8.31381 7.11479L11.9995 10.8005Z";

export function SearchField({
  state = "Default",
  force,
  label,
  value,
  cancelLabel = "Cancel",
  showCancel = true,
  onCancel,
  onClear,
  boxClassName,
  restingLabelColour,
  message,
  counter,
  className,
}: FieldProps & {
  value?: React.ReactNode;
  cancelLabel?: string;
  /**
   * The Cancel button beside the box. Drawn in every ACTIVE variant of the set,
   * so it is on by default — but the set also publishes `show Cancel` and a
   * consuming file switches it OFF on Focused, Typing and Completed alike
   * (`JjvzdUwg5LlKHDQvo2fny0` · 1:135387 / 1:135841 / 1:136264). The axis
   * existed; only the implementation of it was missing.
   */
  showCancel?: boolean;
  onCancel?: () => void;
  /**
   * `has Clear Field` — the Close-Circle inside the box, right of the value.
   * The set publishes the boolean and a consuming file sets it true on Typing
   * and Completed, with a flow step that depends on it ("select the delete icon
   * → back to Search - Focus"). Nothing drew it here, so a search could be
   * typed into and not emptied.
   */
  onClear?: () => void;
  /** The box height where a consuming file does not draw the set's 56 — one
   *  board draws this field 520 x 64 in all four states. Same escape the other
   *  field types carry. */
  boxClassName?: string;
  /**
   * The resting label's ink. `tertiary` is what this was measured on; a second
   * board paints it `Text/Placeholder/Default` on all 14 runs of the field —
   * the same distinction the value axis makes, and the only place the two are
   * told apart. A prop, because two files disagree about one colour and neither
   * is a guess.
   */
  restingLabelColour?: FieldTextColour;
}) {
  const tone = toneFor(state);
  const s = STATE[state] ?? STATE.Default;

  const box = s.active ? (
    <FieldBox
      part="Search Field"
      tone={tone}
      data-force={force ?? undefined}
      className={cn("webds-search-field", boxClassName ?? "flex-1")}
    >
      <SearchIcon icon={s.icon} />
      <div className="webds-search-field-2">
        {/* The value SPAN has to grow, not hug. `FieldValue` is a span, and a
            span is a flex item at `0 1 auto` — so a consuming field that puts
            an <input> plus a trailing control in this slot got the input's
            ~180px intrinsic width and the control parked against the text
            instead of the box's right edge (CNH search, `1:135841`: value at
            x46, Clear Field at x480 of 520). Only this field passes a
            composite through the slot, so the growth is set here. */}
        <FieldValue colour={s.value ?? "primary"} className="webds-search-field-3">
          {value}
        </FieldValue>
      </div>
      {onClear && (
        <button
          type="button"
          aria-label="Clear"
          onClick={onClear}
          /* Clearing a search must not take the caret out of it. Without this
             the button's own mousedown blurs the input first, the field drops
             back to its resting state, and the user has to click in again to
             type — which is not what "clear" means. */
          onMouseDown={(e) => e.preventDefault()}
          className="webds-search-field-4"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              data-part="Clear Field"
              fillRule="evenodd"
              clipRule="evenodd"
              d={CLOSE_CIRCLE_24}
              className="webds-search-field-5"
            />
          </svg>
        </button>
      )}
    </FieldBox>
  ) : (
    <FieldBox
      part="Search Field"
      tone={tone}
      data-force={force ?? undefined}
      className={cn("webds-search-field-6", boxClassName ?? "h-[56px]")}
    >
      <SearchIcon icon={s.icon} />
      {/* The resting label is ONE line in the source (458 × 24 inside a 520 ×
          64 box) and it has about 8px of slack, so a face that measures wider
          wraps it and the second line leaves the box. */}
      <FieldLabel truncate colour={restingLabelColour} className="webds-search-field-7">
        {label}
      </FieldLabel>
    </FieldBox>
  );

  return (
    <FieldRoot data-force={force ?? undefined} className={className}>
      {s.active ? (
        /* Input Container — the box and the Cancel button, gap 8. The button is
           the tallest child at 56, and the box stretches to meet it. */
        <div className="webds-search-field-8">
          {box}
          {showCancel && (
          <div className="webds-search-field-9">
            <button
              type="button"
              onClick={onCancel}
              className="webds-search-field-10"
            >
              {/* The file binds this run to `Static/Label XL` — a collection the
                  token snapshot does not carry (8 collections, 335 variables,
                  none of them Static/*). Label XL Emphasized is the same
                  16/22/500 on the L tier; on the S tier a static role would not
                  step down and this one does. Recorded, not reconciled. */}
              <span
                data-part="label"
                className="webds-search-field-11"
              >
                {cancelLabel}
              </span>
            </button>
          </div>
          )}
        </div>
      ) : (
        box
      )}
      <FieldHint message={message} counter={counter} tone={tone} />
    </FieldRoot>
  );
}
