# A Year of Adventure

A birthday page for 2027: instead of gifts, friends RSVP to spend time with me.

Plain HTML, CSS, and JavaScript. No build step. GitHub Pages serves it straight from `main`.

## Editing

- **Words and activities:** the `activities` list near the top of `script.js`.
- **Settings:** the top of `script.js`:
  - `FORM_ENDPOINT`: your Formspree form URL. Until it's set, the form tells visitors RSVPs aren't open yet.
  - `STRAVA_URL`, `CALENDAR_URL`: your real links. Leave them empty to hide those buttons.
- **Look:** `styles.css`. Colors are at the top, with light and dark versions.

## Turning on RSVPs (Formspree)

1. Make a free account at formspree.io and create a form.
2. Copy its URL (it looks like `https://formspree.io/f/abcdwxyz`).
3. Paste it into `FORM_ENDPOINT` in `script.js`.

Each RSVP then arrives in your email. Nobody else can see them.
