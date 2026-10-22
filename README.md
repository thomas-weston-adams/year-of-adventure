# The Year of Adventure

Instead of gifts, I want your time. People request time with me between
January 1, 2027 and my 45th birthday, February 20, 2028. Each one is a
request, not a booking: I read it and reply myself.

Plain HTML, CSS, and JavaScript. No build step. GitHub Pages serves it straight from `main`.

## Where things live

| To change | Edit |
|---|---|
| Google script URL, date window, earlier-dates toggle, redirect, Instagram/Strava/calendar links | **`config.js`** (the site's only settings file) |
| Email subjects and the confirmation wording | the `SETTINGS` block at the top of **`google-apps-script/Code.gs`** |
| Activity cards (titles, words, effort level) | the `activities` list at the top of `script.js` |
| Form fields | `index.html`: each field is its own numbered block inside `<form id="request-form">` |
| Colors and layout | `styles.css` |

## The request form

Requests go to a small Google Apps Script running on Tommy's Google account
(tommy.futureleader@gmail.com). For each request it:

1. adds a row to a Google Sheet,
2. emails Tommy the details (hit **Reply** to answer the person directly),
3. emails the person a short confirmation.

It's free. Gmail allows about 100 emails a day from a script.

### One-time setup (on a computer is easiest)

1. Signed in as **tommy.futureleader@gmail.com**, open **sheets.new**. Name the sheet *Anything But Midlife Crisis - Requests*.
2. In the sheet: **Extensions → Apps Script**.
3. Delete what's in the editor. Paste in all of [`google-apps-script/Code.gs`](google-apps-script/Code.gs). Click **Save**.
4. **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**.
5. Google asks for permission. Pick your account. When it says *"Google hasn't verified this app"*, click **Advanced → Go to (project name) (unsafe) → Allow**. That warning is normal for a script you wrote for yourself.
6. Copy the **Web app URL** (it ends in `/exec`) and paste it into `config.js → scriptUrl`.

Until step 6 is done, the form shows "Requests open soon" and sends nothing.

### Changing the email wording later

Edit the `SETTINGS` block at the top of the script, click **Save**, then
**Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.
The URL stays the same, so the site needs no change. Keep the copy in this repo in sync.

### Fields and safeguards

- **Adding or renaming a field:** copy a numbered block in `index.html`, and add a matching entry to `COLUMNS` in `Code.gs` (then redeploy). Mark it `required` in the HTML to make the site check it.
- **Dates:** people can pick dates from `startDate` (or `earlierStartDate` when `allowEarlierSubmissions` is `true`) to `endDate`. The form also refuses an end date before the start date.
- **Spam:** a hidden `_gotcha` field. Bots fill it in, and the script quietly ignores those.
- **Inbox flooding:** anyone can type any address into a form, so the confirmation has no links, and one address gets at most one confirmation an hour.
