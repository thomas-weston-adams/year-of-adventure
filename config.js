// ===========================================================================
// SETTINGS FOR THE WHOLE SITE. Change things here; nowhere else.
// ===========================================================================
const CONFIG = {
  // Formspree form ID: the part after /f/ in https://formspree.io/f/xxxxxxxx
  // While this is still the placeholder, the form shows "opening soon"
  // and nothing is sent.
  formId: "YOUR_FORMSPREE_FORM_ID",

  // The window people can request dates in (YYYY-MM-DD).
  startDate: "2027-01-01",
  endDate: "2028-02-20", // my 45th birthday

  // Set to true to let people request dates before startDate,
  // as early as earlierStartDate.
  allowEarlierSubmissions: false,
  earlierStartDate: "2026-10-21",

  // Subject line of the email Formspree sends me.
  subject: "New Year of Adventure reservation",

  // Where people land after sending. "" = Formspree's own thank-you page.
  // (A custom page needs a paid Formspree plan.)
  redirectUrl: "",

  // Buttons on the activity cards. "" hides the button.
  stravaUrl: "https://strava.app.link/KvabRccdW0b",
  calendarUrl: "",

  // Running streak: this date counts as day 1.
  streakStart: "2018-10-15",
};
