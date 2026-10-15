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
| 14 Oct 2026 | BA feedback on the prototype, and BA answers to Q1, Q2 and Q5 | List columns, report download, 5-minute steps, several DND periods, Broadcast End, Direct recipient stays, DND rather than Service Window |
| 12 Oct 2026 | Requester's call | File upload uses the CMS prototype's upload slots |
| 12 Oct 2026 | This repo starts | Rebuild of Korn's prototype on webds |
| 6 Oct 2026 | Korn, from the BA's AI draft | Broadcast as a one-page, six-step Create form; Draft and Edit |
| 5–6 Oct 2026 | Korn, from the PO's written requirement | Import rulings (below); `.jsonl` format since 6 Oct |
| undated | BA deck *Broadcast Message* (internal alignment, 6 pages) | Broadcast concept, scenarios, master recipient file |
| May 2026 | Kick-off deck *Template Management: Business Journey for UX/UI Kick-off* | Phase 1 scope and template fields |

Where the sources live:

- **Original prototype:** https://cnh-tm-phase2.vercel.app. The mirrored build is in `.reference/`.
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
| File format | `.jsonl` (JSON Lines): one template per line. It is the same format the list downloads, so a downloaded file imports back. |
| Files per import | One or many. At most 50; the rest are left out with a message. Sized for 10–50 files. |
| When a file is checked | As soon as it is picked. Files in error sort to the top. One action removes all of them. |
| Blocking | Any file in error blocks Import until it is removed. |
| Required per line | `recordType: "TEMPLATE"`, `templateName`, `description`, `serviceCodes` (from the value list), `channels` (PUSH, EMAIL, SMS) and `templateLanguages`. |
| Result | Every imported template is a **Draft**. Imports land on page 1 in the order the files were picked; the list sorts by Last updated, newest first. |
| States | Initial; no file; invalid format; invalid structure; files selected; uploading (covers the whole dialog); failure with Import again; success (back on the list, toast for 3 s). |
| Upload UI | CMS upload slots: `UploadZone` and `UploadedFile`, one column that scrolls, with **Preview** (`FilePreviewDialog`). |

Still open from the original build (P2-1…P2-9): the schema, size limits, duplicates, and all copy.

## Feature 2: Broadcast message

### What it is

A one-to-many send: the same notification to many recipients, from an uploaded audience file.

- **Tracked:** whether each message could be sent, how many succeeded and how many failed.
- **Not tracked:** whether the recipient opened or read it.

### Screens

- **List** (`#/broadcast`): Broadcast name, Channel, Broadcast start, Do Not Disturb, Status. Recipients and Result were removed on 14 Oct and live in the drawer.
- **Detail drawer**, 720 wide:
  - Delivery result: Total, Success, Failed, Not sent (only when there is any) and Waiting to send, with a status note.
  - **Download report** in the Delivery result head.
  - Broadcast details: description, audience file, recipient type, start, end, Do Not Disturb.
  - One section per channel.
  - **Edit** on a Draft only.
- **Create and Edit broadcast:** one page with six steps, a sticky footer with **Save draft** and **Submit**, then a confirm dialog.

### Create: the three steps

Layout and step copy follow draft 2.2 webds-matched ([Figma 85:19401](https://www.figma.com/design/u2fZplMakSiBhP7H4shMeV/-CNH-Phase-2--Broadcast-Message?node-id=85-19401), 15 Oct 2026). The draft numbers its steps 1, 2, 5, 6; the build numbers them 1–3, with Do Not Disturb inside Delivery Date (Figma 89:4665).

1. **Basic information.** One card, "General information": Broadcast name\* (max 100) above Description (max 250).
2. **Validate Audience file.** Two cards.
   - "Upload Audience file":
     - Select Recipient type\*: **CIS** (CIS ID column; any of Push, Email, SMS) or **Direct recipient** (a mobile or email column; Email *or* SMS only), as plain radios side by side.
     - Upload File\* beside the ID column. The file is `.csv` or `.xlsx`, at most 10 MB and 1,000 recipients. After upload: a preview of the whole file in a box five rows tall at the column's width, scrolling both ways under a fixed header, with the file's size beside its title ("100 Rows • 25 Columns", Figma 89:4665); a valid / invalid count; and a table of invalid rows. Preset `#/broadcast/create/large-file` loads 100 rows × 25 columns. Invalid rows are skipped. Two sample files.
     - The ID column is chosen from the file's headers. The BA confirmed on 14 Oct that Direct recipient stays.
   - Message content: the file's columns as chips that insert `{{COLUMN}}` into the box the cursor was last in, over one card per channel, three across.
     - Each card is switched on and off in its own title row. The switches replace the channel checkboxes and Direct recipient's Email / SMS radio. Under Direct recipient, switching one on switches the other off. A card that is off keeps what was typed and disables it.
     - Fields are the Template form's TH fields: Push title (TH)\* (255) and Push message (TH)\* (2048); Email subject (TH)\* (255) and Email content (TH)\* (2048); SMS message (TH)\* (800).
     - No channel on: an Alert above the cards and a red stroke on each card.
3. **Delivery Date.** One card, "Select Delivery Date", that also holds Do Not Disturb ([Figma 89:4665](https://www.figma.com/design/u2fZplMakSiBhP7H4shMeV/-CNH-Phase-2--Broadcast-Message?node-id=89-4665), 15 Oct 2026):
   - **Send as soon as possible**, or **Schedule delivery** with Start date and time\* (5-minute steps, later than now).
   - Optional **End date and time**, later than the start, with Clear, **for Schedule delivery only**. Send as soon as possible has no end (requester, 15 Oct, following the draft; the BA's Q2 answer on 14 Oct did not say which modes). End sits on the left and Start on the right (the requester kept it on 15 Oct).
   - **Select DND** ("Prevent sending messages during quiet hours."): the Do Not Disturb (DND) switch, then any number of quiet periods, one row each: days, hours (5-minute steps) or **All day**, and a trash when there are two or more. **Add period** under the periods. The one time zone, Asia/Bangkok (GMT+7), shows as text.

### Delivery rules

- **Do Not Disturb, not Service Window** (BA, 14 Oct).
  - Sending pauses inside any quiet period and resumes when it ends.
  - A start that falls inside a quiet period moves to the period's end.
  - Periods that touch chain together, for example Friday night into an all-day weekend.
  - Overlapping periods are allowed.
- **Overnight periods** belong to the day they start. Whether Monday 00:00–08:00 should also be quiet is **TBC** (Q11).
- **Broadcast End** (BA, 14 Oct):
  - At the end, sending stops. Recipients left are counted as **Not sent**, and the broadcast still ends **Completed**.
  - There is no Expired status.
  - The end does not appear in the list.
- **Status on submit:** **Sending** if it is sent now and not inside a quiet period, otherwise **Scheduled**.
- **Statuses:** Draft, Scheduled, Sending, Paused (inside a quiet period), Completed.
- **Edit:** a Draft reopens in Edit and saves under the same ID. Scheduled and later cannot be edited (P2-20).
- **Delivery report:** a CSV, `{id}-delivery-report.csv`, with one row per recipient: ID, Channel, Result (Success, Failed, Not sent, Waiting to send) and Reason.
  - Offered once anything was attempted.
  - In the prototype the rows are mock data built from the counts.

### Recipient file (from the BA deck; not every rule is in the prototype)

- One row per recipient (CIS).
- Columns: CIS ID\*, Mobile number, Email address, First name, Last name, Tier.
- **Prototype checks:** ID required; mobile and email well formed; no duplicate IDs.
- **Deck checks the prototype does not:** at least one contact method per row; no duplicate mobile or email in the file; data "valid and active". This is Q7.
- **Push:** finds device tokens from CIS ID.

## BA rulings log

| Date | Ruling |
|---|---|
| 14 Oct 2026 | Remove Recipients and Result from the broadcast list; the drawer shows them. |
| 14 Oct 2026 | Add a download to the drawer, built as the Delivery report. |
| 14 Oct 2026 | Times in 5-minute steps, for Start and for DND. |
| 14 Oct 2026 | DND can hold several quiet periods that the user adds; All day per period. |
| 14 Oct 2026 | Broadcast message uses DND, not Service Window (Q1). |
| 14 Oct 2026 | Broadcast End goes into the prototype: optional, Not sent, still Completed (Q2). |
| 14 Oct 2026 | Direct recipient stays; the ID column is chosen from the file (Q5). |
| 14 Oct 2026 | Overnight DND (Q11): TBC. |
| 15 Oct 2026 | The file preview shows every row and column, five rows tall at the column's width, scrolling both ways (requester). |
| 15 Oct 2026 | Do Not Disturb moves into the Delivery Date step (Figma 89:4665): three steps. |
| 15 Oct 2026 | Broadcast End is for Schedule delivery only; Send as soon as possible has no end (requester, following draft 2.2). |
| 15 Oct 2026 | Create broadcast follows draft 2.2 webds-matched (Figma 85:19401): four steps (three since DND joined Delivery Date); message content under the audience step; channels switched on their own cards; content fields and limits from the Template form's TH fields; End left of Start. See "Create: the three steps". |

## Open items

- **Broadcast:** Q3, Q4, Q6, Q7, Q8, Q9, Q10, Q11 (TBC) and Q12. See [broadcast-gaps.md](broadcast-gaps.md).
- **Import:** P2-1…P2-9 (schema, size limits, duplicates, copy).
- **Broadcast edit after Draft:** P2-20.
- **Phase 1 fields vs the kick-off deck:** Template Ref Code, Notification Source Code, status names.

## Working in this repo

- Routes, commands and design system rules: [../CLAUDE.md](../CLAUDE.md). Every state has its own hash route.
  - Broadcast presets are under `#/broadcast/create/<preset>`. They include `dnd-rules` and `end`.
- **Copy:** transcribed from the original build. Copy written here is listed in the decision log of [broadcast-gaps.md](broadcast-gaps.md).
- **Components:** webds first, then CMS ([cms-components.md](cms-components.md)), then hand-built. A hand-built control is a webds gap and is recorded as one.
