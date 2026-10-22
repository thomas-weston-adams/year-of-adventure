// Settings live in config.js. This file reads them; don't edit values here.

const EFFORT = { 1: "Easy", 2: "Active", 3: "Gritty", 4: "Epic" };

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
    effort: 2,
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
const formReady = CONFIG.formId && CONFIG.formId !== "YOUR_FORMSPREE_FORM_ID";

form.action = `https://formspree.io/f/${CONFIG.formId}`;
$("subject").value = CONFIG.subject;
if (CONFIG.redirectUrl) {
  const next = document.createElement("input");
  Object.assign(next, { type: "hidden", name: "_next", value: CONFIG.redirectUrl });
  form.append(next);
}

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
  const size = $("group_size");
  if (size.value && !(Number.isInteger(Number(size.value)) && Number(size.value) >= 1)) {
    return [size, "Group size should be a whole number, 1 or more."];
  }
  return null;
}

form.addEventListener("submit", (e) => {
  const found = check();
  if (found) {
    e.preventDefault();
    problem(...found);
    return;
  }
  if (!formReady) {
    e.preventDefault();
    status.textContent = "Requests open soon. Check back in a few days.";
    return;
  }
  // Valid: the browser posts the form straight to Formspree.
  status.textContent = "Sending…";
});

// ---- Running streak, counted in the visitor's own time zone ------------

const [y, m, d] = CONFIG.streakStart.split("-").map(Number);
const streakStart = new Date(y, m - 1, d);
const today = new Date();
const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
$("streak-day").textContent = (Math.round((midnight - streakStart) / 86400000) + 1).toLocaleString();
