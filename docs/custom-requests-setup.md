# Custom design requests inbox: setup

What it does: when someone submits the custom design form on Digital Craft,
the request is saved as a row in a **private** "Custom Requests" tab of the
KEEMVERSE Product Database sheet, and an email alert goes to the owner. The
person is then handed to WhatsApp with the same message, as before.

Why not the repo: the GitHub repo is public. These messages hold names and
contact details, so they never touch `data/*.json` or any committed file.

## One-time setup (about 10 minutes)

1. **Apps Script** (the same project as the checkout script)
   - Open `docs/apps-script-requests.gs` and paste its functions into the project.
   - If the project already has a `doPost(e)`, do not paste a second one: add
     the single line marked `(A)` inside the existing one.
   - Project Settings > Script Properties, add:
     - `REQUESTS_SECRET`: a long random secret (make it, copy it straight in; do not paste it anywhere else)
     - `NOTIFY_EMAIL`: who gets the alert (optional; several addresses allowed, comma separated)
   - Deploy > Manage deployments > Edit > New version > Deploy.
2. **Vercel** (keemverse project > Environment Variables, Production)
   - `REQUESTS_SECRET`: the same value as in the Script Properties. Mark it Sensitive.
   - Push to `main` (or redeploy) so it takes effect.
3. **Share the sheet** with anyone who should read requests (for example Ini).
   The "Custom Requests" tab creates itself on the first request.

## How it behaves

- Saved: the visitor sees "Got it" with a reference like `CR-0007` and a WhatsApp button.
- Not saved (script not set up, down, or slow): the form says it could not save and
  hands over to WhatsApp, so no enquiry is lost.
- Spam: a hidden field catches bots, and each connection is limited to 5 requests
  an hour.
- In the sheet: Status dropdown (New, Replied, Quoted, Won, Closed) and a Notes
  column for you.
- Email: replying to the alert goes straight to the visitor when they gave an
  email address; for a phone number it includes a one-tap WhatsApp link.

## If it stops working

- `REQUESTS_SECRET` must match in both places exactly.
- After editing the Apps Script, deploy a **new version** (the /exec URL stays the same).
- `/api/requests` answers 503 when `REQUESTS_SECRET` is missing in Vercel and 502
  when the script cannot be reached or does not answer in the expected shape.
