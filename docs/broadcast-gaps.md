# Broadcast message: requirement gaps and decisions

This page compares three sources for the Broadcast message feature (CNH Phase 2) as of 14 Oct 2026:

- **Deck:** the BA's internal alignment deck, *Broadcast Message* (6 pages).
- **BA feedback:** the BA's review of the prototype, received 14 Oct 2026.
- **Prototype:** this repo.

It lists what changed in response, the gaps that are still open as questions for the BA, an audit against webds and the CMS components, and the copy this repo composed rather than transcribed.

## BA feedback, 14 Oct 2026

| # | Ask | What changed | Branch |
|---|---|---|---|
| 1 | Remove the Recipients and Result columns from the list; the detail drawer shows them. | Both columns are gone. The drawer already shows Total recipients, Success, Failed and Waiting to send. The freed width goes to Broadcast name, Channel and Do Not Disturb. | `update/broadcast-list-columns` |
| 2 | Add download behaviour to the drawer. | Delivery result has a **Download report** button. It appears once anything was attempted (Processing, Published or Failed) and saves `{id}-delivery-report.csv`. The CSV has one row per recipient: ID, Channel, Result, Reason. The rows are mock data built from the counts. | `add/broadcast-delivery-report` |
| 3 | Times in 5-minute steps instead of 30. | Start date and time, and the quiet period from/to, step by 5 minutes. The quiet period field is now an hour column and a minute column, not a 48-row list. | `update/broadcast-time-step` (on PR #2) |
| 4 | Let the user add Do Not Disturb periods: several days with the same hours, and more than one period, e.g. Mon–Fri 18:00–08:00 and Sat–Sun all day. | Do Not Disturb holds any number of quiet periods. Each has its own days and hours, or All day, and can be removed. **Add period** adds one. One Enabled toggle and one time zone cover all of them. The list shows one period per line, the drawer and the confirm dialog show all of them. The BA's example is on `#/broadcast/create/dnd-rules` and on BC-0006. | `update/broadcast-dnd-rules` |
| Q2 | Broadcast End may go into the prototype (BA answer, 14 Oct). | Delivery Date has an optional **End date and time** beside Start, with Clear, for Schedule delivery only (requester, 15 Oct: Send as soon as possible has no end). It must be later than the start. When the end comes first, sending stops and the recipients left are counted as **Not sent**; the broadcast still ends **Published** (no Expired status). The drawer shows Broadcast end and a Not sent row; the report adds Not sent rows; the confirm dialog shows the end. Preset `#/broadcast/create/end`; fixture BC-0001 is the deck's scenario F. | `add/broadcast-end` |

Interpretations made without asking the BA:

- **Download:** "download behaviour" was read as a delivery report, which matches the deck's "summary report" (page 2). The deck does not ask to download the audience file, so the drawer does not offer it.
- **Overnight periods:** a period that crosses midnight belongs to the day it starts. With the BA's example, Sunday 00:00 to Monday 08:00 is quiet only until Monday 00:00. Mon–Fri 18:00–08:00 starts on Monday evening, so Monday 00:00–08:00 is open. See question Q11.

## Deck vs prototype: questions for the BA

BA answers on 14 Oct 2026:

- **Q1:** DND is the model for Broadcast message. Service Window is not used.
- **Q2:** Broadcast End goes into the prototype (see the table above).
- **Q5:** Direct recipient stays. The ID column is still chosen from the file.
- **Q11:** TBC (14 Oct). The BA did not follow the first wording; the question is reworded below and parked until the next review. The prototype keeps the current behaviour.

From the BA meeting recording (reviewed 14 Oct; to confirm with the BA on 15 Oct):

- **Free headers.** The file does not need a header called CIS ID. The Field select says which column holds the data; CIS IDs may sit in a column called `Recipient`. The prototype already works this way. Since 21 Oct it no longer guesses the column from the header: the select starts empty and the user picks the column. This leaves Q17 and Q18 open.

The rest are still open.

| # | Topic | Deck | Prototype | Question |
|---|---|---|---|---|
| Q1 | Delivery window | **Service Window**: the days and hours sending is *allowed*, e.g. Mon–Fri 07:00–18:00. | **Do Not Disturb**: the hours sending is *blocked*. The BA's 14 Oct feedback builds on DND. | Does DND replace Service Window for good? |
| Q2 | Broadcast End | An end date. Recipients still unsent at the end are marked *Not Sent / Expired*. A campaign that finishes early closes early. | No end date and no Expired status. | Is Broadcast End in scope for Phase 2? If yes, which status do unsent recipients get, and does Result count them? |
| Q3 | Steps | 4 steps: Audience, Message, Channel, Schedule. | 6 steps: Basic information, Audience file, Recipient mapping & channels, Manual content, Delivery, Do Not Disturb. | Is the 6-step form accepted? The BA's feedback refers to Step 5 and Step 6, which suggests yes. |
| Q4 | Message | One common message, a Subject for Email and Push, and tabs to change the content per channel. | One card per channel, each written separately. | Is a shared message with per-channel overrides still wanted? |
| Q5 | Recipients | One master file. CIS ID is required on every row; mobile and email are optional. The system picks each channel's contact; Push finds device tokens from CIS ID. | Recipient type CIS or Direct. Direct means a phone or email column only, with Email or SMS, and no CIS. | The deck has no Direct recipient. Is it in scope? |
| Q6 | File columns | CIS ID, Mobile number, Email address, First name, Last name, Tier. | Sample CIS file: CIS_ID, CUSTOMER_NAME, ACCOUNT_NO, AMOUNT, PROMOTION_CODE. | Should the sample files follow the deck's columns? |
| Q7 | File validation | CIS ID unique; mobile and email well formed; at least one contact per row; no duplicate mobile or email in the file; data "valid and active". | Duplicate IDs, mobile format and email format are checked on the chosen ID column, on Submit (BA, 19 Oct: a pick checks only type and size). | Which of the deck's rules apply in CIS mode? "Active" cannot be checked in a prototype. |
| Q8 | Start fields | Start Date and Start Time (local) as two fields. | One Start date and time field (PR #2). The BA's screenshot shows the older two-field build. | Is one field acceptable? |
| Q9 | Status | Activated, Sending, Paused outside the window, Completed, Expired. | Draft, Queue, Processing, Published, Failed, Cancelled, from the list of values (16 Oct; meanings 19 Oct). Paused is Processing; the drawer note says it is inside the quiet period. | Answered by the list of values. |
| Q10 | SMS counter | `109/160`. | `n/800`, the Template form's SMS message (TH), from draft 2.2 webds-matched (Figma 85:19401, 15 Oct). The SMS segment counter is gone. | Which counter? |
| Q11 (TBC) | Overnight DND | Not covered. | A period that crosses midnight belongs to the day it starts. Ticking Mon–Fri on 18:00–08:00 covers Monday night to Friday night, so Sunday night into Monday 00:00–08:00 is open. With the BA's example the weekend ends at Monday 00:00 and sending starts at midnight, not 08:00. | Which one: (a) keep this, and tick Sun as well to keep Monday morning quiet; or (b) count the morning part of a period as the day it ends, so ticking Mon also covers Monday 00:00–08:00? |
| Q12 | DND limits | Not covered. | Any number of periods; overlapping periods are allowed. | Is there a maximum number of periods? |
| Q17 | Contacts in CIS mode | "The system uses the available contact for each channel": the master file holds Mobile number and Email address. | CIS mode maps one column, CIS ID. | Do SMS and Email in CIS mode send to the file's mobile and email, or to the contacts in the CIS master? If the file's, the user must also map the mobile and email columns, since headers are free. |
| Q18 | CIS ID format | Example `CIS000123`. | Sample file uses `100001`. Only "required" and "no duplicates" are checked. | Does a CIS ID have a fixed format? With free headers, the format is the only way to catch a wrong column, such as account numbers picked as CIS IDs. |
| Q16 (19 Oct, PROPOSAL) | A file Submit cannot use | Not covered. | No rows, more than 1,000 rows or no valid recipient blocks the submit with *The audience file cannot be used* (Close); the reason stays on Step 2. Preset `#/broadcast/create/file-blocked`. | Is blocking right, and is the dialog the right place? |
| Q13 (answered 19 Oct) | Failed and Cancelled | Not covered. The list of values (16 Oct) has FAILED and CANCELLED. | FAILED = a system error. CANCELLED = the user cancels a saved draft. Only a Draft can be cancelled; after Submit it cannot (system limit). Fixtures BC-0009 (Failed) and BC-0008 (Cancelled). | Still to confirm: the composed copy below, and whether a Failed broadcast counts the recipients left as Not sent. |

Already aligned:

- File types .csv and .xlsx.
- 10 MB and 1,000 recipients per file.
- Tracking covers Total, Success and Failed. Neither the deck nor the prototype tracks opens or reads. The prototype also shows Waiting to send.

## Audit: webds and CMS components

**From webds, used as shipped:**

- Components: Checkbox, Radio Button, Toggle Switch, Table Header Cell, Table Data Cell, Table Pagination, Toast, Alert, Pill Chip, Inline Message, Card Surface, Spinner Loader.
- Patterns: `console-page`, `detail-drawer`, `status-badge`, `confirm-dialog`, `form-field`, `form-section-card`, `empty-state`.

**From CMS** (see [cms-components.md](cms-components.md)): the date-time picker and the upload slots and preview.

**webds gaps** (built by hand here; report to the design system owner):

- No time-only picker. `TimeInput` reuses the field box and the Date Time Picker's time column classes.
- No upload control.
- `detail-drawer` sections take rows only. `DrawerSection` adds a note under the rows and an action in the head.
- No radio card. `ModeOption` is a bordered card around a webds Radio Button.
- `TablePagination` has no disabled chevrons. `ListFooter` adds them.

**Recommended clean-ups, not done** (outside the BA's asks):

- The Delivery "Outlook" strip in `create/sections.tsx` is hand-drawn. webds `Alert appearance="brand"` already draws the same box in the drawer.
- `SampleLink` is a plain `<a>`; use a Ghost Button link. `BROADCAST_COPY.sample` ("Download sample file") is defined but never used.
- The list counter uses a hyphen (`1-6 of 6`). CMS uses an en-dash (`1–6 of 6`, CMS PRD §8.1).

## Decision log: copy composed, not transcribed

The original build has none of this copy. Change it here if the BA rules otherwise.

| Where | Copy |
|---|---|
| Drawer, Delivery result | `Download report` |
| Report file | `{id}-delivery-report.csv`. Columns: `{ID column}`, `Channel`, `Result`, `Reason`. Results: `Success`, `Failed`, `Waiting to send`. |
| Report reasons | SMS: `Invalid mobile number`, `Number not reachable`. Email: `Mailbox not found`, `Message rejected`. Push: `No active device`. |
| Do Not Disturb | `Add period`, `All day`. In the list, drawer and dialog: `Sat, Sun, All day`, and `+N more` after two lines. |
| Quiet period picker | Header `Time`. Screen reader labels: `Hour`, `Minute`, `Remove quiet period N`. |
| Recipient file, no counts (21 Oct) | Over the limit: `The file has more than 1,000 recipients` (was `The file has {n} recipients. The maximum is 1,000`). Confirm dialog Recipients: `{file} · by {column}` (was `{valid} from {file} · by {column}`). Preview title alone, without `{rows} Rows • {columns} Columns` (Figma 89:4665). |
| Broadcast End | Field `End date and time (optional)`, button `Clear`. Error `End must be later than the start`. Delivery note: `Sending stops at {end}; recipients not sent by then are counted as Not sent.` Drawer: `Broadcast end`, `Not sent`, `The broadcast ended at {end}. {n} recipients were not sent.` Report: `Not sent` / `Broadcast ended`. Confirm dialog: `No end date`. Fixture BC-0001 *Savings interest rate update*. |
| Cancel a draft (19 Oct) | Drawer button `Cancel broadcast` (Outline, Negative). Dialog `Cancel this broadcast?`, body `{name} will not be sent, and it cannot be edited again.`, buttons `Keep draft` / `Cancel broadcast` (the `destructive` confirm-dialog: the safe answer is the filled one). Toast `Broadcast cancelled` / `{name} is cancelled`. Drawer note `Cancelled before it was submitted. Nothing was sent.` Routes `#/broadcast/view/BC-0007/cancel`, `#/broadcast/cancelled`. Fixture BC-0008 *Year-end promotion*. |
| Failed (19 Oct) | Drawer note `A system error stopped the broadcast. {n} recipients were not sent.` (the second sentence only when n > 0). Report: `Not sent` / `System error`. Fixture BC-0009 *Loan payment reminder*. |
| Audience file read on Submit (19 Oct) | Dialog title `The audience file cannot be used`; its body and Close reuse the build's copy (`The file has no recipients`, `The file has more than 1,000 recipients` (no count since 21 Oct), `The file has no valid recipients. Fix the file and upload it again`). The read's spinner reuses `Checking file…`, as its screen-reader label only since 21 Oct 2026 (no text on the overlay); its failure reuses `Unable to submit the broadcast` / `Please try again`. Fixture `NO_VALID_CSV` is `CIS_CSV`'s first three rows with the CIS IDs removed. |
| Message content card (21 Oct) | Title `Create broadcast message`, the requester's wording. The original build called the step `Manual content`; draft 2.2 has no title on the card. |
| List search and filters | Search `Search by broadcast name or description` (matches name or description). Filters `Channel` and `Status`, with `All`, `Select all`, `Clear` and the row's `Clear`, and the empty result `No results found`, are Notification management's. The Status options are the list of values (Draft, Queue, Processing, Published, Failed, Cancelled). |
