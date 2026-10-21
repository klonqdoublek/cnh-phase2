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
| 21 Oct 2026 | Requirement update | After upload the recipient column starts unselected; the system cannot count rows or columns, so no counts are shown |
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

### Create: the six steps

1. **Basic information.** Broadcast name\* (max 100) and Description (max 250).
2. **Audience file.**
   - `.csv` or `.xlsx`, at most 10 MB and 1,000 recipients.
   - After upload: a 5-row preview and a table of invalid rows. Invalid rows are skipped.
   - No counts. The system cannot count the file's rows or columns, so the file slot, the result and the confirm dialog show no number of recipients, rows, valid or invalid (21 Oct). A file over 1,000 recipients still fails, without a number.
   - Two sample files.
3. **Recipient mapping and channels.**
   - Recipient type **CIS** (CIS ID column; any of Push, Email, SMS) or **Direct recipient** (a mobile or email column; Email *or* SMS only).
   - The ID column is chosen from the file's headers. The BA confirmed on 14 Oct that Direct recipient stays.
   - The system does not pick the column. After upload the select is empty (`Select column`) and the user must choose (21 Oct). Changing the recipient type, or Email ↔ SMS in Direct, empties it again.
   - The header's name does not matter. The field only says which column holds the data, so CIS IDs may sit in a column called `Recipient` (BA meeting recording, reviewed 14 Oct; **to confirm with the BA on 15 Oct**).
4. **Manual content.**
   - The file's columns become chips that insert `{{COLUMN}}`.
   - One card per channel: Push title and message, Email subject and body, SMS message with an SMS segment counter.
5. **Delivery.**
   - **Send as soon as possible**, or **Schedule delivery** with Start date and time\* (5-minute steps, later than now).
   - Optional **End date and time**, later than the start, with Clear.
6. **Do Not Disturb.**
   - On or off.
   - Any number of quiet periods. Each has its days and hours (5-minute steps) or **All day**.
   - One time zone (Asia/Bangkok).
   - **Add period** adds one; a trash removes one when there are two or more.

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
- Columns: CIS ID\*, Mobile number, Email address, First name, Last name, Tier. These names are the deck's example, not required headers (see step 3).
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
| 14 Oct 2026 | From the meeting recording, to confirm with the BA on 15 Oct: the file's headers are free. The Field select says which column holds the recipient data; it does not check the header's name. |
| 21 Oct 2026 | Requirement update: no auto-selected recipient column; the user picks it from an empty select. No row or column counts after upload; the invalid-rows table stays, without a count. |

## Open items

- **Broadcast:** Q3, Q4, Q6, Q7, Q8, Q9, Q10, Q11 (TBC), Q12, Q13 and Q14. See [broadcast-gaps.md](broadcast-gaps.md).
- **Import:** P2-1…P2-9 (schema, size limits, duplicates, copy).
- **Broadcast edit after Draft:** P2-20.
- **Phase 1 fields vs the kick-off deck:** Template Ref Code, Notification Source Code, status names.

## Working in this repo

- Routes, commands and design system rules: [../CLAUDE.md](../CLAUDE.md). Every state has its own hash route.
  - Broadcast presets are under `#/broadcast/create/<preset>`. They include `dnd-rules` and `end`.
- **Copy:** transcribed from the original build. Copy written here is listed in the decision log of [broadcast-gaps.md](broadcast-gaps.md).
- **Components:** webds first, then CMS ([cms-components.md](cms-components.md)), then hand-built. A hand-built control is a webds gap and is recorded as one.
