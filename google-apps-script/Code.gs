/**
 * Anything But Midlife Crisis: request form handler.
 *
 * Runs on Tommy's Google account as a web app. For each request it:
 *   1. adds a row to this spreadsheet,
 *   2. emails Tommy the details (hit Reply to answer the person directly),
 *   3. emails the person a confirmation: everything they sent, plus a
 *      tentative calendar event (Google Calendar link and .ics file).
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
  // {name} is filled in. The summary of their request and the calendar
  // links go between confirmIntro and confirmOutro.
  confirmIntro: [
    "Hi {name},",
    "",
    "Thank you. I got your request. This isn't a booking yet: I read every request myself, and I'll write back to you personally to work out the details.",
    "",
    "Here's what you sent:",
  ].join("\n"),
  confirmOutro: [
    "Anything but mid,",
    "Tommy",
    "",
    "(If you didn't fill out a form on my site, someone used your address by mistake. You can ignore this email.)",
  ].join("\n"),

  // The calendar event they can add while they wait to hear back.
  calendarTitle: "Tentative: Adventure with Tommy",
  calendarNote: "Not confirmed yet. Tommy will reply personally to lock in the details.",

  // One confirmation per email address in this many minutes, so the form
  // can't be used to flood someone's inbox.
  confirmCooldownMinutes: 60,
  // Free-text answers are shortened to this many characters in the
  // confirmation (the sheet and Tommy's email keep them whole).
  confirmMaxTextLength: 500,
};
// ===========================================================================

// One line per form field: [name="" in the form, sheet header, label in the confirmation].
const COLUMNS = [
  ["submitted_at", "Submitted", null],
  ["name", "Name", "Name"],
  ["email", "Email", "Email"],
  ["phone", "Phone", "Phone"],
  ["relationship", "How they know Tommy", "How you know Tommy"],
  ["start_date", "Start", "Preferred start"],
  ["end_date", "End", "Preferred end"],
  ["dates_flexible", "Flexible?", "Dates flexible?"],
  ["adventure", "Adventure", "Adventure"],
  ["tradition", "Tradition?", "Make it a tradition?"],
  ["group_size", "People", "How many people"],
  ["notes", "Notes", "Anything else"],
  ["status", "Status (mine)", null],
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
    .filter(([, , label]) => label)
    .map(([key, header]) => `${header}: ${d[key] || "—"}`);
  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    replyTo: d.email,
    subject: `${SETTINGS.notifySubject}: ${d.name}`,
    body: lines.join("\n") + "\n\nHit Reply to answer them directly.",
  });
}

// ---- Confirmation ---------------------------------------------------------

function confirm(d) {
  const cache = CacheService.getScriptCache();
  const key = "sent:" + d.email.toLowerCase();
  if (cache.get(key)) return;
  if (MailApp.getRemainingDailyQuota() < 5) return; // leave room for Tommy's own notices

  // What they sent, blanks left out, dates written out, long text shortened.
  const rows = COLUMNS
    .filter(([key, , label]) => label && d[key])
    .map(([key, , label]) => {
      let value = d[key];
      if (key === "start_date" || key === "end_date") value = longDate(value);
      else if (value.length > SETTINGS.confirmMaxTextLength) value = value.slice(0, SETTINGS.confirmMaxTextLength) + "…";
      return [label, value];
    });

  const intro = SETTINGS.confirmIntro.replace("{name}", d.name.split(/\s+/)[0].slice(0, 40));
  const calUrl = googleCalendarUrl(d);
  const calLine = "Add it to your calendar as tentative until we confirm:";

  const body = [
    intro,
    "",
    rows.map(([label, value]) => `${label}: ${value}`).join("\n"),
    "",
    calLine,
    `Google Calendar: ${calUrl}`,
    "Apple, Outlook, or other calendars: open the attached .ics file.",
    "",
    SETTINGS.confirmOutro,
  ].join("\n");

  const htmlBody = [
    paragraphs(intro),
    '<table cellpadding="6" style="border-collapse:collapse;margin:8px 0 16px">',
    rows.map(([label, value]) =>
      `<tr><td style="vertical-align:top;color:#5d5260;white-space:nowrap"><b>${esc(label)}</b></td>` +
      `<td style="vertical-align:top">${esc(value).replace(/\n/g, "<br>")}</td></tr>`).join(""),
    "</table>",
    `<p>${esc(calLine)}</p>`,
    `<p><a href="${esc(calUrl)}" style="display:inline-block;background:#c2185b;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Add to Google Calendar</a></p>`,
    "<p>Apple, Outlook, or other calendars: open the attached .ics file.</p>",
    paragraphs(SETTINGS.confirmOutro),
  ].join("\n");

  MailApp.sendEmail({
    to: d.email,
    name: SETTINGS.confirmFromName,
    subject: SETTINGS.confirmSubject,
    body,
    htmlBody,
    attachments: [Utilities.newBlob(icsFile(d), "text/calendar", "adventure-with-tommy.ics")],
  });
  cache.put(key, "1", SETTINGS.confirmCooldownMinutes * 60);
}

// Calendar text: their adventure plus the "not confirmed" note.
function eventDetails(d) {
  const adventure = d.adventure.slice(0, SETTINGS.confirmMaxTextLength);
  return `${SETTINGS.calendarNote}\n\nAdventure: ${adventure}`;
}

// "Yes, every year" on the form: the calendar event repeats annually.
function yearly(d) {
  return d.tradition.startsWith("Yes");
}

// All-day event from start to end. Calendars treat the end date as
// exclusive, so the event runs to the day after end_date.
function googleCalendarUrl(d) {
  return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(SETTINGS.calendarTitle) +
    "&dates=" + compact(d.start_date) + "/" + compact(addDay(d.end_date)) +
    (yearly(d) ? "&recur=" + encodeURIComponent("RRULE:FREQ=YEARLY") : "") +
    "&details=" + encodeURIComponent(eventDetails(d));
}

function icsFile(d) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const text = (s) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Anything But Midlife Crisis//Requests//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Utilities.getUuid()}@anythingbutmidlifecrisis`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(d.start_date)}`,
    `DTEND;VALUE=DATE:${compact(addDay(d.end_date))}`,
    ...(yearly(d) ? ["RRULE:FREQ=YEARLY"] : []),
    `SUMMARY:${text(SETTINGS.calendarTitle)}`,
    `DESCRIPTION:${text(eventDetails(d))}`,
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].map(fold).join("\r\n");
}

// Calendar files wrap lines at 75 characters; continuation lines start with a space.
function fold(line) {
  const parts = [];
  for (let i = 0; i < line.length; i += i === 0 ? 75 : 74) parts.push(line.slice(i, i + (i === 0 ? 75 : 74)));
  return parts.join("\r\n ");
}

// ---- Small helpers --------------------------------------------------------

function addDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

function compact(iso) {
  return iso.replace(/-/g, "");
}

function longDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Utilities.formatDate(new Date(y, m - 1, d, 12), Session.getScriptTimeZone(), "MMMM d, yyyy");
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function paragraphs(text) {
  return text.split(/\n\n+/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("\n");
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
