// ===========================================================================
// SETTINGS FOR THE WHOLE SITE. Change things here; nowhere else.
// ===========================================================================
const CONFIG = {
  // Google Apps Script web app URL (ends in /exec). See README for setup.
  // While this is still the placeholder, the form shows "opening soon"
  // and nothing is sent.
  scriptUrl: "PASTE_YOUR_SCRIPT_URL_HERE",

  // The window people can request dates in (YYYY-MM-DD).
  startDate: "2027-01-01",
  endDate: "2028-02-20", // my 45th birthday

  // Set to true to let people request dates before startDate,
  // as early as earlierStartDate.
  allowEarlierSubmissions: false,
  earlierStartDate: "2026-10-21",

  // Where people go after sending. "" = a thank-you message on this page.
  // (Email subjects and the confirmation wording live in
  // google-apps-script/Code.gs, because Google sends those emails.)
  redirectUrl: "",

  // Instagram profile: the handle badge, "Follow along" button, and footer.
  instagramUrl: "https://www.instagram.com/anythingbutmidlifecrisis/",

  // Buttons on the activity cards. "" hides the button.
  stravaUrl: "https://strava.app.link/KvabRccdW0b",
  calendarUrl: "",

  // Running streak: this date counts as day 1.
  streakStart: "2018-10-15",
};
