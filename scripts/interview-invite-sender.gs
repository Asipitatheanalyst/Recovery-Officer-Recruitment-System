/**
 * RECOVERY OFFICER RECRUITMENT — Interview Invite Sender
 * -------------------------------------------------------
 * Reads candidates from the "Tuesday Interview Schedule" sheet,
 * auto-calculates a unique 10-minute time slot per candidate,
 * sends a personalised interview invitation via Gmail,
 * and logs the send timestamp back to the sheet.
 *
 * Built for: Credlock Africa HR Operations
 * Tool: Google Apps Script (Google Workspace)
 * Author: Mary [Your Last Name]
 */

function sendTuesdayInterviewEmails() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Tuesday Interview Schedule");

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Sheet "Tuesday Interview Schedule" not found!');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Auto-create "Email Sent" column if it doesn't exist yet
  let emailSentCol = headers.indexOf("Email Sent");
  if (emailSentCol === -1) {
    emailSentCol = headers.length;
    sheet.getRange(1, emailSentCol + 1).setValue("Email Sent");
  }

  // Map column names to their index positions (0-based)
  const COL = {
    name:      headers.indexOf("NAME"),
    email:     headers.indexOf("EMAIL ADDRESS"),
    role:      headers.indexOf("ROLE"),
    startTime: headers.indexOf("START TIME"),
    endTime:   headers.indexOf("END TIME"),
    status:    headers.indexOf("STATUS"),
    meetLink:  headers.indexOf("MEETING LINK"),
    emailSent: emailSentCol,
  };

  // Validate all required columns exist before running
  for (const [key, val] of Object.entries(COL)) {
    if (val === -1) {
      SpreadsheetApp.getUi().alert(`Column not found: "${key}". Check your sheet headers.`);
      return;
    }
  }

  // ── CONFIGURATION — update these values per campaign ──────────────────────
  const INTERVIEW_DATE = "Tuesday, 26th May 2026"; // Display date in email body
  const MEET_LINK      = "https://meet.google.com/xxx-xxxx-xxx"; // Replace with real link
  const START_HOUR     = 10;   // Interview start hour (24h format)
  const START_MIN      = 0;    // Interview start minute
  const SLOT_MINS      = 10;   // Minutes per candidate slot
  const SENDER_NAME    = "HR Team - Credlock Africa";
  // ──────────────────────────────────────────────────────────────────────────

  const seen = new Set(); // Track emails already processed (duplicate guard)
  let slotIndex = 0;      // Slot counter — increments per successful send

  for (let i = 1; i < data.length; i++) {
    const row   = data[i];
    const name  = String(row[COL.name]  || "").trim();
    const email = String(row[COL.email] || "").trim().toLowerCase();

    // Skip rows with no name or email
    if (!name || !email) continue;

    // Skip duplicate emails — log to sheet so it's visible
    if (seen.has(email)) {
      sheet.getRange(i + 1, COL.emailSent + 1).setValue("DUPLICATE - Skipped");
      continue;
    }
    seen.add(email);

    // ── Auto-calculate this candidate's time slot ──────────────────────────
    const totalMinutes = START_HOUR * 60 + START_MIN + slotIndex * SLOT_MINS;
    const startH = Math.floor(totalMinutes / 60);
    const startM = totalMinutes % 60;
    const endH   = Math.floor((totalMinutes + SLOT_MINS) / 60);
    const endM   = (totalMinutes + SLOT_MINS) % 60;

    // Format time as 12-hour with AM/PM
    const fmt = (h, m) => {
      const period   = h >= 12 ? "PM" : "AM";
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
    };

    const startTime = fmt(startH, startM);
    const endTime   = fmt(endH, endM);

    // Capitalise candidate name properly for the email greeting
    const displayName = name.split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    // Write calculated times back to the sheet
    sheet.getRange(i + 1, COL.startTime + 1).setValue(startTime);
    sheet.getRange(i + 1, COL.endTime   + 1).setValue(endTime);

    // ── Compose and send the email ─────────────────────────────────────────
    const subject = `Interview Invitation - Recovery Officer | Credlock Africa`;

    const body =
`Dear ${displayName},

I appreciate your interest in the Recovery Officer role at Credlock Africa.

We are pleased to invite you for an interview scheduled as follows:

Date: ${INTERVIEW_DATE}
Time: ${startTime} - ${endTime} (WAT)
Venue: Google Meet

Please join the interview using the link below:
${MEET_LINK}

Kindly ensure you join a few minutes before your scheduled time and have a stable internet connection.

We look forward to speaking with you.

Best regards,
HR Team
Credlock Africa`;

    try {
      GmailApp.sendEmail(email, subject, body, { name: SENDER_NAME });

      // Log successful send with timestamp
      sheet.getRange(i + 1, COL.status    + 1).setValue("Invited");
      sheet.getRange(i + 1, COL.emailSent + 1).setValue("YES - " + new Date().toLocaleString());

      Logger.log(`Sent to ${displayName} <${email}> | ${startTime} - ${endTime}`);
      slotIndex++;

      // Pause between sends to respect Gmail rate limits
      Utilities.sleep(1500);

    } catch (e) {
      // Log failure to sheet — no candidate is silently missed
      sheet.getRange(i + 1, COL.emailSent + 1).setValue("ERROR: " + e.message);
      Logger.log(`Failed for ${name}: ${e.message}`);
    }
  }

  SpreadsheetApp.getUi().alert(`Done! Emails sent to ${slotIndex} candidates.`);
}
