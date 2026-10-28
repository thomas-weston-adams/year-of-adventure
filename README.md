# The Year of Adventure

Instead of gifts, I want your time. People request time with me between
January 1, 2027 and my 45th birthday, February 20, 2028. Each one is a
request, not a booking: I read it and reply myself.

Plain HTML, CSS, and JavaScript. No build step. GitHub Pages serves it straight from `main`.

## Where things live

| To change | Edit |
|---|---|
| Google Form address and field IDs, date window, earlier-dates toggle, redirect, Instagram/Strava/calendar links | **`config.js`** (the site's only settings file) |
| Activity cards (titles, words, effort level) | the `activities` list at the top of `script.js` |
| Form fields | `index.html`: each field is its own numbered block inside `<form id="request-form">` |
| Colors and layout | `styles.css` |

## The request form

The form on the site sends each request to a Google Form, **Year of Adventure Requests**, owned by thomas.weston.adams@gmail.com. Visitors never see the Google Form itself. Google then:

1. adds a row to the linked Google Sheet,
2. emails Tommy that a new response came in.

After sending, the visitor's thank-you screen offers the dates as a tentative calendar event: an **Add to Google Calendar** button and an `.ics` file for Apple, Outlook, and others. The site builds both in the browser, so nothing else has to run.

There's no confirmation email to the visitor yet. (An earlier version used a Google Apps Script for that, but Google blocked it at the permission step on both of Tommy's accounts.)

Edit the Google Form: https://docs.google.com/forms/d/19CzfECts2a1Ldoj-NsShfI09IxQ4jji_oUTQ58wvpV4/edit

### Connecting the site to the form

Every site field needs its Google Form question's **entry ID** in `config.js → formFields`. Until all of them are filled in, the form shows "Requests open soon" and sends nothing. To find the IDs:

1. Open the form editor. Click **⋮ → Get pre-filled link**.
2. Type a different number into each question (1 for Name, 2 for Email, and so on). Click **Get link → Copy link**.
3. The link contains `entry.123456=1`, `entry.789012=2`, and so on. Each number after `entry.` is that question's ID.

Renaming or reordering questions on the Google Form is safe: the IDs don't change. **Deleting a question is not.** Its answers stop being saved, and Google gives no error. If you delete one, update `formFields` to match.

### Fields and safeguards

- **Adding a field:** copy a numbered block in `index.html`, add a Short answer question to the Google Form, and add the pair to `formFields` in `config.js`. Mark it `required` in the HTML to make the site check it.
- **Dates:** people can pick dates from `startDate` (or `earlierStartDate` when `allowEarlierSubmissions` is `true`) to `endDate`. The form also refuses an end date before the start date.
- **Traditions:** the "Make it a tradition?" field. Pick "Yes, every year" and the tentative calendar event repeats every year, on the thank-you screen's calendar buttons. The "Put a stake in the ground" section in `index.html` explains why.
- **Spam:** a hidden `_gotcha` field. Bots fill it in, and the site quietly doesn't send those.
