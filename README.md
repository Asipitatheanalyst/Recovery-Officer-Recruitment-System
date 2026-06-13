# Recovery Officer Recruitment Automation System

![Status](https://img.shields.io/badge/Status-Production--Deployed-brightgreen)
![Tools](https://img.shields.io/badge/Tools-Google%20Apps%20Script%20%7C%20Sheets%20%7C%20Forms%20%7C%20Gmail-blue)
![Type](https://img.shields.io/badge/Type-Live%20HR%20Automation-orange)

> ⚡ This is not a simulated project. This system was built and deployed in a live hiring campaign at a Nigerian financial services company, processing real candidates and sending real emails.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Business Problem](#-business-problem)
- [Data Sources](#-data-sources)
- [System Architecture](#-system-architecture)
- [Stage 1 — Application Intake](#-stage-1--application-intake-google-forms)
- [Stage 2 — Interview Invite Automation](#-stage-2--interview-invite-automation)
- [Stage 3 — Offer Letter Automation](#-stage-3--offer-letter-automation)
- [Key Scripts & Logic](#-key-scripts--logic)
- [Pipeline Tracker & Dashboard](#-pipeline-tracker--dashboard)
- [Results & Time Saved](#-results--time-saved)
- [Tools Used](#-tools-used)
- [Lessons Learned & V2 Improvements](#-lessons-learned--v2-improvements)
- [Limitations](#-limitations)
- [Project Deliverables](#-project-deliverables)

---

## 📌 Project Overview

This project is a **fully automated recruitment pipeline** built using Google Workspace tools and Google Apps Script. It was designed to manage a mass hiring campaign for the **Recovery Officer** role across **8 Nigerian states**.

The system handles the entire candidate journey — from application intake through to offer letter delivery — with minimal manual intervention. Two custom Apps Script functions replaced what would have been days of repetitive admin work.

---

## 📌 Business Problem

The organisation needed to hire Recovery Officers across **8 Nigerian states** within a tight hiring window. The existing process was entirely manual:

| Pain Point | Impact |
|---|---|
| Applications collected via WhatsApp and email | Unstructured data, hard to track |
| Interview invites typed and sent individually | Hours of repetitive work per cohort |
| Time slots assigned by hand | Risk of double-booking across interviewers |
| Offer letters copy-pasted per candidate | Inconsistent formatting, missed Finance CC |
| No central tracker | No visibility into pipeline status |
| No audit trail | No record of who was contacted or when |

With **176 applicants** across 8 states, doing this manually would have taken an estimated **10+ hours of admin time**. The system reduced that to under 30 minutes of total human effort.

---

## 📌 Data Sources

This is a **live production project**. Data was generated through:

- **Google Form** — candidate self-submission (name, phone, address, state, qualification, experience, CV upload)
- **Google Drive** — automatic CV storage from form submissions
- **Google Sheets** — central candidate database, interview schedule, shortlist tracker
- **Gmail logs** — email send confirmations with timestamps

> 📁 The sample data in this repository has been fully anonymised. All names, emails, and phone numbers have been replaced with generated data. Operational columns (status, timestamps, slot assignments) reflect the real system structure.

---

## 📌 System Architecture

The pipeline runs across three stages, all connected inside Google Workspace:
Google Form (Applications)

│

▼

Google Sheets — Form Responses Sheet (Candidate Database)

│

▼

[Manual Shortlisting Review]

│

▼

Apps Script — Interview Invite Sender

│   → Auto-calculates time slots

│   → Sends personalised Gmail invites

│   → Logs send timestamp per row

▼

Google Sheets — Interview Schedule Sheet

│

▼

[Interview Conducted via Google Meet]

│

▼

[Offer Decision]

│

▼

Apps Script — Offer Letter Sender

│   → Sends branded HTML offer letter

│   → CC's Finance automatically

│   → Logs "Sent" status per row

▼

Google Sheets — Shortlisted Candidates Sheet

---

## 📌 Stage 1 — Application Intake (Google Forms)

A structured Google Form collected the following from each applicant:

| Field | Type |
|---|---|
| Full Name | Short text |
| Phone Number | Short text |
| Residential Address | Long text |
| State | Dropdown |
| Local Area | Short text |
| Educational Qualification | Dropdown |
| Years of Experience | Short text |
| Field Recovery Experience | Yes / No |
| Availability to Resume | Yes / No |
| CV Upload | File upload (stored to Drive) |

All responses flowed automatically into the **Form Responses** sheet in Google Sheets, creating a live searchable candidate database from the moment the form went live.

**Application form:** Built with Google Forms — 10 structured fields, CV upload to Google Drive.

### Screenshot — Application Form

![Google Form](https://github.com/user-attachments/assets/f0f4d2a0-82e2-4402-8f1c-4cd26e6f8ced)

---

## 📌 Stage 2 — Interview Invite Automation

**Script:** [`interview-invite-sender.gs`](scripts/interview-invite-sender.gs)

Once candidates were shortlisted, a single function run handled the entire invite process for **176 candidates** across 8 states.

### What the script does — step by step:

**1. Reads the schedule sheet**
Pulls candidate name and email from each row of the Interview Schedule sheet.

**2. Auto-calculates time slots**
Starting from a configured start time (e.g. 10:00 AM), it calculates a unique 10-minute slot per candidate — no manual slot entry required.

```javascript
const totalMinutes = START_HOUR * 60 + START_MIN + slotIndex * SLOT_MINS;
const startH = Math.floor(totalMinutes / 60);
const startM = totalMinutes % 60;
```

**3. Detects and skips duplicates**
Uses a `Set()` to track processed emails. Duplicate entries are flagged in the sheet rather than sent twice.

```javascript
if (seen.has(email)) {
  sheet.getRange(i + 1, COL.emailSent + 1).setValue("DUPLICATE - Skipped");
  continue;
}
seen.add(email);
```

**4. Sends personalised email via Gmail**
Each candidate receives a personalised email with their name, assigned time slot, interview date, and Google Meet link.

**5. Logs result back to sheet**
Every row is updated with either:
- `YES - [timestamp]` — confirming successful send
- `ERROR: [message]` — capturing failures visibly

**6. Rate limit control**
A 1.5-second pause between sends (`Utilities.sleep(1500)`) prevents Gmail quota errors.

### Screenshot — Interview Schedule Sheet with Send Logs

![Interview Schedule](https://github.com/user-attachments/assets/2ae54427-2d64-4db3-a38a-66d095facc70)

### Screenshot — Sample Invite Email Received by Candidate

![Email Sent Timestamps](https://github.com/user-attachments/assets/a2edec93-61c0-4caf-947c-49ae98891d05)

---

## 📌 Stage 3 — Offer Letter Automation

**Script:** [`offer-letter-sender.gs`](scripts/offer-letter-sender.gs)

For candidates who passed the interview, a single function run sent fully branded HTML offer letters to all **75+ shortlisted candidates**.

### What the script does:

- Reads name and email from the **OFFER LETTER** sheet
- Skips rows already marked **"Sent"** — safe to re-run without duplicating
- Sends a **styled HTML email** containing:
  - Personalised first-name greeting
  - Full contract terms (role, salary, commission, tax note, working days)
  - Downloadable NDA and Employee Information Form links (Google Drive)
  - WhatsApp group join link for onboarding
  - Document submission deadline
- **Automatically CC's Finance** on every email — no manual step needed
- Writes **"Sent"** or **"Failed: [error]"** back to the sheet per row

### Key skip logic:
```javascript
// Skip rows already sent — prevents duplicate offers on re-run
if (data[i][3] === "Sent") continue;
```

---

## 📌 Key Scripts & Logic

| Script | Function | Lines of Code |
|---|---|---|
| `interview-invite-sender.gs` | Slot calculation, invite sending, duplicate guard, timestamp logging | ~90 |
| `offer-letter-sender.gs` | HTML offer letter, Finance CC, skip logic, status logging | ~120 |

### Key technical patterns used:

**Dynamic column mapping** — scripts read column positions by header name, not hardcoded index. Safe against column reordering.
```javascript
const COL = {
  name:  headers.indexOf("NAME"),
  email: headers.indexOf("EMAIL ADDRESS"),
};
```

**Auto-slot calculation** — no manual time entry. Slots increment automatically per candidate.

**HTML email composition** — offer letters use inline CSS for Gmail-compatible styling across devices.

**Error isolation** — each row is try/catch wrapped. One failed send does not stop the rest of the batch.

---

## 📌 Pipeline Tracker & Dashboard

The anonymised sample workbook contains four sheets reflecting the real system structure:

| Sheet | Purpose |
|---|---|
| **Pipeline Summary** | Case study metrics — totals, automation stats, time saved |
| **Form Responses** | Full candidate database with status and invite columns |
| **Interview Schedule** | Auto-assigned slots, Meet links, send timestamps |
| **Shortlisted Candidates** | Final pipeline stage with employment status |

**→** [`/sample-data/RO_Recruitment_Anonymized_Portfolio.xlsx`](sample-data/RO_Recruitment_Anonymized_Portfolio.xlsx)

---

## 📌 Results & Time Saved

| Metric | Value |
|---|---|
| Total applications processed | 176 |
| Nigerian states covered | 8 |
| Candidates invited to interview | 176 |
| Offer letters sent via script | 75+ |
| Time to send all interview invites | < 5 minutes |
| Estimated manual time for same task | ~8–10 hours |
| Double-bookings across interviewers | 0 |
| Finance automatically CC'd on offers | ✅ Yes — every email |
| Full audit trail (timestamps per send) | ✅ Yes — per row |

### Time Saved Breakdown

| Task | Manual Time (est.) | Automated Time | Saved |
|---|---|---|---|
| Interview invite sending | ~8 hrs | < 5 mins | ~8 hrs |
| Slot assignment | ~2 hrs | 0 (auto) | ~2 hrs |
| Offer letter sending + Finance CC | ~6 hrs | < 10 mins | ~6 hrs |
| **Total** | **~16 hrs** | **< 15 mins** | **~16 hrs** |

---

## 📌 Tools Used

| Tool | Role in This Project |
|---|---|
| **Google Forms** | Structured application intake, CV file collection |
| **Google Sheets** | Candidate database, schedule management, status tracking |
| **Google Apps Script** | Core automation engine — email sending, slot logic, logging |
| **Gmail (GmailApp API)** | Email delivery for invites and offer letters |
| **Google Drive** | CV storage, NDA and onboarding document hosting |
| **Google Meet** | Video interview platform — links assigned per interviewer |

> 💡 **No paid tools. No third-party platforms. Built entirely within Google Workspace.**

---

## 📌 Lessons Learned & V2 Improvements

| Issue Encountered | Root Cause | V2 Fix |
|---|---|---|
| Inconsistent experience field data ("Nil", "2019", "Teamwork") | Free-text input | Replace with dropdown: 0–1 / 1–3 / 3–5 / 5+ years |
| Missing and invalid email addresses | No form validation | Make email required; add format validation |
| Duplicate submissions | No deduplication on intake | Apps Script trigger to flag duplicates on form submit |
| Notes stored inside name cells | Ad hoc workaround during processing | Add dedicated Notes/Flag column from the start |
| Single invite batch per campaign | System not designed for multi-round tracking | Add invite round number and resend tracking columns |

---

## 📌 Limitations

- Manual shortlisting step required between Stage 1 and Stage 2
- No automated CV parsing or AI scoring (manual review of CVs)
- Google Forms does not prevent duplicate submissions natively
- Gmail daily send limit applies (~100–500 emails/day for standard accounts)
- No two-way communication tracking (candidate replies not logged automatically)

---

## 📌 Project Deliverables

| Deliverable | Location |
|---|---|
| Interview invite automation script | [`/scripts/interview-invite-sender.gs`](scripts/interview-invite-sender.gs) |
| Offer letter automation script | [`/scripts/offer-letter-sender.gs`](scripts/offer-letter-sender.gs) |
| Anonymised pipeline dataset | [`/sample-data/RO_Recruitment_Anonymized_Portfolio.xlsx`](sample-data/RO_Recruitment_Anonymized_Portfolio.xlsx) |

---

## 👤 About

**Mary Olurinola**
HR Operations | AI & Automation Consultant
Building automated HR and business systems for African SMEs.

🔗 [LinkedIn](https://www.linkedin.com/in/mary-olurinola)
📧 olurinolamary1@gmail.com

---

*All personal data in the sample files has been fully anonymised for public sharing. Company-specific links have been replaced with placeholders in the published scripts.*
