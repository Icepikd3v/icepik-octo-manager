# Print Studio validation — September 8, 2026

Tested on `rebrand-pt2` against the local production preview at
http://127.0.0.1:3002. Production build succeeded.

## Passed

- 14 frontend interaction tests: public navigation, contact draft, project and
  gallery interactions, protected workspace, sign-in/out, uploads, and library.
- 8 backend unit tests: printer adapters and mocked email delivery/templates.
- 12 isolated database integration tests: registration, duplicate account
  rejection, incorrect/correct passwords, email normalization, password length
  limits, bcrypt storage, cookie sessions, expired/tampered/deleted-account
  session rejection, upload contents and ownership, invalid uploads, cross-origin
  write rejection, live printer reads, disabled legacy routes, and email retries.
- 4 production server tests: compiled routes/assets, unavailable API behavior,
  security headers, and proxy preservation of sessions and requests.
- Additional HTTP smoke check against the running preview: 12 page routes,
  actual temporary registration, incorrect and correct login credentials,
  session restoration, empty private library, ED1/ED2 status, and logout.

Both printers reported Operational during integration checks. Hardware commands
in unit tests were mocked; real printer access was read-only.

Integration tests removed their own temporary database/files. The running-preview
smoke check removed its uniquely named temporary account. No customer account
credentials were changed and no test emails were sent.

## Remaining limits

Gmail SMTP authentication still returns EAUTH / WebLoginRequired, so automatic
email is disabled. Mock email tests do not establish real delivery.

The browser runtime reported no available browser. Rendered desktop/mobile
click-through and visual checks remain unverified; frontend interaction tests
run in a simulated DOM.

The current workspace saves files for review and reads global printer status.
It does not execute prints or associate live printer state with customer jobs.
Payments, shipping, password recovery and email verification are not implemented.
Logout clears the browser cookie; it does not revoke a previously copied JWT
before its seven-day expiry.

## Signing in manually

Create a Print Studio account at http://127.0.0.1:3002/signup, then use that email
and password at `/login`. Choose a password of at least 12 characters and at most
72 UTF-8 bytes. The Gmail SMTP app password is not a Print Studio login password.
Temporary automated-test credentials are removed after each run.
