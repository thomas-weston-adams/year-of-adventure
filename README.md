# The Year of Adventure

Instead of gifts, I want your time. People request time with me between
January 1, 2027 and my 45th birthday, February 20, 2028. Each one is a
request, not a booking: I read it and reply myself.

Plain HTML, CSS, and JavaScript. No build step. GitHub Pages serves it straight from `main`.

## Where things live

| To change | Edit |
|---|---|
| Formspree form ID, date window, earlier-dates toggle, email subject, redirect, Strava/calendar links | **`config.js`** (the only settings file) |
| Activity cards (titles, words, effort level) | the `activities` list at the top of `script.js` |
| Form fields | `index.html`: each field is its own numbered block inside `<form id="request-form">` |
| Colors and layout | `styles.css` |

## The request form

Submissions go to Formspree, which emails them to me. There's no database.

- **Turning it on:** put the form ID (the part after `/f/` in the Formspree URL) in `config.js → formId`. Until then the form shows "Requests open soon" and sends nothing.
- **Adding or renaming a field:** copy a numbered block in `index.html`. The `name="..."` is the label the email shows. A field marked `required` is checked automatically.
- **Spam:** a hidden `_gotcha` field. Bots fill it in, and Formspree drops those.
- **Dates:** people can pick dates from `startDate` (or `earlierStartDate` when `allowEarlierSubmissions` is `true`) to `endDate`. The form also refuses an end date before the start date.
- **Formspree's own settings** (notification email, spam filter, etc.) are changed in the Formspree dashboard. They don't need a code change.
