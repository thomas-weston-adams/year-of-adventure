// ===========================================================================
// SETTINGS FOR THE WHOLE SITE. Change things here; nowhere else.
// ===========================================================================
const CONFIG = {
  // Requests go to a Google Form (owned by thomas.weston.adams@gmail.com),
  // which saves them to a linked Sheet and emails Tommy. See README.
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfuBIAwx5hzCvCzgwI_QMgZKt1XBgscRZKbImCB9F9q8iNAHQ/formResponse",

  // Each field on this site -> its question's entry ID on the Google Form.
  // Get them from the form's "Get pre-filled link" (see README). If one is
  // blank, the form shows "opening soon" and nothing is sent.
  formFields: {
    name: "entry.876262380",
    email: "entry.2097088348",
    phone: "entry.1149248532",
    met: "entry.909235910",
    start_date: "entry.1583002676",
    end_date: "entry.1295916346",
    dates_flexible: "entry.100632142",
    adventure: "entry.866189965",
    tradition: "entry.1097569822",
    group_size: "entry.1215744535",
    notes: "entry.1029957118",
  },

  // The window people can request dates in (YYYY-MM-DD).
  startDate: "2027-01-01",
  endDate: "2028-02-20", // my 45th birthday

  // Dates I'm already booked. They show crossed out on the date picker,
  // and requests that include them are turned back. One line per stretch
  // (from and to can be the same day), e.g.
  //   { from: "2027-07-04", to: "2027-07-05" },
  takenDates: [
  ],

  // Set to true to let people request dates before startDate,
  // as early as earlierStartDate.
  allowEarlierSubmissions: false,
  earlierStartDate: "2026-10-21",

  // Where people go after sending. "" = a thank-you message on this page,
  // with buttons to add the dates to their calendar.
  redirectUrl: "",

  // Instagram profile: the handle badge, "Follow along" button, and footer.
  instagramUrl: "https://www.instagram.com/anythingbutmidlifecrisis/",

  // Buttons on the activity cards. "" hides the button.
  stravaUrl: "https://strava.app.link/KvabRccdW0b",
  calendarUrl: "",

  // Running streak: this date counts as day 1.
  streakStart: "2018-10-15",
};
