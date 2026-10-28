// Settings live in config.js. This file reads them; don't edit values here.

// How much of your time each one takes.
const EFFORT = { 1: "An evening", 2: "A day", 3: "A weekend", 4: "A trip" };

const activities = [
  {
    id: "home",
    title: "Dinners & hangouts at home",
    effort: 1,
    summary: "Let's have each other over. Dinner, a bonfire, time to catch up.",
    body: [
      "Sometimes the best adventure is at home. Let's visit each other's places, share a meal, sit around a fire, or just catch up with nowhere to be.",
      "If you'd like to host me, say so in your request and suggest some dates.",
    ],
    link: () => CONFIG.calendarUrl && { text: "Suggest dates on my calendar", url: CONFIG.calendarUrl },
  },
  {
    id: "teach",
    title: "Teach me something",
    effort: 1,
    summary: "A language, piano, coffee roasting, a dish you're known for.",
    body: [
      "My list of things I don't know yet is long. I'm practicing languages on Duolingo, so we can compare notes there. I want to get back to piano, try roasting coffee, and learn whatever I can in the kitchen.",
      "If you have a skill or a hobby you love, teach me. I'll show up ready to learn.",
    ],
  },
  {
    id: "run",
    title: "Run with me",
    effort: 1,
    summary: "One mile or ten. Pace doesn't matter. Showing up does.",
    body: [
      "I've run every day since October 2018. I don't mention it to impress anyone. I mention it because it means you always know where I'll be for about an hour a day: outside, in any weather.",
      "On weekdays I try to run right after work, before dark. Run with me, or meet me where I finish and we'll hang out after.",
    ],
    link: () => CONFIG.stravaUrl && { text: "Follow my miles on Strava", url: CONFIG.stravaUrl },
  },
  {
    id: "project",
    title: "Finish a project together",
    effort: 2,
    summary: "That half-done thing in the garage, or something new we make.",
    body: [
      "Got a project at home you never finished? Let's knock it out together.",
      "Or let's make something: co-write an article, or shoot a few silly videos. I'm interested in humor and how people talk online, and I want to keep my media skills current now that AI is everywhere.",
    ],
  },
  {
    id: "outdoors",
    title: "Get outside",
    effort: 3,
    summary: "Hiking, camping, kayaking, or stargazing in dark-sky country.",
    body: [
      "Hiking, camping, fishing, kayaking, canoeing, a night or two in the backcountry, or lying on our backs under a dark sky.",
      "Some of these take real planning and some take almost none. We'll size the trip to what we both want.",
    ],
  },
  {
    id: "swim",
    title: "Mackinac Bridge Swim",
    effort: 4,
    summary: "About 4.5 miles across the Straits of Mackinac, July 2027.",
    body: [
      "I plan to swim the Mackinac Bridge Swim in 2027: about 4.5 miles across the Straits from Mackinaw City to St. Ignace. The 2026 swim sold out, so I'll register the day it opens.",
      "Swim it with me, or come along for the trip and cheer from shore. More big events are coming to this list.",
    ],
  },
  {
    id: "trip",
    title: "Travel overseas",
    effort: 4,
    summary: "Pitch me a destination. I'll plan it, and keep it cheap.",
    body: [
      "Let's go abroad. Tell me where you want to go and I'll plan it: flights, where we stay, how we get around.",
      "Finding good trips for little money is something I'm good at, and I'll do the legwork.",
    ],
  },
];

const $ = (id) => document.getElementById(id);

// ---- Dates from CONFIG --------------------------------------------------

const earliest = CONFIG.allowEarlierSubmissions ? CONFIG.earlierStartDate : CONFIG.startDate;
const latest = CONFIG.endDate;

// "2027-01-01" -> "January 1, 2027", without time-zone drift.
function longDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

for (const el of document.querySelectorAll("[data-date=start]")) el.textContent = longDate(CONFIG.startDate);
for (const el of document.querySelectorAll("[data-date=end]")) el.textContent = longDate(CONFIG.endDate);
for (const el of document.querySelectorAll("[data-date=earliest]")) el.textContent = longDate(earliest);

// ---- Countdown to 45 and Instagram links --------------------------------

{
  const [y, m, d] = CONFIG.endDate.split("-").map(Number);
  const birthday = new Date(y, m - 1, d);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((birthday - todayMidnight) / 86400000);
  if (days > 0) {
    $("countdown").textContent = days.toLocaleString();
    $("countdown-label").textContent = days === 1 ? "day until 45" : "days until 45";
  } else {
    $("countdown").textContent = "45";
    $("countdown-label").textContent = days === 0 ? "today. Happy birthday to me." : "and still anything but mid";
  }
}

for (const id of ["handle", "follow", "footer-ig"]) $(id).href = CONFIG.instagramUrl;

// ---- Cards & detail dialog ----------------------------------------------

const cards = $("cards");
const dialog = $("detail");
let current = null;

for (const a of activities) {
  const li = document.createElement("li");
  li.innerHTML = `
    <button class="card" type="button" data-id="${a.id}">
      <span class="effort effort-${a.effort}">${a.effort} · ${EFFORT[a.effort]}</span>
      <span class="card-title">${a.title}</span>
      <span class="card-summary">${a.summary}</span>
    </button>`;
  cards.append(li);
}

cards.addEventListener("click", (e) => {
  const button = e.target.closest(".card");
  if (!button) return;
  current = activities.find((a) => a.id === button.dataset.id);
  $("detail-effort").textContent = `${current.effort} · ${EFFORT[current.effort]}`;
  $("detail-effort").className = `effort effort-${current.effort}`;
  $("detail-title").textContent = current.title;
  $("detail-body").innerHTML = current.body.map((p) => `<p>${p}</p>`).join("");
  const link = current.link && current.link();
  $("detail-link").innerHTML = link
    ? `<a href="${link.url}" target="_blank" rel="noopener">${link.text}</a>`
    : "";
  dialog.showModal();
});

// Clicking the dim backdrop closes the dialog, same as Escape.
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

// "I'm in" starts the request with that adventure's name.
$("detail-rsvp").addEventListener("click", () => {
  const adventure = $("adventure");
  if (!adventure.value.includes(current.title)) {
    adventure.value = adventure.value ? `${adventure.value}\n${current.title}: ` : `${current.title}: `;
  }
  dialog.close();
  $("request").scrollIntoView({ behavior: "smooth" });
  $("name").focus({ preventScroll: true });
});

// ---- Request form -------------------------------------------------------

const form = $("request-form");
const status = $("status");
const start = $("start_date");
const end = $("end_date");
const formReady = Object.values(CONFIG.formFields).every(Boolean);

start.min = end.min = earliest;
start.max = end.max = latest;
// The end date can't be earlier than the chosen start date.
start.addEventListener("change", () => {
  end.min = start.value || earliest;
});

function problem(field, message) {
  field.setAttribute("aria-invalid", "true");
  field.setAttribute("aria-describedby", "status");
  status.textContent = message;
  status.classList.add("error");
  field.focus();
}

// Returns the first problem with the form, or null if it's ready to send.
function check() {
  for (const field of form.querySelectorAll("[aria-invalid]")) field.removeAttribute("aria-invalid");
  status.classList.remove("error");

  for (const field of form.querySelectorAll("[required]")) {
    if (!field.value.trim()) {
      const label = field.labels[0].firstChild.textContent.trim();
      return [field, `Please fill in "${label}".`];
    }
  }
  if (!/^\S+@\S+\.\S+$/.test($("email").value.trim())) {
    return [$("email"), "Please check your email address."];
  }
  for (const field of [start, end]) {
    if (field.value < earliest) return [field, `Dates start on ${longDate(earliest)}.`];
    if (field.value > latest) return [field, `Dates end on ${longDate(latest)}.`];
  }
  if (end.value < start.value) return [end, "The end date can't be before the start date."];
  const booked = firstTaken(start.value, end.value);
  if (booked) return [start, `I'm already booked on ${longDate(booked)}. Pick other dates, or tell me in the notes if you're flexible.`];
  const size = $("group_size");
  if (size.value && !(Number.isInteger(Number(size.value)) && Number(size.value) >= 1)) {
    return [size, "Group size should be a whole number, 1 or more."];
  }
  return null;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const found = check();
  if (found) {
    problem(...found);
    return;
  }
  if (!formReady) {
    status.textContent = "Requests open soon. Check back in a few days.";
    return;
  }

  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  status.textContent = "Sending…";
  try {
    // Google Forms doesn't let other sites read its reply ("no-cors"), so
    // this can only catch a request that never left, like being offline.
    // The spam trap stays here: a bot that fills it is never sent on.
    if (!form.elements._gotcha.value) {
      const body = new URLSearchParams();
      for (const [field, entry] of Object.entries(CONFIG.formFields)) body.append(entry, form.elements[field].value.trim());
      await fetch(CONFIG.formUrl, { method: "POST", mode: "no-cors", body });
    }
  } catch (err) {
    status.textContent = "That didn't go through. Please try again in a minute.";
    status.classList.add("error");
    button.disabled = false;
    return;
  }

  if (CONFIG.redirectUrl) {
    location.href = CONFIG.redirectUrl;
    return;
  }
  setCalendarLinks();
  form.hidden = true;
  $("thanks").hidden = false;
  $("thanks").focus();
});

// ---- Date picker --------------------------------------------------------
// A month calendar limited to the request window, with booked dates crossed
// out. Tap a first day, then a last day. It fills in the two date fields,
// which still work on their own.

// Date -> "2027-01-01" in the visitor's own time zone.
const isoDay = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function parseDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function* eachDay(from, to) {
  for (let date = parseDay(from); isoDay(date) <= to; date.setDate(date.getDate() + 1)) yield isoDay(date);
}

const taken = new Set(CONFIG.takenDates.flatMap(({ from, to }) => [...eachDay(from, to || from)]));

// The first booked day between from and to, or null.
function firstTaken(from, to) {
  for (const day of eachDay(from, to)) if (taken.has(day)) return day;
  return null;
}

// Booked dates shown above the form, soonest first. Past ones drop off.
{
  const range = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });
  const upcoming = CONFIG.takenDates
    .map(({ from, to }) => ({ from, to: to || from }))
    .filter(({ to }) => to >= isoDay(new Date()))
    .sort((a, b) => (a.from < b.from ? -1 : 1));
  $("booked").innerHTML = upcoming
    .map(({ from, to }) => `<li>${from === to ? range.format(parseDay(from)) : range.formatRange(parseDay(from), parseDay(to))} <span class="tag">Booked</span></li>`)
    .join("");
  $("booked").hidden = upcoming.length === 0;
}

const picker = $("date-picker");
const grid = $("picker-grid");
const hint = $("picker-hint");
const firstOpen = earliest > isoDay(new Date()) ? earliest : isoDay(new Date());
let view; // first of the month on screen
let pickFrom = null;
let pickTo = null;

function say(text, isError = false) {
  hint.textContent = text;
  hint.classList.toggle("error", isError);
}

function renderPicker() {
  $("picker-month").textContent = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  $("picker-prev").disabled = isoDay(view) <= firstOpen.slice(0, 8) + "01";
  $("picker-next").disabled = isoDay(new Date(view.getFullYear(), view.getMonth() + 1, 1)) > latest;

  const cells = ["S", "M", "T", "W", "T", "F", "S"].map((d) => `<span class="weekday" aria-hidden="true">${d}</span>`);
  for (let i = 0; i < view.getDay(); i++) cells.push("<span></span>");
  const month = view.getMonth();
  for (let date = new Date(view); date.getMonth() === month; date.setDate(date.getDate() + 1)) {
    const day = isoDay(date);
    const isTaken = taken.has(day);
    const outside = day < firstOpen || day > latest;
    const selected = day === pickFrom || day === pickTo;
    const between = pickFrom && pickTo && day > pickFrom && day < pickTo;
    const classes = ["day", isTaken && "taken", selected && "endpoint", between && "in-range"].filter(Boolean).join(" ");
    const label = longDate(day) + (isTaken ? ", already booked" : "");
    cells.push(`<button type="button" class="${classes}" data-day="${day}" aria-label="${label}" aria-pressed="${selected}"${isTaken || outside ? " disabled" : ""}>${date.getDate()}</button>`);
  }
  grid.innerHTML = cells.join("");
}

$("pick-dates").addEventListener("click", () => {
  pickFrom = start.value || null;
  pickTo = end.value || null;
  const shown = parseDay(pickFrom || firstOpen);
  view = new Date(shown.getFullYear(), shown.getMonth(), 1);
  say(pickFrom ? "Tap a new first day to start over." : "Tap your first day.");
  renderPicker();
  picker.showModal();
});

grid.addEventListener("click", (e) => {
  const day = e.target.closest(".day")?.dataset.day;
  if (!day) return;
  if (!pickFrom || pickTo || day < pickFrom) {
    pickFrom = day;
    pickTo = null;
    say("Now tap your last day. Tap the same day again for a single day.");
  } else if (firstTaken(pickFrom, day)) {
    say(`I'm already booked on ${longDate(firstTaken(pickFrom, day))}. Pick a shorter stretch.`, true);
    return;
  } else {
    pickTo = day;
    say(pickFrom === pickTo ? longDate(pickFrom) : `${longDate(pickFrom)} to ${longDate(pickTo)}`);
  }
  renderPicker();
  grid.querySelector(`[data-day="${day}"]`).focus();
});

for (const [id, step] of [["picker-prev", -1], ["picker-next", 1]]) {
  $(id).addEventListener("click", () => {
    view = new Date(view.getFullYear(), view.getMonth() + step, 1);
    renderPicker();
  });
}

$("picker-done").addEventListener("click", () => {
  if (!pickFrom) {
    say("Tap your first day.", true);
    return;
  }
  start.value = pickFrom;
  end.value = pickTo || pickFrom;
  end.min = start.value;
  picker.close();
  $("dates_flexible").focus();
});

picker.addEventListener("click", (e) => {
  if (e.target === picker) picker.close();
});

// ---- Tentative calendar event on the thank-you screen ------------------
// All-day, start to end. Calendars treat the end date as exclusive, so the
// event runs to the day after end_date. "Yes, every year" repeats it yearly.

const CAL_TITLE = "Tentative: Adventure with Tommy";

function addDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

const compact = (iso) => iso.replace(/-/g, "");

// Calendar files wrap lines at 75 characters; continuation lines start with a space.
function fold(line) {
  const parts = [];
  for (let i = 0; i < line.length; i += i === 0 ? 75 : 74) parts.push(line.slice(i, i + (i === 0 ? 75 : 74)));
  return parts.join("\r\n ");
}

function setCalendarLinks() {
  const from = compact(start.value);
  const to = compact(addDay(end.value));
  const yearly = $("tradition").value.startsWith("Yes");
  const details = `Not confirmed yet. I'll write back to you personally to lock in the details. – Tommy\n\nAdventure: ${$("adventure").value.trim()}`;

  $("cal-google").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(CAL_TITLE) +
    "&dates=" + from + "/" + to +
    (yearly ? "&recur=" + encodeURIComponent("RRULE:FREQ=YEARLY") : "") +
    "&details=" + encodeURIComponent(details);

  const text = (s) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Anything But Midlife Crisis//Requests//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@anythingbutmidlifecrisis`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${from}`,
    `DTEND;VALUE=DATE:${to}`,
    ...(yearly ? ["RRULE:FREQ=YEARLY"] : []),
    `SUMMARY:${text(CAL_TITLE)}`,
    `DESCRIPTION:${text(details)}`,
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].map(fold).join("\r\n");
  $("cal-ics").href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  $("cal-yearly").hidden = !yearly;
}

// ---- Running streak, counted in the visitor's own time zone ------------

const [y, m, d] = CONFIG.streakStart.split("-").map(Number);
const streakStart = new Date(y, m - 1, d);
const today = new Date();
const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
$("streak-day").textContent = (Math.round((midnight - streakStart) / 86400000) + 1).toLocaleString();
