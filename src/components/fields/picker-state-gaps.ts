import { cn } from '@/lib/cn'

/* Taken verbatim from the CMS prototype (v4.56,
   `~/kkdevmode/CMS/src/components/fields/picker-state-gaps.ts`).
   Restyles of the installed webds pickers (v0.38), set on the box that holds
   one — here `DateInput` — and reported to webds by CMS (HANDOFF §6.2).
   Each draws a state the library's `.Building Block / Date Picker / Cell` set
   has and the coded component does not:
   - Date, State=Selected: a filled cell. The coded Date view gives the
     selected tone inverse text with no fill, so it reads white on white.
   - State=Hovered: Surface/Primary/Subtle/Hovered on a pickable day, month,
     year or time cell that is not selected. The coded cells have no hover.
   - Month / Year, State=Current: the Border/Highlight ring the coded Date
     view draws for its own ringed tone, carried to the Month and Year cells.
   - `has CTA = No`: the coded Date Time Picker always draws Cancel / OK. */
export const PICKER_STATE_GAPS = cn(
  '[&_.webds-date-picker-13:has(>.webds-date-picker--selected)]:bg-[var(--color-surface-highlight-default)]',
  '[&_.webds-date-picker-13--s1:not(:has(>.webds-date-picker--selected)):hover]:bg-[var(--color-surface-primary-subtle-hovered)]',
  '[&_.webds-date-picker-16--s2:hover]:bg-[var(--color-surface-primary-subtle-hovered)]',
  '[&_.webds-time-column-2--s1:not(.webds-time-column-2--s2):hover]:bg-[var(--color-surface-primary-subtle-hovered)]',
  '[&_.webds-date-picker-16:has(>.webds-date-picker--outlined)]:outline',
  '[&_.webds-date-picker-16:has(>.webds-date-picker--outlined)]:-outline-offset-1',
  '[&_.webds-date-picker-16:has(>.webds-date-picker--outlined)]:outline-[var(--color-border-highlight-default)]',
  '[&_.webds-date-time-picker-10]:hidden',
)
