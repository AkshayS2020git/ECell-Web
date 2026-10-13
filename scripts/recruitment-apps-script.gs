/**
 * ECell recruitment: Google Apps Script backend for the /recruit page.
 *
 * The site's server action (app/recruit/actions.ts) POSTs each validated
 * application here as JSON. This script writes it to two places:
 *  - "Applications": one row per applicant with the common answers, an
 *    overview of everyone who applied.
 *  - One tab per team (named after the team, created on first use): a row for
 *    each applicant who picked that team, with a column per team question and
 *    a Status column for the team lead to track shortlisting.
 *
 * SETUP (one time, about 5 minutes)
 *  1. Create a Google Sheet from the club account, e.g. "ECell Recruitment 2026".
 *  2. In the sheet: Extensions → Apps Script. Replace the editor contents with
 *     this file and save.
 *  3. Project Settings (gear icon) → Script properties → add:
 *       SECRET             a long random string (e.g. `openssl rand -hex 32`)
 *     Optional:
 *       NOTIFY_EMAIL       comma-separated addresses to email on each application
 *       SEND_CONFIRMATION  "true" to email each applicant a receipt
 *  4. Deploy → New deployment → type "Web app".
 *       Execute as: Me        Who has access: Anyone
 *     Authorise when asked, then copy the Web app URL (it ends in /exec).
 *  5. Add both values to Vercel (Project → Settings → Environment Variables)
 *     and to .env.local for local testing, then redeploy the site:
 *       RECRUITMENT_SCRIPT_URL=<the /exec URL>
 *       RECRUITMENT_SCRIPT_SECRET=<the same SECRET as step 3>
 *
 * After editing this script: Deploy → Manage deployments → edit (pencil) →
 * Version: "New version" → Deploy. The /exec URL keeps serving the old code
 * until you do.
 *
 * Gmail accounts can send about 100 emails a day from Apps Script, so leave
 * SEND_CONFIRMATION off if you expect more applications than that per day.
 */

const SHEET_NAME = "Applications";

// [key in the JSON payload, column header]. Add new columns at the end so
// existing rows stay aligned.
const COLUMNS = [
  ["submittedAt", "Submitted at"],
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["year", "Year"],
  ["program", "Programme"],
  ["firstChoice", "First choice"],
  ["secondChoice", "Second choice"],
  ["why", "Why ECell"],
  ["experience", "Built / ran / led"],
  ["link", "Link"],
];

// Leading columns of every team tab. Question columns follow, added as new
// questions appear, so renaming a question in the site's data starts a new
// column rather than overwriting an old one.
const TEAM_COLUMNS = ["Submitted at", "Name", "Email", "Phone", "Year", "Programme", "Choice", "Status"];

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (error) {
    return respond({ ok: false, error: "bad_request" });
  }

  const secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  if (!secret || !payload || payload.secret !== secret) {
    return respond({ ok: false, error: "unauthorized" });
  }

  const application = payload.application || {};
  const email = String(application.email || "").trim().toLowerCase();
  if (!email) {
    return respond({ ok: false, error: "bad_request" });
  }

  // Two applicants submitting at once must not race on the duplicate check
  // or on appendRow.
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (error) {
    return respond({ ok: false, error: "busy" });
  }

  try {
    const sheet = getSheet();
    if (hasApplied(sheet, email)) {
      return respond({ ok: false, error: "duplicate" });
    }

    const submittedAt = new Date();
    sheet.appendRow(
      COLUMNS.map(([key]) => {
        if (key === "submittedAt") return submittedAt;
        if (key === "email") return email;
        return asText(application[key]);
      }),
    );
    teamAnswersOf(application).forEach((teamAnswers) =>
      appendTeamRow(teamAnswers, application, email, submittedAt),
    );
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  sendEmails(application, email);
  return respond({ ok: true });
}

// Opening the /exec URL in a browser shows this, which is a quick way to
// check the deployment is live.
function doGet() {
  return ContentService.createTextOutput("ECell recruitment endpoint is running.");
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([, header]) => header));
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function teamAnswersOf(application) {
  return Array.isArray(application.teamAnswers) ? application.teamAnswers : [];
}

function appendTeamRow(teamAnswers, application, email, submittedAt) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const name = String(teamAnswers.team || "Unknown team");
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(TEAM_COLUMNS);
    sheet.setFrozenRows(1);
  }

  let headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(String);
  const answers = Array.isArray(teamAnswers.answers) ? teamAnswers.answers : [];
  const missing = answers
    .map((entry) => String(entry.question))
    .filter((question) => !headers.includes(question));
  if (missing.length > 0) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    headers = headers.concat(missing);
  }
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");

  const values = {
    "Submitted at": submittedAt,
    Name: asText(application.name),
    Email: email,
    Phone: asText(application.phone),
    Year: asText(application.year),
    Programme: asText(application.program),
    Choice: asText(teamAnswers.choice),
    Status: "New",
  };
  answers.forEach((entry) => {
    values[String(entry.question)] = asText(entry.answer);
  });

  sheet.appendRow(headers.map((header) => (header in values ? values[header] : "")));
}

function hasApplied(sheet, email) {
  const rows = sheet.getLastRow() - 1;
  if (rows < 1) return false;

  const column = COLUMNS.findIndex(([key]) => key === "email") + 1;
  return sheet
    .getRange(2, column, rows, 1)
    .getValues()
    .some(([value]) => String(value).trim().toLowerCase() === email);
}

// Sheets turns text starting with = + - @ into formulas, and digit strings
// into numbers. A leading apostrophe keeps the cell as plain text and is not
// shown.
function asText(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return /^[=+\-@\d]/.test(text) ? "'" + text : text;
}

function sendEmails(application, email) {
  const properties = PropertiesService.getScriptProperties();

  // The row is already saved; a mail quota error must not fail the request.
  try {
    const notify = properties.getProperty("NOTIFY_EMAIL");
    if (notify) {
      MailApp.sendEmail({
        to: notify,
        subject: "New ECell application: " + application.name + " (" + application.firstChoice + ")",
        body: COLUMNS.filter(([key]) => key !== "submittedAt")
          .map(([key, header]) => header + ": " + (key === "email" ? email : application[key] || "-"))
          .concat(
            teamAnswersOf(application).map(
              (teamAnswers) =>
                "-- " + teamAnswers.team + " (" + teamAnswers.choice + " choice) --\n" +
                (teamAnswers.answers || [])
                  .map((entry) => entry.question + "\n" + (entry.answer || "-"))
                  .join("\n\n"),
            ),
          )
          .join("\n\n"),
      });
    }

    if (properties.getProperty("SEND_CONFIRMATION") === "true") {
      MailApp.sendEmail({
        to: email,
        name: "ECell RV University",
        subject: "We got your ECell application",
        body:
          "Hi " + application.name + ",\n\n" +
          "Thanks for applying to the " + application.firstChoice + " team at ECell RV University. " +
          "We'll be in touch about the next round after applications close.\n\n" +
          "ECell RV University",
      });
    }
  } catch (error) {
    console.error("Email failed: " + error);
  }
}

function respond(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
