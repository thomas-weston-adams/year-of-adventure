// ===========================================================================
// SETTINGS FOR THE WHOLE SITE. Change things here; nowhere else.
// ===========================================================================
const CONFIG = {
  // Requests go to a Google Form (owned by thomas.weston.adams@gmail.com),
  // which saves them to a linked Sheet and emails Tommy. See README.
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfuBIAwx5hzCvCzgwI_QMgZKt1XBgscRZKbImCB9F9q8iNAHQ/formResponse",

  // Each field on this site -> its question's entry ID on the Google Form.
  // Get them from the form's "Get pre-filled link". Until every one is
  // filled in, the form shows "opening soon" and nothing is sent.
  formFields: {
    name: "",
    email: "",
    phone: "",
    relationship: "",
    start_date: "",
    end_date: "",
    dates_flexible: "",
    adventure: "",
    tradition: "",
    group_size: "",
    notes: "",
  },

  // The window people can request dates in (YYYY-MM-DD).
  startDate: "2027-01-01",
  endDate: "2028-02-20", // my 45th birthday

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
