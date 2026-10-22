/**
 * Anything But Midlife Crisis: request form handler.
 *
 * Runs on Tommy's Google account as a web app. For each request it:
 *   1. adds a row to this spreadsheet,
 *   2. emails Tommy the details (hit Reply to answer the person directly),
 *   3. emails the person a short confirmation.
 *
 * Setup and redeploy steps are in the repo's README.
 */

// ===========================================================================
// EMAIL SETTINGS. Change wording here, then redeploy (see README).
// ===========================================================================
const SETTINGS = {
  // The email Tommy gets for each request.
  notifySubject: "New Year of Adventure reservation",

  // The confirmation the person gets.
  sendConfirmation: true,
  confirmFromName: "Tommy",
  confirmSubject: "Got your request. Anything but mid.",
  // {name}, {start}, and {end} are filled in. Keep this free of links:
  // anyone can type any address into the form, so this email should never
  // ask a stranger to do anything.
  confirmBody: [
    "Hi {name},",
    "",
    "Thank you. I got your request for {start} to {end}.",
    "",
    "This isn't a booking yet. I read every request myself, and I'll write back to you personally to work out the details.",
    "",
    "Anything but mid,",
    "Tommy",
    "",
    "(If you didn't fill out a form on my site, someone used your address by mistake. You can ignore this email.)",
  ].join("\n"),

  // One confirmation per email address in this many minutes, so the form
  // can't be used to flood someone's inbox.
  confirmCooldownMinutes: 60,
};
// ===========================================================================

// Sheet columns, in order. The left value is the form field's name="".
const COLUMNS = [
  ["submitted_at", "Submitted"],
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["relationship", "How they know Tommy"],
  ["start_date", "Start"],
  ["end_date", "End"],
  ["dates_flexible", "Flexible?"],
  ["adventure", "Adventure"],
  ["group_size", "People"],
  ["notes", "Notes"],
  ["status", "Status (mine)"],
];

const MAX_FIELD_LENGTH = 2000;

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Spam trap: people never see this field; bots fill it in. Pretend it worked.
  if (p._gotcha) return reply({ ok: true });

  const data = {};
  for (const [key] of COLUMNS) data[key] = String(p[key] || "").trim().slice(0, MAX_FIELD_LENGTH);

  const problem = check(data);
  if (problem) return reply({ ok: false, error: problem });

  // Keep two requests from writing the same row at once.
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    data.submitted_at = new Date();
    data.status = "";
    sheet().appendRow(COLUMNS.map(([key]) => safeCell(data[key])));
  } finally {
    lock.releaseLock();
  }

  notifyTommy(data);
  if (SETTINGS.sendConfirmation) confirm(data);

  return reply({ ok: true });
}

// A quick way to see that the web app is up: open its URL in a browser.
function doGet() {
  return reply({ ok: true, message: "Request handler is running." });
}

function check(d) {
  for (const key of ["name", "email", "start_date", "end_date", "adventure"]) {
    if (!d[key]) return `Missing ${key}.`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return "That email address doesn't look right.";
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso.test(d.start_date) || !iso.test(d.end_date)) return "Dates must be YYYY-MM-DD.";
  if (d.end_date < d.start_date) return "The end date is before the start date.";
  return null;
}

function sheet() {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (s.getLastRow() === 0) {
    s.appendRow(COLUMNS.map(([, header]) => header));
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
  }
  return s;
}

// Stop a value like "=IMPORTXML(...)" from running as a formula in the sheet.
function safeCell(value) {
  return typeof value === "string" && /^[=+\-@]/.test(value) ? "'" + value : value;
}

function notifyTommy(d) {
  const lines = COLUMNS
    .filter(([key]) => !["submitted_at", "status"].includes(key))
    .map(([key, header]) => `${header}: ${d[key] || "—"}`);
  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    replyTo: d.email,
    subject: `${SETTINGS.notifySubject}: ${d.name}`,
    body: lines.join("\n") + "\n\nHit Reply to answer them directly.",
  });
}

function confirm(d) {
  const cache = CacheService.getScriptCache();
  const key = "sent:" + d.email.toLowerCase();
  if (cache.get(key)) return;
  if (MailApp.getRemainingDailyQuota() < 5) return; // leave room for Tommy's own notices
  MailApp.sendEmail({
    to: d.email,
    name: SETTINGS.confirmFromName,
    subject: SETTINGS.confirmSubject,
    body: SETTINGS.confirmBody
      .replace("{name}", d.name.split(/\s+/)[0].slice(0, 40))
      .replace("{start}", longDate(d.start_date))
      .replace("{end}", longDate(d.end_date)),
  });
  cache.put(key, "1", SETTINGS.confirmCooldownMinutes * 60);
}

function longDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Utilities.formatDate(new Date(y, m - 1, d, 12), Session.getScriptTimeZone(), "MMMM d, yyyy");
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
