// ---- Settings: fill these in -------------------------------------------
// Formspree form URL, e.g. "https://formspree.io/f/abcdwxyz".
// Until it's set, the form says RSVPs aren't open yet instead of failing.
const FORM_ENDPOINT = "";
// Your own profile/booking links. Leave "" to hide the button.
const STRAVA_URL = "";
const CALENDAR_URL = "";
// The first day of the running streak counts as day 1.
const STREAK_START = "2018-10-15";
// -------------------------------------------------------------------------

const EFFORT = { 1: "Low-key", 2: "Active", 3: "Committed", 4: "Expedition" };

const activities = [
  {
    id: "home",
    title: "Dinners & hangouts at home",
    effort: 1,
    summary: "Let's have each other over. Dinner, a bonfire, time to catch up.",
    body: [
      "Sometimes the best adventure is at home. Let's visit each other's places, share a meal, sit around a fire, or just catch up with nowhere to be.",
      "If you'd like to host me, say so in the RSVP and suggest a few dates.",
    ],
    link: () => CALENDAR_URL && { text: "Suggest dates on my calendar", url: CALENDAR_URL },
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
    link: () => STRAVA_URL && { text: "Follow my miles on Strava", url: STRAVA_URL },
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

// ---- Cards & detail dialog ----------------------------------------------

const cards = document.getElementById("cards");
const choices = document.getElementById("activity-choices");
const dialog = document.getElementById("detail");
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

  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" name="activities" value="${a.title}" data-id="${a.id}"> ${a.title}`;
  choices.append(label);
}

cards.addEventListener("click", (e) => {
  const button = e.target.closest(".card");
  if (!button) return;
  current = activities.find((a) => a.id === button.dataset.id);
  document.getElementById("detail-effort").textContent = `${current.effort} · ${EFFORT[current.effort]}`;
  document.getElementById("detail-title").textContent = current.title;
  document.getElementById("detail-body").innerHTML = current.body.map((p) => `<p>${p}</p>`).join("");
  const link = current.link && current.link();
  document.getElementById("detail-link").innerHTML = link
    ? `<a href="${link.url}" target="_blank" rel="noopener">${link.text}</a>`
    : "";
  dialog.showModal();
});

// Clicking the dim backdrop closes the dialog, same as Escape.
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

document.getElementById("detail-rsvp").addEventListener("click", () => {
  const box = choices.querySelector(`[data-id="${current.id}"]`);
  if (box) box.checked = true;
  dialog.close();
  document.getElementById("rsvp").scrollIntoView({ behavior: "smooth" });
  document.getElementById("name").focus({ preventScroll: true });
});

// ---- Group size follows "who's coming" ----------------------------------

const who = document.getElementById("who");
const size = document.getElementById("size");
who.addEventListener("change", () => {
  const n = Number(size.value) || 1;
  if (who.value === "Just me") size.value = 1;
  else if (who.value === "Me and a partner") size.value = 2;
  else if (n < 3) size.value = 3;
});

// ---- RSVP submit --------------------------------------------------------

const form = document.getElementById("rsvp-form");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  for (const id of ["name", "contact"]) {
    const field = document.getElementById(id);
    if (!field.value.trim()) {
      status.textContent = `Please fill in ${field.labels[0].textContent.toLowerCase()}.`;
      field.focus();
      return;
    }
  }
  if (!FORM_ENDPOINT) {
    status.textContent = "RSVPs aren't open yet. Check back soon.";
    return;
  }

  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  status.textContent = "Sending…";
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(res.status);
    form.hidden = true;
    const thanks = document.getElementById("thanks");
    thanks.hidden = false;
    thanks.focus();
  } catch {
    status.textContent = "That didn't go through. Please try again in a minute.";
    button.disabled = false;
  }
});

// ---- Running streak, counted in the visitor's own time zone ------------

const [y, m, d] = STREAK_START.split("-").map(Number);
const start = new Date(y, m - 1, d);
const today = new Date();
const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const day = Math.round((midnight - start) / 86400000) + 1;
document.getElementById("streak-day").textContent = day.toLocaleString();
