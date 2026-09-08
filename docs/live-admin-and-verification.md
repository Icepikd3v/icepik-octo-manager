# Public live studio, administration, and verified signup

## Pages

- `/#live-cameras`: public homepage MJPEG feeds for ED1 and ED2, with no login.
  `/watch` redirects here. Public cards show only video and the filename during
  active printing, with no temperatures, progress bars, or remaining-time details.
- `/live`: the same camera/status view within the authenticated Print Studio.
- `/admin/login`: owner sign-in using the existing account password.
- `/admin`: administrator dashboard, accessible only to verified admin accounts.
- `/verify-email`: signup verification link and six-digit code entry, plus resend.

The locally authorized owner is `sam.d3v.35@gmail.com`. That account was explicitly
provisioned as a verified administrator. The requested empty test account at
`ironrootsolutions@gmail.com` was deleted. The company email remains the public
contact and SMTP sender. Other accounts were not granted verification or admin
access. Registration never accepts roles or verified flags from the browser.

## Cameras

The backend `.env` contains `OCTOPRINT_ED1_CAMERA_URL` and
`OCTOPRINT_ED2_CAMERA_URL`, discovered from the OctoPrint camera settings. Both
currently use MJPEG at `/cam_ED1/?action=stream` and `/cam_ED2/?action=stream` on
the local printer host. The browser only receives same-origin camera paths;
printer keys and camera host URLs are not sent to visitors.

Only MJPEG responses from server-configured URLs are relayed. Redirects are
rejected and printer API credentials are never forwarded to camera servers.
Streams close when visitors disconnect or an admin disables broadcasting.
The client retries failed feeds every 30 seconds and reconnects healthy feeds
periodically. Visitors can stop a feed on their own device.

Public printer reads are cached/coalesced for ten seconds. Public status strips directory paths and exposes a filename only while connected
and actively Printing. The homepage shows no printer telemetry; the authenticated
Print Studio retains its detailed readings.
Cameras can still reveal the physical object being printed: use the per-printer
broadcast switch before printing confidential work.

The initial relay supports up to 12 concurrent viewers per camera, each with
one upstream stream. Higher traffic needs a dedicated shared video relay/CDN;
this implementation does not claim unlimited broadcast capacity. The website
backend must be able to reach the printer LAN when deployed elsewhere.

## Administration

The dashboard loads G-code files already stored in each OctoPrint instance.
Selection explicitly uses `print: false`. Start, pause, resume, and cancel each
require a second confirmation naming the printer and job. The backend checks the
current selected file and printer state before submitting job commands, rejects
unsupported commands, and permits only one in-flight command per printer in the
single-process backend. Refresh after an uncertain command response rather than
assuming the printer did or did not execute it.

Admin middleware rechecks the database-backed role on every request. Audit
records capture the actor, printer, action, time, and outcome. Camera visibility,
a site announcement, homepage introduction, live-view introduction, and upload
intake can be edited and saved in MongoDB without rebuilding the website.
Public text is rendered as text, not executable HTML. Existing visitors see
updated copy after refresh; stopped broadcasts terminate existing connections.

This is the initial site-maintenance interface, not a general page builder.
Customer upload transfer/customer-job association, gallery asset editing, and
automatic shipping are not included. Temperature, jog, terminal, and other native
features are now available through the [embedded OctoPrint workspaces](octoprint-workspaces.md).
Print execution endpoints follow the [OctoPrint job API](https://docs.octoprint.org/en/main/api/job.html)
and [file-selection API](https://docs.octoprint.org/en/main/api/files.html).

## Signup verification

Registration creates an unverified account and queues a verification email.
It returns HTTP 202 with no session cookie. A random 256-bit link token and a
six-digit code must both match; hashes are stored in the challenge collection.
Links/codes expire after 30 minutes, allow five guesses, and are single-use.
Resends have a one-minute cooldown and replace the prior challenge. Superseded
pending emails are canceled; expired queued emails are not delivered. Successful
verification grants the session; unverified users cannot log in or access
protected data. Existing non-owner accounts also need verification if they have
no verified flag; they can sign in and request a code with their existing password.

The verification token travels in the URL fragment rather than a server request
query. It is submitted with the entered code via POST. The email queue contains
the message content needed for delivery; treat database backups as private.

Set `PUBLIC_SITE_URL` to the actual website origin before deployment. The local
default is `http://127.0.0.1:3002`, usable only from the computer hosting the
preview. See [Gmail setup](email-setup.md) for SMTP verification and activation.

**Gmail authentication is currently blocked and EMAIL_ENABLED remains false.**
New accounts stay pending verification until email delivery is restored. The UI
reports this rather than claiming an email was sent. No verification bypass is
provided to public clients. Password recovery remains separate future work.

## Validation

Automated tests cover public/private access, role enforcement, input validation,
file/state confirmation, command payloads using mocked printers, persistent site
settings, upload-intake maintenance, camera relay and disconnect behavior using a
local camera fixture, signup gating, code expiration/reuse/attempt limits, frontend
camera fallbacks, admin confirmation, and verification navigation.

Real hardware checks are read-only. Browser visual QA remains unavailable in
this environment; frontend interactions are tested in a simulated DOM.

Validation result: 10 backend unit tests, 16 database integration tests, 19
frontend interaction tests, and 4 production server tests passed. Production
build succeeded. Both real camera sources delivered complete JPEG frames through
the running website proxy; initial camera startup was slow on one attempt.
No physical printer commands or emails were sent during validation.
