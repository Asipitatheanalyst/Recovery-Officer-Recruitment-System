/**
 * RECOVERY OFFICER RECRUITMENT — Offer Letter Sender
 * ----------------------------------------------------
 * Reads shortlisted candidates from the "OFFER LETTER 3" sheet,
 * sends a fully branded HTML offer letter via Gmail,
 * CC's the Finance department automatically,
 * and logs the send status back to the sheet.
 *
 * Features:
 * - Personalised greeting using candidate first name
 * - Full contract terms embedded in a styled HTML email
 * - Downloadable NDA and Employee Information Form links
 * - WhatsApp onboarding group link
 * - Automatic Finance CC on every email
 * - Skip logic — already-sent rows are not re-processed
 * - Error logging per row — failures are visible in the sheet
 *
 * Built for: Credlock Africa HR Operations
 * Tool: Google Apps Script (Google Workspace)
 * Author: Mary [Your Last Name]
 */

function sendOfferLetters() {
  const sheet     = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("OFFER LETTER 3");
  const data      = sheet.getDataRange().getValues();

  // ── CONFIGURATION — update these per campaign ─────────────────────────────
  const CC_EMAIL   = "finance@[company-domain].com";     // Finance CC address
  const SUBJECT    = "Contract Appointment Offer – Recovery Officer Role";
  const SENDER     = "Credlock Africa HR";
  const STATUS_COL = 4;  // Column index (1-based) where send status is written

  // Document links (replace with current campaign links)
  const NDA_LINK  = "https://drive.google.com/file/d/[FILE_ID]/view?usp=sharing";
  const EIF_LINK  = "https://drive.google.com/file/d/[FILE_ID]/view?usp=sharing";
  const WA_LINK   = "https://chat.whatsapp.com/[GROUP_INVITE_CODE]";

  // Contract terms
  const START_DATE    = "Monday, June 15, 2026";
  const END_DATE      = "Monday, September 14, 2026";
  const DOC_DEADLINE  = "Friday, June 5, 2026";
  const SALARY        = "₦50,000";
  const LOGISTICS     = "₦20,000 for the entire three-month contract period";
  const COMMISSION    = "10% of the total amount recovered weekly";
  // ──────────────────────────────────────────────────────────────────────────

  for (let i = 1; i < data.length; i++) {
    const name  = data[i][0];
    const email = data[i][1];

    // Skip empty rows
    if (!name || !email) continue;

    // Skip candidates already sent — prevents duplicate sends on re-runs
    if (data[i][3] === "Sent") continue;

    const firstName = name.trim().split(" ")[0];

    // ── HTML email body ────────────────────────────────────────────────────
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; color: #222222; line-height: 1.7; margin: 0; padding: 0; background-color: #f4f4f4; }
    .wrapper { max-width: 700px; margin: 30px auto; background: #ffffff; border: 1px solid #dddddd; border-radius: 6px; overflow: hidden; }
    .header { background-color: #003366; color: #ffffff; padding: 24px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; letter-spacing: 1px; }
    .header p { margin: 4px 0 0; font-size: 13px; color: #cce0ff; }
    .content { padding: 32px; }
    h2 { font-size: 15px; color: #003366; border-bottom: 2px solid #003366; padding-bottom: 4px; margin-top: 28px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
    table th { background-color: #003366; color: #ffffff; text-align: left; padding: 9px 12px; }
    table td { padding: 9px 12px; border: 1px solid #dddddd; }
    table tr:nth-child(even) td { background-color: #f9f9f9; }
    .highlight-box { background-color: #eef4ff; border-left: 4px solid #003366; padding: 12px 16px; margin: 14px 0; }
    .link-box { background-color: #f0f7ff; border: 1px solid #b3d1ff; border-radius: 4px; padding: 12px 16px; margin: 8px 0; word-break: break-all; }
    .link-box a { color: #003366; text-decoration: underline; }
    .whatsapp-box { background-color: #e8f5e9; border: 1px solid #a5d6a7; border-left: 4px solid #25D366; border-radius: 4px; padding: 14px 16px; margin: 14px 0; }
    .whatsapp-box a { color: #1a7a3e; font-weight: bold; text-decoration: underline; }
    ul li { margin-bottom: 6px; }
    .footer { background-color: #f4f4f4; border-top: 1px solid #dddddd; padding: 20px 32px; font-size: 13px; color: #666666; }
    .footer strong { color: #003366; }
    .congrats { font-size: 15px; color: #003366; font-weight: bold; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>CREDLOCK AFRICA</h1>
      <p>Contract Appointment Offer – Recovery Officer Role</p>
    </div>
    <div class="content">
      <p>Dear <strong>${firstName}</strong>,</p>
      <p>We are pleased to offer you a <strong>Contract Appointment</strong> as a <strong>Recovery Officer</strong> with <strong>Credlock Africa</strong>, subject to the terms and conditions stated below.</p>

      <h2>Position</h2>
      <table>
        <tr><th>Item</th><th>Details</th></tr>
        <tr><td>Job Title</td><td>Recovery Officer</td></tr>
        <tr><td>Employment Type</td><td>Fixed-Term Contract</td></tr>
        <tr><td>Contract Duration</td><td>Three (3) Months</td></tr>
      </table>

      <h2>Contract Period</h2>
      <p>Your contract commences on <strong>${START_DATE}</strong> and terminates on <strong>${END_DATE}</strong>, unless extended or terminated earlier in line with company policies.</p>

      <h2>Compensation &amp; Benefits</h2>
      <table>
        <tr><th>Benefit</th><th>Details</th></tr>
        <tr><td>Monthly Salary</td><td>${SALARY}</td></tr>
        <tr><td>Payment Schedule</td><td>Paid monthly per payroll schedule</td></tr>
        <tr><td>Logistics Allowance</td><td>${LOGISTICS}</td></tr>
        <tr><td>Weekly Commission</td><td>${COMMISSION}</td></tr>
      </table>
      <div class="highlight-box">
        <strong>Tax Deduction:</strong> A 5% Withholding Tax (WHT) shall be deducted from all commission payments in accordance with applicable tax regulations.<br><br>
        <strong>Working Days:</strong> Monday to Saturday (or as otherwise required by operational needs).
      </div>

      <h2>Expectations</h2>
      <ul>
        <li>Maintain professionalism in all customer interactions.</li>
        <li>Uphold the confidentiality of company information.</li>
        <li>Meet assigned recovery targets.</li>
        <li>Comply with company policies, procedures, and guidelines.</li>
      </ul>

      <h2>Acceptance of Offer</h2>
      <p>Kindly signify your acceptance by <strong>replying to this email</strong> with your confirmation.</p>

      <h2>Onboarding Documents</h2>
      <p>Download, complete, sign, and return the documents below on or before <strong>${DOC_DEADLINE}</strong>.</p>
      <p><strong>NDA Document:</strong></p>
      <div class="link-box"><a href="${NDA_LINK}">Click here to download NDA Document</a></div>
      <p><strong>Employee Information Form:</strong></p>
      <div class="link-box"><a href="${EIF_LINK}">Click here to download Employee Information Form</a></div>
      <p style="color:#cc0000; font-size:13px;">Failure to submit signed documents by the deadline may be considered a decline of this offer.</p>

      <h2>Join the Team WhatsApp Group</h2>
      <p>After returning your signed documents, join our official Recovery Officers WhatsApp group below. Joining confirms your acceptance.</p>
      <div class="whatsapp-box">📲 <a href="${WA_LINK}">Click here to join the Credlock Africa Recovery Officers WhatsApp Group</a></div>

      <p>We look forward to having you on the team.</p>
      <p class="congrats">Congratulations and welcome aboard! 🎉</p>
    </div>
    <div class="footer">
      <p>Best regards,<br><strong>HR Department</strong><br><strong>Credlock Africa</strong></p>
    </div>
  </div>
</body>
</html>`;

    try {
      GmailApp.sendEmail(email, SUBJECT, "", {
        htmlBody: htmlBody,
        cc:       CC_EMAIL,
        name:     SENDER
      });

      // Mark as Sent in the sheet
      sheet.getRange(i + 1, STATUS_COL).setValue("Sent");
      SpreadsheetApp.flush();
      Logger.log("Sent to: " + email);

    } catch (e) {
      // Log failure with error message — visible in sheet
      sheet.getRange(i + 1, STATUS_COL).setValue("Failed: " + e.message);
      Logger.log("Failed for " + email + ": " + e.message);
    }

    // Pause between sends to respect Gmail rate limits
    Utilities.sleep(1500);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast("✅ All offer emails processed.", "Done", 5);
}
