# CNH Phase 2: requirements and context

This page is the starting point for anyone working on CNH Phase 2, whether designer, developer, BA or agent. It covers what the product is, what Phase 2 adds, the rules each feature follows today, who ruled on what, and what is still open.

When this page and the running prototype disagree, the prototype wins. Fix this page.

Last updated: 14 Oct 2026. The Broadcast rules below include the 14 Oct changes on branches `update/broadcast-list-columns`, `add/broadcast-delivery-report`, `update/broadcast-time-step`, `update/broadcast-dnd-rules` and `add/broadcast-end`. They reach `main` when those PRs merge.

## The product

The **Customer Notification Hub (CNH)** is Bangkok Bank's back-office console for the notifications sent to customers by push, email and SMS. It is a web console built on **webds**, at 1920 × 1080.

- **Phase 1, Template Management (Notification management).** Business teams used to keep notification templates in a shared Excel file. Updates were manual, there was no audit trail, and review happened outside the system. Phase 1 moves templates into the console.
  - List: search, filter and sort.
  - Create and edit, with validation.
  - Status, and automatic audit fields.
  - Phase 1 shipped on 23 Sep 2026 as the webds flow `cnh-notification-management`.
- **Phase 2** adds two features on top of Phase 1:
  1. **Import templates:** bring templates into the list from files.
  2. **Broadcast message:** send one message to many customers from an uploaded audience file, now or on a schedule.

## Sources, newest first

| Date | Source | What it settles |
|---|---|---|
| 30 Oct 2026 | BA & Dev feedback deck *Post MMP 2 - Feedback Wireframe (Import & Broadcast)* | Broadcast: no DND column on the list; a Service code dropdown on Step 2; Deep link on Push; Sender name and Sender email address on Email; dynamic field Option 2 + 3, opened by typing `$`, format `${dynamicField}`; a preview of every channel filled from the audience file's first row. Import: the duplicate-file question becomes a warning; an Import Template tab, one row per imported file, with its result and report |
| 29 Oct 2026 | BA's minutes of the Phase 2 flow review (MoM) | Import: one file with an inline error, an Import Template page with each import's result, row-by-row results; Broadcast: one audience file, no "1,000 recipients" in the hint, no End date, DND rules that leave no time to send block Submit; dynamic field still open. Status per item: [BA MoM, 29 Oct 2026](#ba-mom-29-oct-2026-what-is-built) |
| 28 Oct 2026 | BA / Dev sync (requester's summary) | Recipient type CIS ID / Email / SMS (no Direct recipient); one broadcast, one language; Do Not Disturb that covers every day, all day warns; Processing and Published meanings |
| 21 Oct 2026 | Requirement update | After upload the recipient column starts unselected; the system cannot count rows or columns, so no counts are shown |
| 15 Oct 2026 | Requester's call | Import takes one file at a time, with the CMS checks (one file, 10 MB); a file imported before asks before it imports over it |
| 14 Oct 2026 | BA feedback on the prototype, and BA answers to Q1, Q2 and Q5 | List columns, report download, 5-minute steps, several DND periods, Broadcast End, Direct recipient stays, DND rather than Service Window |
| 12 Oct 2026 | Requester's call | File upload uses the CMS prototype's upload slots |
| 12 Oct 2026 | This repo starts | Rebuild of Korn's prototype on webds |
| 6 Oct 2026 | Korn, from the BA's AI draft | Broadcast as a one-page, six-step Create form; Draft and Edit |
| 5–6 Oct 2026 | Korn, from the PO's written requirement | Import rulings (below); `.jsonl` format since 6 Oct |
| undated | BA deck *Broadcast Message* (internal alignment, 6 pages) | Broadcast concept, scenarios, master recipient file |
| May 2026 | Kick-off deck *Template Management: Business Journey for UX/UI Kick-off* | Phase 1 scope and template fields |

Where the sources live:

- **Original prototype:** https://cnh-tm-phase2.vercel.app. The mirrored build is in `.reference/`.
- **Import design (Figma):** [CNH Phase 2 Import Template](https://www.figma.com/design/Yd9yyAx8ko3q2Atg0kfxe2/-CNH-Phase-2--Import-Template?node-id=54-890), page *Flow [15 Oct 2026] Single file*: all 12 states of the one-file Import as webds-library screens, with the task flow. The CMS upload slot is a local component set there (webds gap).
- **Flow archive:** webds `get_flow("cnh-phase2")`. It holds routes, rulings and gaps. Its open questions P2-1…P2-20 are in the original repo's `docs/open-questions.md`, which is not on this machine.
- **Decks:** in the BA's hands. Summaries are in the Obsidian vault under `BBL/CNH - Requirement - …`.
- **Gap detail:** [broadcast-gaps.md](broadcast-gaps.md). Borrowed components: [cms-components.md](cms-components.md).

## Phase 1 baseline (what Phase 2 builds on)

From the kick-off deck. `*` means required in the deck.

- **Template fields:**
  - Core: Template Name\*, Description, Template Ref Code\*, Service Code\*, Notification Source Code\*, Status\*.
  - Content per channel, each in EN and TH: Push title\* and message\*, Email subject\* and body\*, SMS message\*.
  - Governance: created and updated date and by, Remark, Dynamic fields, Notification group.
- **Prototype differences** (no ruling yet):
  - The module is called *Notification management*.
  - Status is Draft, Published or Inactive. The deck says Active or Inactive.
  - The form has no Template Ref Code and no Notification Source Code, but adds Product Name.
  - Channels are switched on one at a time.
  - The list shows 50 rows per page.
- **Value lists:**
  - Service codes: NANOTI, NAOTP, NABATCH, NAMKTNOTI, NAMKTBATCH.
  - Notification groups: Transactions, Promotions, Services, Security, System updates, Reminders, Customer engagement.

## Feature 1: Import templates

**Entry:** the **Import** button in the Notification management list header, beside Create notification. It opens a dialog, not a page.

| Rule | Value |
|---|---|
| File format | `.jsonl` (JSON Lines): one template per line. It is the same format the list downloads, so a downloaded file imports back. The upload control takes `.jsonl` only: the chooser filters by it and a dropped file of another type is not taken, so there is no Invalid file format state (requester, 22 Oct 2026; before, a wrong extension was taken and flagged). |
| Files per import | **One** (requester, 15 Oct 2026; before that, one or many up to 50). A drag of two or more files turns the zone Negative with **1 File Only** (CMS's copy) while it is over the zone. Released outside the zone, the files fly back and the zone goes back to default. Released on the zone, no file is taken and the error state stays until the dialog is cancelled or one valid file is dropped or chosen (Korarit's Figma comment and the requester, 29 Oct 2026). Before: the drop was refused and the files flew back (design critique, 20 Oct 2026; error back by the BA's MoM, 29 Oct 2026, after 27–29 Oct without it); before that, the drop landed and took none. |
| File size | At most **10 MB**, CMS's limit (`MAX_ASSET_BYTES`). Checked on Import, before the upload: the file stays in its slot, CMS's upload-failed slot (`State=Error (upload failed)`) without Try again, reading **Max file size: 10 MB** in place of the meta (requester, 22 Oct 2026; 20–22 Oct the file was not taken and the empty zone read it). PROPOSAL, pending BA confirmation: the BA has not set a size limit (P2-1…P2-9). |
| When a file is checked | On **Import**, not when it is picked (requester, 22 Oct 2026; before, as soon as it was picked): a file is selected → 10 MB or less → under the upload spinner, the file name was imported before → the upload succeeds. No template field is checked (requester, 27 Oct 2026; 20–27 Oct, "every template has the required fields" came first under the spinner and failed as **Invalid template structure: …** under the slot). A file with no line of JSON fails the upload (**Unable to import templates**). Picking a file only puts it in the slot (meta *JSONL*: the file type only, no size and no template count; requester, 27 Oct 2026, was *JSONL • 1 KB*). |
| Blocking | A file in error blocks Import until it is removed (trash mark). Import with it reads **Remove the file and choose another to continue**. Messages under the zone or slot are webds Inline Message, Negative XS (22 Oct 2026). |
| Duplicate file | A file whose **name** was imported before asks first: **Replace imported templates?** · *\<file name\> was imported before. The templates from that import will be deleted and replaced with the ones in this file.* · Cancel / **Replace** (reworded 21 Oct 2026; was **Import over \<file name\>?** · Cancel / **Import**). Since the design critique (20 Oct 2026) it is never a dialog over a dialog: the upload spinner validates the file inside the Import dialog, and only then does the Import dialog close and the question open, alone on the list. Its Replace uploads again; Cancel goes back to the Import dialog with the file still in its slot, for the user to remove (BA, 22 Oct 2026; was: closed it and stayed on the list). (Before, it opened over the Import dialog right after Import.) Import removes the templates that file's last import added and adds the new ones (requester, 15 Oct 2026). Open: what happens to those templates once they are edited or Published; whether the check should be by name or by content. |
| Fields per line | `recordType: "TEMPLATE"`, `templateName`, `description`, `serviceCodes` (from the value list), `channels` (PUSH, EMAIL, SMS) and `templateLanguages`. Not checked on Import since 27 Oct 2026 (requester): a missing field imports as empty. |
| Result | Every imported template is a **Draft** and lands on page 1; the list sorts by Last updated, newest first. |
| States | Initial; no file; more than one file; file over 10 MB; file selected; duplicate (Replace imported templates?, after the spinner); uploading (a spinner covering the whole Import dialog, title to actions, no text since 21 Oct 2026 (was *Importing templates…*); 15–21 Oct it was a Scrim Strong and spinner over the whole page, as CMS `SubmitOverlay`); failure (**Unable to import templates** inside the file slot with a **Try again** Ghost Button, CMS's upload-failed slot, requester 20 Oct 2026; before, a Negative banner on top of the dialog, "Please try again"); success (back on the list, toast for 3 s). Each has a route, `#/list/import/<state>`. |
| Upload UI | CMS upload slot: `UploadZone` until a file is picked, then `UploadedFile` in its place, with no **Preview** (BA, 22 Oct 2026): the users are not technical and will not open the file to read it. 20–22 Oct the slot had Preview (`FilePreviewDialog`, OK / Import), replacing the Import dialog while open. |

Still open from the original build (P2-1…P2-9): the schema, size limits, duplicates, and all copy.

## Feature 2: Broadcast message

### What it is

A one-to-many send: the same notification to many recipients, from an uploaded audience file.

- **Tracked:** whether each message could be sent, how many succeeded and how many failed.
- **Not tracked:** whether the recipient opened or read it.

### Screens

- **List** (`#/broadcast`): Broadcast name, Channel, Broadcast start, Do Not Disturb, Status. Recipients and Result were removed on 14 Oct and live in the drawer.
  - Hovering a row that has a report shows a download mark beside its status, as Notification management's row download (22 Oct 2026). One row, one file; no checkboxes or bulk download.
  - Loading and load-fail states, as Notification management draws them (20 Oct 2026): a spinner card, or *Unable to get information* with **Try again**, under the filter row (`#/broadcast/loading`, `#/broadcast/error`).
- **Detail drawer**, 720 wide:
  - Delivery result: Total, Success, Failed, Not sent (only when there is any) and Waiting to send, with a status note.
  - **Download report** in the drawer footer, as the CNH template drawer's Download (21 Oct 2026).
  - Both downloads ask first (*Download the delivery report?*: Cancel / **Download**), then save the CSV and show a *Download Success* toast, as Notification management does (22 Oct 2026).
  - Be able to download? If not, no file is saved and a Negative toast reads *Unable to download* / *Please try again*; the user stays where they were (list or drawer) and downloads again (22 Oct 2026).
  - Broadcast details: description, service code (30 Oct 2026), audience file, recipient type, start, end, Do Not Disturb.
  - One section per channel.
  - A Draft and a Cancelled broadcast have no Delivery result; Broadcast details carries the status note.
  - **Cancel broadcast** and **Edit** on a Draft; **Cancel broadcast** alone on a Queue broadcast, which cannot be edited (BA MoM, 29 Oct 2026). On Queue the dialog's safe button reads **Keep broadcast** (composed, 29 Oct 2026). Cancel sits on the footer's left edge, Edit on the right (22 Oct 2026, consistent with CMS negative actions). Cancel asks first (*Cancel this broadcast?*: **Keep draft** / **Cancel broadcast**), then the list shows a *Broadcast cancelled* toast and the row turns Cancelled. If the status cannot be updated, *Unable to cancel the broadcast* (**Close** / **Try again**, as Submit's fail dialog) and the broadcast stays a Draft.
- **Create and Edit broadcast:** one page with six steps, a sticky footer with **Save draft** and **Submit**, then a confirm dialog.
  - While the page (or the draft) loads: a spinner in the body, the footer buttons disabled, as Create notification (`#/broadcast/create/loading`, `#/broadcast/edit/<id>/loading`). Edit fails on Submit like Create (`#/broadcast/edit/<id>/fail`).
- **Error behavior** (CNH Phase 1, [Figma 123:95723](https://www.figma.com/design/JjvzdUwg5LlKHDQvo2fny0/-CNH--UI-CNH-Template-Management?node-id=123-95723); requester, 22 Oct 2026): errors appear on **Submit** (or Save draft) and stay until the next one. Typing, picking a file or a column, or switching a channel on does not clear a mark; Submit checks again and leaves only what is still missing. A field that goes away drops its error: a channel switched off, a quiet period removed, Send as soon as possible. Switching the recipient type clears the channel message, whose words depend on it. Before, each error cleared as soon as its field changed. Presets, Phase 1's steps 2–5: `step1-filled` → `no-channel` → `channel-typing` → `channel-errors`.

### Create: the three steps

Layout and step copy follow draft 2.2 webds-matched ([Figma 85:19401](https://www.figma.com/design/u2fZplMakSiBhP7H4shMeV/-CNH-Phase-2--Broadcast-Message?node-id=85-19401), 15 Oct 2026). The draft numbers its steps 1, 2, 5, 6; the build numbers them 1–3, with Do Not Disturb as its own card in the Delivery Date step (Figma 409:75574).

1. **Basic information.** One card, "General information": Broadcast name\* (max 100) above Description (max 250).
2. **Validate Audience file.** Two cards.
   - "Upload Audience file":
     - Service code\* (BA & Dev feedback, 30 Oct 2026): a dropdown at the top of the card, 456 wide as the ID column's, holding Phase 1's codes (NANOTI, NAOTP, NABATCH, NAMKTNOTI, NAMKTBATCH). One code per broadcast; label and placeholder (*Select service code*) are the Template form's, where it is a multi-select. Required (user's pick, 30 Oct 2026): Submit with none reads *This field is required*. The confirm dialog and the drawer's Broadcast details show it under the name / description.
     - Select Recipient type\*: **CIS ID** (CIS ID column; any of Push, Email, SMS), **Email** (an email column; Email only) or **SMS** (a mobile column; SMS only), as three plain radios side by side (BA / Dev sync, 28 Oct 2026; was CIS or Direct recipient, where Direct then picked Email or SMS on the channel cards, which confused users).
     - Upload File\*, then the ID column under it: the card reads top to bottom at full width (requester, 22 Oct 2026; it was the file beside the column). The file is `.csv` or `.xlsx`, at most 10 MB and 1,000 recipients. One file at a time (BA MoM, 29 Oct 2026): a drag of two or more turns the zone Negative with **1 File Only**, as Import's zone, and takes none; the error holds after the drop until one file is dropped or chosen (before, the first file was taken and the rest dropped silently). The hint reads *CSV or XLSX, up to 10 MB* (BA MoM, 29 Oct 2026; was *… and 1,000 recipients*); the 1,000-recipient limit stays and is checked on Submit (requester, 29 Oct 2026).
     - **On pick, only the file type and size are checked** (BA, 19 Oct). The browser can show a preview but cannot read the whole file, so the full read happens on Submit.
     - After upload: the file row (name and size; no *File validated* since 27 Oct 2026, design critique: a file that fails the pick is never placed) and a preview of the whole file in a box five rows tall at the column's width, scrolling both ways under a fixed header, with no count. The system cannot count the file's rows or columns (requirement update, 21 Oct), so the "100 Rows • 25 Columns" beside the title in Figma 89:4665 is left out, and there is no valid / invalid count. The preview does not highlight the selected ID column (requirement update, 21 Oct). Every Create preset with a CIS file (`filled`, `cis`, `large-file`, …) loads `audience-cis-large.csv`, 100 rows × 55 columns. The box scrolls under webds' own Scroll Bars (Thick), shown as soon as the file overflows; the browser's are hidden, since macOS keeps them out of sight until a scroll starts. webds' `ScrollBar` only draws a position (gap), so pressing or dragging a track is wired in the page. No sample-file download (requester, 22 Oct 2026).
     - The system does not pick the ID column. After upload the select is empty (`Select column`) and the user picks any of the file's headers (requirement update, 21 Oct). Changing the recipient type empties it again.
     - The header's name does not matter. The field only says which column holds the data, so CIS IDs may sit in a column called `Recipient` (BA meeting recording, reviewed 14 Oct; **to confirm with the BA**).
     - **On Submit**, once every section is valid, a spinner covers the page while the whole file is read (spinner only since 21 Oct 2026; it showed *Checking file…*):
       - **PROPOSAL, pending BA (Q15):** before the row checks, an Email or SMS column that holds the other channel's contacts (SMS with the email column, or Email with the mobile column) stops the submit. No dialog: the page scrolls to Step 2 and the column select says *{COLUMN} contains email addresses. Select the column that contains mobile numbers* (or the reverse). Without it the same file ends in *no valid recipients*.
       - Invalid rows are skipped. The confirm dialog lists them under *Invalid recipients are skipped. Only valid recipients will receive the broadcast.*, in a table of Row / {ID column} / Problem.
       - No rows, more than 1,000 rows or no valid recipient blocks the broadcast: *The audience file cannot be used* with the reason and Close, and the reason stays on Step 2. **PROPOSAL, pending BA confirmation** (Q16).
       - If the read fails, the system-fail dialog *Unable to submit the broadcast* (Close / Try again) appears, and Try again reads the file again.
     - Save draft does not read the file.
   - "Create broadcast message" (requester, 21 Oct; draft 2.2 has no title on this card): one card per channel, stacked in one column like the Template form's channel cards (requester, 27 Oct 2026; was three across).
     - Each card is switched on and off in its own title row. The switches replace the channel checkboxes. A card that is off keeps what was typed and disables it. CIS ID offers all three cards. An Email or SMS broadcast shows only that channel's card, always on, with no switch (BA / Dev sync, 28 Oct 2026; 27–28 Oct, Direct recipient drew Email and SMS with a radio in each title row, Figma 325:62582).
     - Fields are the Template form's TH fields without the *(TH)*: Push title\* (255) and Push message\* (2048); Email subject\* (255) and Email content\* (2048); SMS message\* (800). One broadcast is written in one language, Thai or English (for example for foreign customers); there is no language select (BA / Dev sync and requester, 28 Oct 2026; before, every label read *(TH)* and the push and SMS placeholders *in Thai*).
     - **Dynamic field** (BA & Dev feedback, 30 Oct 2026, "Option 2 + 3"; the user read it as Idea 2.2 + Idea 4): a `+` on each card's title row (Contained Icon Button, Figma 359:112101) opens the file's columns in a pop-up with a search (webds `select-list`, PR #53), and typing **`$`** in a message box opens the same columns at the caret (Idea 4; `$` or `${` then letters filter, ↑ ↓ Enter / Tab / Esc). Either way the field goes in as **`${COLUMN}`** (the deck's `${dynamicField}`; was `{{COLUMN}}`), tinted as a chip that the caret steps over and Backspace takes whole (the 21 Oct defaults). The `+` inserts at the caret of that card's last-focused message box, or into its first box. The title row of *Create broadcast message* says *Type $ to add a dynamic field*; before a file is uploaded it reads *Dynamic fields can be added once the audience file is uploaded.* and the `+` buttons are not drawn. The Deep link and sender fields take no dynamic field. A `$` that matches no column (a price such as `$100`) opens nothing.
     - **Preview** (BA & Dev feedback, 30 Oct 2026: *Display preview all channel by first row data from audience file*): every channel card splits in two, the fields on the left and **Preview** on the right, as the deck draws Email. The preview is a grey area (Surface/Secondary) holding the message as a white Card Surface: Push title and Email subject in Label L Emphasized over the message in Body S; SMS the message only. Every `${COLUMN}` the file has is filled from the file's **first data row**, tinted as a link (Text/Link). With no file yet, or a token the file has no column for, the token shows as typed. Nothing typed: *Type a message to see its preview.* (composed). **Hide preview ›** (Ghost Button, Highlight, no padding) folds a card's preview away and gives its fields the full width; **Show preview ‹** comes back on that card's title row, left of its `+`. Each card folds on its own and opens shown. A card that is switched off keeps its preview. The deep link and the sender are not previewed.
     - Push also has **Deep link** (optional, the Template form's: text area, max 2048, placeholder *Enter a deep link URL (optional)*, hint *A deep link will take customers to your specific destination when tapping the push notification*). Email also has **Sender name\*** (max 255, *Enter sender name*) and **Sender email address** (optional, max 255, the Template form's *Enter sender email address (optional)*), one under the other below Email content (BA & Dev feedback, 30 Oct 2026; side by side until the preview took the card's right half the same day). Required and optional are the user's pick (30 Oct 2026). These three take no dynamic field and only their maximum is checked (the Template form's character-set check is not ported). The drawer lists them under their channel; the confirm dialog lists no message fields, so not there.
     - No channel on: an Alert above the cards and a red stroke on each card.
3. **Delivery Date.** Two cards in one step: "Select Delivery Date" ([Figma 89:4665](https://www.figma.com/design/u2fZplMakSiBhP7H4shMeV/-CNH-Phase-2--Broadcast-Message?node-id=89-4665), 15 Oct 2026), then Do Not Disturb ([Figma 409:75574](https://www.figma.com/design/u2fZplMakSiBhP7H4shMeV/-CNH-Phase-2--WIP_Broadcast-Message?node-id=409-75574), 21 Oct 2026):
   - **Send as soon as possible**, or **Schedule delivery** with Start date and time\* (5-minute steps, later than now).
   - **No End date** (BA MoM, 29 Oct 2026). 14–29 Oct an optional End date and time sat right of Start, for Schedule delivery only (BA's Q2 answer, 14 Oct; requester, 15 and 20 Oct). Start keeps the left half.
   - **Do Not Disturb (DND)** card: the switch before the title, "Prevent sending messages during quiet hours." under it (no "Select DND" heading). The switch is off on a new broadcast, and the periods below it are disabled until it is on. Then any number of quiet periods, each on its own bordered card: days, hours (5-minute steps) or **All day**, and a trash when there are two or more. **Add more period +** (Outline button) under the cards. The one time zone, Asia/Bangkok (GMT+7), follows the time label: **Quiet period from (GMT+7)** (design critique, 27 Oct 2026; was a *Time zone* row under the periods). Whether the user can pick a time zone is open (Q19).
   - **Every day, all day** (BA / Dev sync, 28 Oct 2026; blocks Submit since the BA's MoM, 29 Oct 2026): when the quiet periods leave no time to send, however they add up (Mon – Sun All day, or Mon – Fri All day and Sat, Sun All day), an Alert on the Do Not Disturb card, under the periods, reads *Do Not Disturb covers every day, all day. No message will be sent.* (webds Alert, Title only; composed). While editing it is a Caution. **Submit is never disabled** (requester, 29 Oct 2026): pressing it is an error like every other Create error: the Alert turns Negative (CloseCircle), the page scrolls to it, and no confirm dialog opens. Once the periods leave time to send, the Alert and the error go. 28–29 Oct it was a warning only and Submit went ahead, on the card or in the confirm dialog (`?dndw=`, now removed). The Delivery card's outlook promises no start meanwhile. Presets `#/broadcast/create/dnd-all-week` (Caution) and `dnd-all-week-submit` (Submit pressed; was `dnd-all-week-confirm`).

### Delivery rules

- **Do Not Disturb, not Service Window** (BA, 14 Oct).
  - Sending pauses inside any quiet period and resumes when it ends.
  - A start that falls inside a quiet period moves to the period's end.
  - Periods that touch chain together, for example Friday night into an all-day weekend.
  - Overlapping periods are allowed.
- **Overnight periods** belong to the day they start. Whether Monday 00:00–08:00 should also be quiet is **TBC** (Q11).
- **No Broadcast End** (BA MoM, 29 Oct 2026; was BA, 14 Oct: at the end sending stopped and the recipients left were Not sent). *Not sent* now comes only from a system error (Error).
- **Status on submit:** always **Queue**; the system then picks it up and validates it (**Processing**), and once validated it is **Published** (BA / Dev sync, 28 Oct 2026; before, a broadcast sent now and outside a quiet period went straight to Processing). **PENDING BA confirmation** of this lifecycle: see the BA question under Open items. **Superseded, not built yet:** the BA's Broadcast Job Lifecycle (29 Oct 2026) moves sending into Processing and makes Published the end of the job (see *Broadcast job lifecycle* below).
- **Statuses** (list of values 16 Oct 2026; meanings 19 Oct 2026, Processing and Published 28 Oct 2026). The badge shows them in title case.

  | Status | Meaning | Badge |
  |---|---|---|
  | DRAFT | Saved with **Save draft**. | Caution (yellow) |
  | QUEUE | Submitted; the system has accepted it. | Disabled (grey) |
  | PROCESSING | The system has picked the broadcast up and is validating it. Nothing is sent yet: no Delivery result, no report; the drawer note reads *Checking the broadcast before sending. Nothing is sent yet.* (composed). (BA / Dev sync, 28 Oct 2026; was *started sending*.) | Accent (blue) |
  | PUBLISHED | Validated (BA / Dev sync, 28 Oct 2026; was *finished*). In the prototype, sending, paused in a quiet period and finished are all Published; the Delivery result shows the progress. PENDING BA confirmation. | Positive (green) |
  | FAILED | A system error stopped it, in Queue or Processing. The badge and the Status filter read **Error** (UX writer, 28 Oct 2026; *System error* from the 27 Oct design critique; PROPOSAL, pending BA confirmation). | Negative (red) |
  | CANCELLED | A Draft or Queue broadcast was cancelled because it is no longer needed (Queue added 29 Oct 2026, BA MoM). The drawer note reads *Cancelled before sending started. Nothing was sent.* (composed; was *…before it was submitted…*). | Disabled (grey) |

  - The old Scheduled is Queue, Sending and Completed are Published (Sending was Processing until 28 Oct 2026).
  - The old Paused is Published (Processing until 28 Oct 2026); the drawer still says it is inside the quiet period. Fixture BC-0004.
  - **Cancel is for Draft and Queue** (BA MoM, 29 Oct 2026; was Draft only). Once processing starts (Processing and later) a broadcast cannot be cancelled.
  - A Cancelled broadcast stays in the list, read only, with no actions.
  - A Failed broadcast keeps its Delivery result, with its note as a Negative (red) Alert (27 Oct 2026). Recipients still waiting when it stopped are counted as **Not sent** (report reason `System error`), and Download report is offered once anything was attempted. There is no retry.
- **Edit:** a Draft reopens in Edit and saves under the same ID. Queue and later cannot be edited (P2-20). Cancelled cannot be edited.
- **Delivery report:** a CSV, `{id}-delivery-report.csv`, with one row per recipient: ID, Channel, Result (Success, Failed, Not sent, Waiting to send) and Reason.
  - Offered once anything was attempted (Published, Failed; Processing only validates since 28 Oct 2026).
  - In the prototype the rows are mock data built from the counts.

### Recipient file (from the BA deck; not every rule is in the prototype)

- One row per recipient (CIS).
- Columns: CIS ID\*, Mobile number, Email address, First name, Last name, Tier. These names are the deck's example, not required headers (see step 2).
- **Prototype checks** (on Submit since 19 Oct): ID required; mobile and email well formed; no duplicate IDs.
- **Deck checks the prototype does not:** at least one contact method per row; no duplicate mobile or email in the file; data "valid and active". This is Q7.
- **Push:** finds device tokens from CIS ID.

## BA rulings log

| Date | Ruling |
|---|---|
| 30 Oct 2026 | BA & Dev feedback deck: a **preview of every channel**, filled from the audience file's first row. Built on each channel card, right half, after the deck's Email mock-up; Push and SMS follow its shape. *Hide preview ›* / *Show preview ‹* per card (the deck draws *Hide preview* only; *Show preview* and its place on the title row are composed). With no file the tokens show as typed; with nothing typed, *Type a message to see its preview.* (composed). Email's Sender name and Sender email address now stack, so the address placeholder is not cut. webds ships no message preview (gap). Figma not updated yet. |
| 30 Oct 2026 | BA & Dev feedback deck: dynamic field **Option 2 + 3**, opened by typing **`$`**, format **`${dynamicField}`**. The user read Option 2 + 3 as Idea 2.2 (the `+` per channel card and its search pop-up) plus Idea 4 (type to open at the caret), with the trigger `$` (was `/`, `@` or `{{`) and the token `${COLUMN}` (was `{{COLUMN}}`, in every fixture and preset too). Highlight and Backspace-takes-the-chip-whole stay (the defaults). Removed: pills (Idea 1 / 1.2) and their *When many fields* options (PR #57), the shared button (Idea 2), the picker dialog (Idea 3 / 3.2), the `{ }` mark, the 3-column layout, the Prototype control's Design direction group and `?df=`; `src/prototype/dynamic-field.ts` became `audience-fields.ts`, which keeps only the Few / Many fields file switch, now `?fields=few|many`. The composed *Click in a message field first, then choose a field to insert* is gone (only the shared button used it). Figma not updated yet (dynamic field was pending a direction). |
| 30 Oct 2026 | BA & Dev feedback deck: Push gets **Deep link** (optional) and Email gets **Sender name** (required) and **Sender email address** (optional), from the Template form without *(TH)/(EN)*, since a broadcast has one language. Sender name was required in English on the Template form; Broadcast keeps it required (user's pick). Sender name and address sit side by side at one box height (the Template's Sender name box is 77 tall). Fixtures: deep link `bualuang://notification/detail` (the Template fixture's), sender name `Bangkok Bank` (composed). Figma not updated yet. |
| 30 Oct 2026 | BA & Dev feedback deck: Broadcast Step 2 gets a **Service code** dropdown (*Add service code – dropdown type*). Built required, single pick, from Phase 1's five codes, at the top of the Upload Audience file card; shown in the confirm dialog and the drawer. Required is the user's pick (the deck does not say). Fixtures' codes are composed (campaigns NAMKTBATCH, App maintenance NANOTI, the rest NABATCH); the `filled` preset picks NAMKTBATCH. The list's Service code filter stays hidden. Figma not updated yet. |
| 29 Oct 2026 | Cancel is allowed on Draft and Queue (BA MoM, Broadcast Job Lifecycle; was Draft only, the 19 Oct "system limit"). The Queue drawer footer has Cancel broadcast alone (Queue cannot be edited, requester 29 Oct). Composed: the dialog's safe button on Queue reads **Keep broadcast**; the Cancelled note reads *Cancelled before sending started. Nothing was sent.* Figma synced the same day (View detail `Footer · Queued`). |
| 22 Oct 2026 | Broadcast Create/Edit errors stay until the next Submit, as CNH Phase 1's Error behavior (Figma 123:95723); before, each error cleared as soon as its field changed. Requester's call. Figma: section "error behavior" (435:166652) on the Broadcast file. |
| 22 Oct 2026 | Import checks run on **Import**, not on pick: a file → 10 MB → (under the spinner) required fields → name imported before → upload. The upload control takes .jsonl only, so Invalid file format is gone (route `#/list/import/invalid-format` removed). A file over 10 MB stays in its slot as CMS's upload-failed slot without Try again (was: not taken, the empty zone read the error). Messages under the zone and the slot are webds Inline Message. Requester's call, drawn first on the Import Figma file (section 166:5384). |
| 22 Oct 2026 | Import: the file slot has no Preview; the users are not technical and will not read the file (BA, asked about the use case). So Cancel on **Replace imported templates?** goes back to the Import dialog with the file still in its slot, and the user removes it; before, Cancel closed both and stayed on the list. Figma not updated yet. |
| 21 Oct 2026 | Import uploading: the spinner sits inside the Import dialog again, covering title, body and actions (Korn's 5 Oct build), not a Scrim Strong over the whole page; a full-page overlay over a dialog read oddly. Still no text. Requester's call. Figma not updated yet. |
| 21 Oct 2026 | Full-page spinner overlays carry no text: Import's upload (was *Importing templates…*) and Broadcast Submit's file read (was *Checking file…*). The copy stays as the spinner's screen-reader label. Requester's call. Figma not updated yet. |
| 21 Oct 2026 | Import duplicate question reworded: **Replace imported templates?** · *\<file name\> was imported before. The templates from that import will be deleted and replaced with the ones in this file.* · Cancel / **Replace** (was **Import over \<file name\>?** · *This file has already been imported. Its templates will be replaced with the ones in this file.* · Cancel / **Import**). "Import over" did not say what is lost; the button now names the action, the same verb as the title, as "Submit this broadcast?" does. Composed copy, requester's call; the body still promises nothing about edited or Published templates (open). Figma not updated yet. |
| 20 Oct 2026 | Import: a file over 10 MB is not taken; the empty zone shows the error, with no file name (review comment; Mobbin: Docusign, Upwork, Glassdoor reject an oversize single file and leave the picker empty). Figma updated the same day. |
| 20 Oct 2026 | Import: file over 10 MB and upload failure read inside the file slot, as CMS's `State=Error (upload failed)` (CMS `136:92553`); only the failure has Try again. The failure banner is gone. Requester's call; Figma updated the same day. |
| 20 Oct 2026 | Import, design critique: a drag of two or more files is refused before the drop; the duplicate question opens alone after the upload spinner, not over the Import dialog (requester picked this over an alert inside the dialog); Preview replaces the Import dialog instead of stacking a darker scrim; Preview's Download / OK are now OK / Import. Figma task flow updated the same day. |
| 20 Oct 2026 | Import dialog and Import over…? 444 wide, webds Dialog `Max Width=XS` (was 600, `S`). Requester's call; Figma task flow updated the same day. Layout only. |
| 19 Oct 2026 | Import dialog 600 wide, was 800: too wide for one file (review comment). 600 is the sectioned dialog's measured width and the Import over…? dialog's. Layout only. |
| 15 Oct 2026 | Import uploading: the spinner covers the whole page (Scrim Strong, on-inverse spinner, CMS `SubmitOverlay`), not only the dialog. Requester's call. |
| 15 Oct 2026 | Import: one file per import; 10 MB (CMS's limit, pending BA); duplicate file name asks "Import over …?" and replaces that file's earlier templates. Requester's call, not the BA's. |
| 14 Oct 2026 | Remove Recipients and Result from the broadcast list; the drawer shows them. |
| 14 Oct 2026 | Add a download to the drawer, built as the Delivery report. |
| 14 Oct 2026 | Times in 5-minute steps, for Start and for DND. |
| 14 Oct 2026 | DND can hold several quiet periods that the user adds; All day per period. |
| 14 Oct 2026 | Broadcast message uses DND, not Service Window (Q1). |
| 14 Oct 2026 | Broadcast End goes into the prototype: optional, Not sent, still Completed (Q2; Published since 16 Oct). |
| 14 Oct 2026 | Direct recipient stays; the ID column is chosen from the file (Q5). |
| 14 Oct 2026 | Overnight DND (Q11): TBC. |
| 14 Oct 2026 | From the meeting recording, to confirm with the BA on 15 Oct: the file's headers are free. The Field select says which column holds the recipient data; it does not check the header's name. |
| 15 Oct 2026 | The file preview shows every row and column, five rows tall at the column's width, scrolling both ways (requester). |
| 15 Oct 2026 | Do Not Disturb moves into the Delivery Date step (Figma 89:4665): three steps. |
| 15 Oct 2026 | Broadcast End is for Schedule delivery only; Send as soon as possible has no end (requester, following draft 2.2). |
| 15 Oct 2026 | Create broadcast follows draft 2.2 webds-matched (Figma 85:19401): four steps (three since DND joined Delivery Date); message content under the audience step; channels switched on their own cards; content fields and limits from the Template form's TH fields; End left of Start. See "Create: the three steps". |
| 16 Oct 2026 | Broadcast statuses follow the list of values: Draft, Queue, Processing, Published; Paused folds into Processing. Failed and Cancelled are on hold (Q13). |
| 19 Oct 2026 | Validate the audience file: on pick, only the file type and size; the preview shows, but the whole file is read on Submit. Showing invalid recipients (Row / column / Problem) on Submit is possible. Design decisions with the requester: the read runs before the confirm dialog, which carries the invalid table; Step 2 drops the row count and the recipients summary; no rows, over 1,000 or no valid recipient blocks the submit (PROPOSAL, pending BA confirmation). |
| 19 Oct 2026 | Meaning of each status (Q13 answered): Failed is a system error; Cancelled is a saved draft cancelled by the user. Only a Draft can be cancelled; after Submit it cannot (system limit). Design decisions with the requester: Cancel sits in the Draft drawer footer behind a confirm dialog; a Cancelled broadcast stays in the list read only; a Failed drawer keeps Delivery result and Download report, no retry; badges Failed = Negative, Cancelled = Disabled. |
| 20 Oct 2026 | Start date and time comes before End date and time, Start on the left (requester). This departs from draft 2.2, which draws End first. |
| 21 Oct 2026 | Do Not Disturb leaves the Select Delivery Date card for its own card in the same step; still three steps. Its header is the switch, the title and the note only; "Select DND" is gone (requester, Figma 409:75574). |
| 21 Oct 2026 | Requirement update: the system does not pick the recipient column; the user picks it from an empty select. The system cannot count the file's rows or columns, so no count is shown: not beside the preview, not in the confirm dialog, not in the over-1,000 message. The invalid-rows table stays, without a count. The preview does not highlight the selected column. |
| 22 Oct 2026 | Broadcast gets Notification management's download behaviour (Figma `1:167606`), applied to the delivery report: a hover download per list row, and the drawer's Download report, both behind a confirm dialog and followed by a success toast. No multi-select: Broadcast has no requirement for bulk download (requester). Copy composed. Figma not updated yet. |
| 22 Oct 2026 | Download report gets Notification management's failure case (Figma `1:14740`): "Be able to download?" No shows the *Unable to download* toast, no file saved (requester). Figma Broadcast "Download Behavior" `433:155024` draws both downloads, and the drawer's Download report sits in the footer there too. |
| 28 Oct 2026 | DND: a period whose end is before its start ends on the next day (BA, 19 Oct). The row shows *Next day* after the To box, and the summary reads `18:00–08:00 (Next day)`. Never for All day or From = To. Copy composed. Which day the morning part belongs to stays Q11, TBC. Figma not updated yet. |
| 28 Oct 2026 | Recipient type and its ID column are two rows in the drawer and the confirm dialog: `Recipient type` CIS / Direct recipient, `Recipient column` CIS_ID (was `CIS · by CIS_ID`). Team design head's critique: the `·` join reads as AI-generated copy. Figma not updated yet. |
| 28 Oct 2026 | Broadcast copy drops every other `·` join (same critique): the drawer's as-soon-as-possible start, the Direct recipient radio description, the upload hint (reworded from the original build) and the invalid-rows Problem cell. Wording in broadcast-gaps.md. Figma not updated yet. |
| 21 Oct 2026 | The message content card gets a title, *Create broadcast message*, like the step's other cards (requester; composed, draft 2.2 has no title there). Figma not updated yet. |
| 22 Oct 2026 | Do Not Disturb is off by default on a new broadcast. The card still shows one period, Mon – Fri 20:00–08:00, disabled until the switch is on. Edit and the presets keep the broadcast's own setting (requester). Figma updated the same day: Do Not Disturb is its own card in the Create broadcast local component, and the DND Behavior section opens on Off. |
| 22 Oct 2026 | Each Do Not Disturb quiet period sits on its own bordered card (Card Surface), and the add button becomes the Outline button **Add more period +** (was the Ghost button *Add period*, rule between periods). Requester's own design, Figma `436:243478` (section *DND - TBC*). |
| 20 Oct 2026 | PROPOSAL, pending BA (Q15): on Submit, a wrong recipient column (Direct, the other channel's contacts; Email or SMS since 28 Oct) is marked on the column select before the row checks. Drawn on Figma Submit Result (325:68618) and in the prototype before the BA confirms. |
| 27 Oct 2026 | Design critique (design team only, not yet with the BA or dev): the FAILED status reads **System error** on the list badge, the drawer badge and the Status filter (was *Failed*). The drawer's Delivery result also counts *Failed* recipients, so a Failed broadcast read like failed deliveries (UX writer). The value stays FAILED; the Delivery result row and the report's `Failed` result are unchanged. *System error* (requester, over the UX writer's *System failed*) matches the drawer note and the report reason. The drawer's status note on a System error broadcast is a Negative (red) Alert with the CloseCircle mark (was Brand, information), to match the red badge; every other status keeps Brand. PROPOSAL, pending BA confirmation. Figma not updated yet. |
| 28 Oct 2026 | UX writer feedback: the FAILED badge and Status filter read **Error** (was *System error*, 27 Oct). The drawer's Error note adds `Download report for details.` after the Not sent count, only when the footer offers Download report. The note's *A system error stopped the broadcast.* and the report reason `System error` are unchanged. Composed copy, PROPOSAL, pending BA confirmation. Figma not updated yet. |
| 29 Oct 2026 | BA MoM: Download report only in Published, so the Error note drops `Download report for details.` and reads `A system error stopped the broadcast. {n} recipients were not sent.` again. The footer still offers Download report on Error until the 29 Oct status lifecycle is built. Figma (Broadcast file) synced the same day: the badge and Status filter read **Error**; the Error note never had the pointer. |
| 27 Oct 2026 | Design critique: the Do Not Disturb time zone moves from its own *Time zone* row under the periods into the time label, **Quiet period from (GMT+7)**. To confirm with the BA whether the time zone can be picked (Q19); the design team expects not. Figma not updated yet. |
| 27 Oct 2026 | Design critique: the uploaded audience file row drops *File validated* (green tick) beside the size. A file that fails the type or size check is never placed, so the label told the user nothing; the full read is still on Submit. Changed transcribed copy. Figma not updated yet. |
| 27 Oct 2026 | The channel cards under *Create broadcast message* (Push notification, Email, SMS) stack in one column, as CNH's Template form stacks its channel cards; before, three across. Requester's call. Layout only. Figma not updated yet. |
| 27 Oct 2026 | Direct recipient's Email and SMS cards are picked by a radio in the title row, not a switch, as Figma 325:62582 draws (requester). Ported from `add/dynamic-field-concepts` (e64e5e8) without the dynamic field concepts, into the one-column layout. Layout and control only. |
| 28 Oct 2026 | BA / Dev sync: Recipient type is **CIS ID**, **Email** or **SMS**, three radios (was CIS / Direct recipient; Direct's second pick of Email or SMS on the channel cards confused users). Email and SMS show only their channel's card, always on, no switch or radio (requester). The drawer and the confirm dialog read `CIS ID`, `Email` or `SMS`; the confirm dialog gets the `Recipient type` row the 28 Oct copy ruling describes. Presets `#/broadcast/create/email` and `/sms` replace `/direct`. Email and SMS radio descriptions composed. Supersedes Q5's "Direct recipient stays" (14 Oct) and the 27 Oct radio ruling. Figma not updated yet. |
| 28 Oct 2026 | BA / Dev sync: a broadcast is not Thai only. One broadcast is written in one language, Thai or English (for example for foreign customers). No language select (requester): the message fields drop *(TH)* (`Push title`, `Push message`, `Email subject`, `Email content`, `SMS message`) and the placeholders drop *in Thai*. Limits unchanged. Changed transcribed copy. Figma not updated yet. |
| 28 Oct 2026 | BA / Dev sync: Do Not Disturb that covers every day, all day warns the user; two options to try, inline on the rule at once or only after Submit, dev to confirm (the sync thinks inline works). Requester: a warning only, Submit still goes ahead; both options built, switched in the Prototype control. The check adds the periods up. Copy composed. Figma not updated yet. |
| 30 Oct 2026 | BA MoM 2c-i: Broadcast End is removed everywhere: the End date and time field, its error and the delivery note's *Sending stops at …*; the confirm dialog's *Broadcast end* row; the drawer's *Broadcast end* row and *The broadcast ended at …* note; the report reason *Broadcast ended*; preset `#/broadcast/create/end`. Fixtures BC-0006 and BC-0011 lose their end; BC-0001 (was scenario F, 174 Not sent) becomes a Published broadcast with every recipient attempted (994 Success, 6 Failed). Reverses the BA's Q2 answer (14 Oct). Figma not updated yet. |
| 30 Oct 2026 | BA MoM 2c-iii: Do Not Disturb that covers every day, all day blocks Submit. Submit stays enabled (requester, 29 Oct); pressing it turns the DND card's Caution Alert Negative and scrolls to it, no confirm dialog. The `?dndw=` switch (Prototype control *3. DND every day, all day*) and the confirm dialog's warning are removed; preset `dnd-all-week-confirm` becomes `dnd-all-week-submit`. Supersedes the 28 Oct *warning only*. Copy unchanged (composed). Figma not updated yet. |
| 28 Oct 2026 | BA / Dev sync: **Processing** means the system has picked the broadcast up and is validating it, not sending; **Published** means it passed validation. Requester: sending, the quiet-period pause and finished all live under Published; Submit always lands on Queue; Processing has no Delivery result and no report. Fixtures BC-0005 (Processing, nothing attempted) and BC-0004 (Published, inside the quiet period). Drawer note for Processing composed. PENDING BA confirmation of the lifecycle. Figma not updated yet. |
| 29 Oct 2026 | Mock data: more broadcasts carry more than one Do Not Disturb period, so the list's DND column, the drawer and Edit can be reviewed with 2, 3 and 4 periods. BC-0009 *Loan payment reminder* takes the BA's two periods; BC-0011 *Fixed deposit maturity reminder* and BC-0007 *November statement notice* take three (Mon – Fri 20:00–08:00, Sat 12:00–08:00, Sun all day); BC-0008 *Year-end promotion* takes four (Mon – Fri 12:00–13:00 and 20:00–08:00, Sat all day, Sun all day). Composed fixtures (requester), the same rows as the Figma list mock options (Broadcast file, UX Playground, section 616:19007). |
| 29 Oct 2026 | BA MoM (item 1a): a drag of two or more files onto the Import zone shows an inline error again. While the drag is over the zone, the zone turns Negative and reads **1 File Only** (CMS's copy); the drop is still refused and the files fly back. `#/list/import/too-many` draws that state. Reverses the requester's 27 Oct call (zone kept its empty look). Figma not updated yet. |
| 29 Oct 2026 | Import, no file: **Select a .jsonl file to import** reads inside the Negative drop zone, in place of its hint, as **1 File Only** does (requester). Before, the zone turned Negative and the message sat under it as an Inline Message. Layout only; copy unchanged. Figma 166:5674 updated the same day (not archived, minor). |
| 29 Oct 2026 | Import, more than one file: a drop of two or more files on the zone now keeps the Negative **1 File Only** state until Cancel or one valid file; released outside the zone, the zone goes back to default. While the drag is over the zone it stays red (the hover). Korarit's Figma comment and the requester. Figma section 171:11115 updated the same day (archive 240:43072, major). |
| 29 Oct 2026 | Import zone hint: **Drag and drop 1 .jsonl file only. Max file size: 10 MB** (was *Drag and drop a .jsonl file here · Max file size: 10 MB*), so the one-file rule shows before a drag and the `·` join is gone. Composed copy, requester's call. Figma local component Import / Upload zone 57:464 updated the same day (not archived, minor). |

## BA MoM, 29 Oct 2026: what is built

The BA's minutes of the Phase 2 flow review, received 29 Oct 2026, checked against `main` the same day (after PR #65). The tags are the BA's. "Figma" means the Figma file still draws the old rule.

### Import

| # | MoM | On `main` (29 Oct) | Next |
|---|---|---|---|
| 1a | **[Revise]** Browse one file at a time. More than one at once is not allowed and shows an inline error. | **Partly.** The chooser takes one file, and a drag of two or more is refused before the drop. Since 27 Oct the zone shows no error (requester); 20–27 Oct it turned Negative and read CMS's **1 File Only**. | Bring the inline error back for a drag of two or more. This reverses the 27 Oct call. |
| 1b-i | **[ADD]** A new side-nav tab, **Import Template**: one row per imported file. Selecting a row shows that import's result, and its file can be downloaded to read the result. The mock-up reuses Broadcast's list and drawer (Delivery result, Download report). | **Not built.** The four directions for the 10-minute server job (`?imp=A…D`, branch `add/import-background-directions`, not merged) have no import history page. Direction B's Recent imports strip comes closest. | Build the page as Broadcast's list and drawer. Decide whether it replaces the four directions or pairs with one of them, for example a toast that links to the page. The MoM does not give the columns, statuses, result counts or report columns: ask the BA. |
| 1b-B | Templates imported successfully, row by row, show on the notification template list, ordered by updated at, newest first. | **Order done:** the list sorts by Last updated, newest first, and imported templates land as Drafts on page 1. **Row by row not built:** a file can import in part, with the failed rows in its result. Today an import succeeds or fails whole, and no template field is checked (27 Oct). | Build with 1b-i. Ask the BA which checks the server runs on each row. |

**Import status and result (requester, 29 Oct 2026), answering 1b-i:**

- **No separate list page of imports.** The requester counts the Notification management list as that list. The MoM's Import Template tab is not built as its own page.
- **An import's status:** **Processing** (about 10 minutes on the server), **Completed** or **Error**.
- **An import's result:** **Templates in file**, **Imported** and **Failed**, with the download of the result file. The result file's columns are out of scope: the backend owns them.
- **Where they show:** in each of the four wait directions (`?imp=A…D`), mocked on `add/import-background-directions` (requester, 29 Oct 2026): A and C in the job row, B in a drawer from the Recent imports row, D in the done toast. Picking one direction is still open.

### Broadcast

| # | MoM | On `main` (29 Oct) | Next |
|---|---|---|---|
| 2a | **[TBC from design]** How the drawer shows Do Not Disturb when it has several rules. | **Code has an answer:** one rule per line, the time zone once at the end (`fmtDnd`), for example BC-0006 *October Customer Campaign*. Figma draws one line. | Design confirms the layout, then Figma. |
| 2b-i | **[Update]** Direct recipient becomes SMS and Email. | **Done:** CIS ID / Email / SMS (PR #62, 28 Oct). | Figma. |
| 2b-ii | **[Update]** Upload one file at a time; more than one at once is not allowed. Remove "and 1,000 recipients" from the hint. | **Not done.** The audience zone silently keeps the first of several files (`pick` reads `list[0]`). The hint still reads *CSV or XLSX, up to 10 MB and 1,000 recipients*. | Same one-file rule and inline error as Import (1a). Hint: *CSV or XLSX, up to 10 MB*. Only the hint changes: the 1,000-recipient limit stays, and Submit still blocks a file over 1,000 rows (`MAX_RECIPIENTS`; requester, 29 Oct 2026). |
| 2b-iii | **[Update]** The message field titles carry no language. | **Done:** *(TH)* dropped (PR #63, 28 Oct). | Figma. |
| 2b-iv | **[TBC from BA]** Dynamic field, three options. | **Answered 30 Oct 2026** by the BA & Dev feedback deck: Option 2 + 3, open with `$`, format `${dynamicField}`. Built as Idea 2.2 + Idea 4 on `update/dynamic-field-dollar`; the Concept panel's Design direction and `?df=` are gone. Was: **Open.** The requester (29 Oct) narrows the choice to **pills** or a **text editor**. The Concept panel (`?df=`) holds every draft: pills (Idea 1 / 1.2, overflow options PR #57), button and menu (Idea 2 / 2.2, search pop-up PR #53), dialog (Idea 3 / 3.2), shortcut (Idea 4). | Wait for the BA. Then keep one concept, delete the others and `src/prototype/dynamic-field.ts`, and draw it in Figma. |
| 2c-i | **[Update]** Remove the End date section from Step 3. | **Not done.** End date and time is still on Schedule delivery. Broadcast End also runs through the confirm dialog, the drawer (*Broadcast end* row, the ended note), the Not sent reason *Broadcast ended*, preset `#/broadcast/create/end` and Delivery rules. | Remove End everywhere. Reverses the BA's Q2 answer (14 Oct). |
| 2c-ii | **[ADD]** A quiet period that crosses midnight (20:00–08:00) shows *Next day* after the end time. | **Done** (PR #61, 28 Oct). | Figma. |
| 2c-iii | When the rules together leave no time to send: the user cannot Submit (the BA asks design: disable Submit, or let it be pressed and warn each time); a warning says the rules stop the broadcast and must be fixed; once fixed, Submit works as normal. | **Partly.** Do Not Disturb that covers every day, all day warns, on the DND card or in the confirm dialog (`?dndw=`, PR #64), but Submit still goes ahead (requester, 28 Oct). | Block the submit. **Submit is never disabled** (requester, 29 Oct 2026): pressing it shows the errors, like every other Create error; the page scrolls to the DND card and the alert turns Negative. The Caution alert can stay while editing. Then drop the `?dndw=` switch. With End removed, Do Not Disturb is the only rule that can stop a send. |

### Broadcast job lifecycle (BA, 29 Oct 2026)

Sent by the BA after the MoM as a one-page diagram, *Broadcast Job Lifecycle*. It replaces the 28 Oct reading of Processing and Published.

| Status | BA, 29 Oct | Prototype on `main` (28 Oct reading) |
|---|---|---|
| DRAFT | Saved as a draft. Nothing is processed. | Same. |
| QUEUED | The system has taken the job into its queue. It waits to start. The value is **QUEUED** (requester, 29 Oct 2026). | Same meaning, but the value reads **Queue** (list of values, 16 Oct). |
| PROCESSING | The system reads the file, validates it and processes each row. The Delivery result shows Success / Failed / Waiting to send while it runs, and refreshes when the user opens the broadcast or presses refresh. | Validating only. Nothing is sent, no Delivery result, no report. |
| ERROR | Validation fails in Processing, or an error stops the job in Processing. The status reads **Error**, renamed from Failed (requester, 29 Oct 2026). | The value is FAILED; the badge and the Status filter already read **Error** (28 Oct). Not reached from a failed validation. |
| PUBLISHED | The job has finished processing. **Published does not mean every message row was sent successfully.** The report is generated only now: **Download report** is offered in Published only, and only once the report is ready, not as soon as the status turns Published (requester, 29 Oct 2026). | Validated; sending, the quiet-period pause and finished all sit here. Download report is offered at once. |

How each message row goes out while the job is Processing:

- **Immediately:** each row is sent as soon as it is processed.
- **Scheduled / Broadcast DND:** before sending, each row is checked against the send time and the quiet hours.

**Cancel:** a broadcast in **DRAFT** or **QUEUED** can be cancelled (was Draft only, as a system limit).

To change in the prototype (not built yet):

- Processing gets the Delivery result back, with a refresh. Sending and the quiet-period pause move from Published to Processing: BC-0004 (inside the quiet period) and the sending fixtures go back to Processing. Published is the finished job, with its report.
- ~~The Queue drawer gets **Cancel broadcast** with the same confirm dialog as the Draft.~~ Built (PR #70, 29 Oct 2026): Cancel only, no Edit, the dialog's safe answer reads *Keep broadcast*. Cancelled now means a draft or a queued broadcast, cancelled before processing.
- The status value becomes **QUEUED** (was Queue): badge, Status filter, fixtures and docs. FAILED becomes **ERROR** as a value too, if the rename covers more than the label (the badge already reads Error).
- Published gets a report-generating state: no Download report (list row and drawer) until the report is ready. Copy for that state is not given yet.
- A failed validation in Processing ends in Error.

Answered by the requester on 29 Oct 2026: Download report in Published only, once the report is generated; a failed validation and an error in Processing are both **Error**; the value is **QUEUED**. Still open: what Published shows while the report is generating, and how long it takes.

## Open items

- **Broadcast:** Q3, Q4, Q6, Q7, Q8, Q9, Q10, Q11 (TBC), Q12, Q15 (wrong recipient column, PROPOSAL), Q19 (time zone), Q16 (a file Submit cannot use, PROPOSAL), Q17 and Q18. Q13 is answered; its composed copy waits for the BA. See [broadcast-gaps.md](broadcast-gaps.md).
- **Broadcast status lifecycle:** answered on 29 Oct 2026 (*Broadcast job lifecycle* above). Not built yet. Still open: what Published shows while its report is generating.
- **Import:** P2-1…P2-9 (schema, size limits, duplicates, copy). Since 15 Oct the prototype answers three of them for demo, pending the BA: one file, 10 MB, and import over a file with the same name. Still to ask: duplicates by name or by content, and what happens to replaced templates that were edited or Published.
- **From the BA's MoM (29 Oct 2026):** the dynamic field, pills or a text editor (BA); which Import wait direction (A–D) carries an import's status and result (all four are mocked). Answered 29 Oct: the 1,000-recipient limit stays (hint only); Submit is never disabled. Status per item: [BA MoM, 29 Oct 2026](#ba-mom-29-oct-2026-what-is-built).
- **Broadcast edit after Draft:** P2-20.
- **Phase 1 fields vs the kick-off deck:** Template Ref Code, Notification Source Code, status names.

## Working in this repo

- Routes, commands and design system rules: [../CLAUDE.md](../CLAUDE.md). Every state has its own hash route.
  - Broadcast presets are under `#/broadcast/create/<preset>`. They include `dnd-rules` and `end`, and Submit's file read: `checking`, `confirm-invalid`, `file-blocked`, `check-fail`, `wrong-column`.
- **Copy:** transcribed from the original build. Copy written here is listed in the decision log of [broadcast-gaps.md](broadcast-gaps.md).
- **Components:** webds first, then CMS ([cms-components.md](cms-components.md)), then hand-built. A hand-built control is a webds gap and is recorded as one.
