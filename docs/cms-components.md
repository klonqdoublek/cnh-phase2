# CMS components in CNH

The CMS prototype (`~/kkdevmode/CMS`, webds, final UI v4.x) hand-built the controls webds does not ship. CNH Phase 2 borrows them instead of writing its own. This page lists what CMS has, what CNH has already copied and how the copy differs, and what is still there to borrow.

Rule: borrow before you build. If a control is not in webds (`search_components`) and CMS has one, copy the CMS file, keep its markup and classes, and only change the props. Record the change in the table below.

Paths: CMS is relative to `~/kkdevmode/CMS/src`. CNH is relative to this repo's `src`.

## Already in CNH

The date picker came over on `update/broadcast-date-picker` (PR #2). Until that merges, the `components/fields/` rows exist only on that branch.

| CNH | CMS source | How it differs |
|---|---|---|
| `components/fields/DateTimeInput.tsx` | `components/fields/DateTimeInput.tsx` | No `labelSize`. `optional` and `clearable` (Clear) were dropped at first and ported back for Broadcast End on `add/broadcast-end`. `minuteStep` is `1 \| 5 \| 30`; CMS has `1 \| 5`, default 5. Adds `min` (earlier days are muted). Copy is literal, not `FIELDS_COPY`. |
| `components/fields/useDateTimeField.ts` | `hooks/useDateTimeField.ts` | Today is the real date, not CMS's pinned `TODAY`. Days before `min` cannot be picked. `clear` came back with Broadcast End. |
| `components/fields/PeriodCellButton.tsx` | same | Byte-identical. |
| `components/fields/picker-state-gaps.ts` | same | Only the header comment differs. |
| `components/fields/PickerHeaderLabel.tsx`, `period-cells.tsx`, `date-parts.ts` | same | Imports point at the local `date-parts` instead of CMS enums and constants. Same logic. |
| `components/fields/usePickerViews.ts`, `useDismissOnOutside.ts` | `hooks/…` | Moved into `fields/`; constants inlined. |
| `components/fields/TimeInput.tsx` | none | CNH's own. It reuses the `DateTimeInput` field box and opens the time half of webds' Date Time Picker (hour and minute columns). Neither CMS nor webds has a time-only picker. |
| `components/upload/UploadZone.tsx` | `components/asset/EmptyAssetSlot.tsx` | Same markup. Made generic: `buttonLabel`, `hint`, `accept`, `multiple`, `error`, `onFiles`. |
| `components/upload/UploadedFile.tsx` | `components/asset/UploadedAssetSlot.tsx` | Same markup. Generic `name`, `meta`, `status`, `error`, `onPreview`, `onRemove`. Preview and trash show only when their handler is passed. `errorPlacement="slot"` + `onRetry` draws CMS's `State=Error (upload failed)` (Figma `136:92553`, not in CMS code): message in the meta row, Ghost **Try again**. |
| `components/upload/FilePreviewDialog.tsx` | `AssetPreviewModal` + `PreviewPane` + `JsonPreview` + `download-asset.ts` | Reads the real picked file. No Reference ID line. Uses `ConfirmDialog layer="fixed"`. Actions are OK / Import (`confirmLabel`, `onConfirm`), not CMS's Download / OK (design critique, 20 Oct 2026). |
| `components/patterns/picker-dialog.tsx` (webds install) | `components/patterns/picker-dialog.tsx` | Not copied: CMS's Link Document Type dialog became the webds pattern `picker-dialog` (v0.40), so CNH installs it with `scripts/webds-add.mjs`. Used single-pick, without Create new, for the dynamic-field dialog (Idea 3, 3.2). The install refreshed `confirm-dialog`, `form-field`, `icon`, `overlay-loader` and `webds-components.css` to the registry's current versions (new optional props, defaults unchanged). |
| `pages/broadcast/list/ListFooter.tsx` | `components/list/ListFooter.tsx` + `BoundedPagination.tsx` | Merged into one file; page is 0-based. The counter uses a hyphen (`1-6 of 6`); CMS uses an en-dash (`1–6`, PRD §8.1). |

## Still in CMS, not yet borrowed

| CMS | What it is |
|---|---|
| `components/fields/DateFilter.tsx` + `hooks/useDateFilter.ts` | Date-only filter: 64-tall box, label inside, "Select today" and Clear. |
| `components/common/RowAction.tsx`, `RowActions.tsx`, `RowClickTarget.tsx` | Ghost row actions (adds the positive tone webds lacks) and a whole-row hit target. |
| `components/list/ListStateView.tsx`, `ListEmpty.tsx` | Loading, error with Try again, empty with Create, and no results. |
| `components/shell/SideDrawer.tsx`, `components/drawer/DetailTableBox.tsx`, `DetailRow.tsx` | Host for `detail-drawer` (scrim, slide, Escape) and a row-divided detail table. |
| `components/dialogs/LeaveWithoutSavingDialog.tsx`, `StatusChangeFlow.tsx`, `components/common/SubmitOverlay.tsx` | Leave dialog; confirm, loading, failed and success sequence; full-page submit spinner. |
| `components/fields/CreatableSingleList.tsx` | Single-select list with search and "+ Create new", inline (not in a dialog). |
| `components/list/GreyBadge.tsx` | Neutral badge (webds `Badge` has no grey type). |
| `components/list/SidewaysScroll.tsx` | Horizontal scroll wrapper for a wide table. |
| `components/asset/DisabledAssetSlot.tsx` | Read-only empty upload slot. |

## Where CMS recorded the decisions

- Date and time picker: `CHANGELOG.md` v4.56 (states, auto-apply, 396 tall), v4.5, v4.8. `docs/final-ui/HANDOFF.md` §6.1 D17, D18, D21; Q14 is still open.
- Time steps: `docs/CMS-Content-Admin-PRD.md` L600 (Effective date in 5-minute steps; Expiry in 1-minute steps).
- Upload: PRD §4.5 and M7; CHANGELOG v4.16, v4.48, v4.50.
- Preview and download: CHANGELOG v4.11; HANDOFF D24. Q12 (a hover download icon in the table) is not built.
- Pagination, 50 rows: PRD §8.1, AC-PAGE-1/2; CHANGELOG v4.33–v4.34.
- webds gaps: `docs/webds-gap-feedback.md`.

## webds gaps both projects hit

- Fields only display a value. CMS rebuilt live fields, including the date-time field.
- No upload control or drop zone.
- No time-only picker (CNH `TimeInput`).
- Date Picker and Date Time Picker: no Selected fill, no Hover, no Month/Year Current ring, and the Cancel / OK row cannot be turned off. `picker-state-gaps.ts` patches these.
- `TablePagination` has no disabled chevrons.
- `Badge` has no neutral type.
- `GhostButton` has no positive tone.
- `detail-drawer` sections take rows only: no note under the rows, no action in the head (CNH `DrawerSection`).
