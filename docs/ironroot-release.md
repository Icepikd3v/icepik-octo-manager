# IronRoot Solutions website and live print workspace

## Current local release

Public company pages remain at `/`, `/services`, `/work`, `/work/:id`, `/about`,
`/3d-printing`, and `/contact`. Contact prepares a brief for the visitor to send
through the confirmed Facebook destination.

The print studio is now included in the production build:

- `/signup` and `/login`: real accounts and HttpOnly cookie sessions.
- `/dashboard`: personal greeting, live connection count, and workspace links.
- `/live`: ED1/ED2 connection states, nozzle/bed readings, file progress, and time
  remaining. Status refreshes every 15 seconds; failures show unavailable or stale
  readings instead of fabricated data.
- `/upload`: STL and G-code uploads, up to 50 MB, saved for review.
- `/file-library`: database-backed files belonging to the signed-in account.
- `/dev`: redirects to the authenticated workspace. Mock sign-in was removed.

Uploads save real file contents on the backend and metadata in MongoDB. They do
not transfer to OctoPrint or start prints. The old automatic print, analytics,
user-listing, and test-email routes are not mounted. Operator execution, quotes,
payments, fulfillment, and camera feeds remain separate future work.

## Run locally

Start MongoDB and run `npm run dev` in `App/iom-backend`.
In `App/iom-frontend`, run `npm run build` and `npm run preview`.
Open `http://127.0.0.1:3002` and choose **Print studio**.

The preview proxies `/api` to the loopback backend on port 3001. `API_PORT` can
change that port. Keep printer keys in the ignored backend `.env`.
Backend `JWT_SECRET` must have at least 32 characters. `WEB_ORIGINS` is a
comma-separated list of allowed website origins for writes. `COOKIE_SECURE=true`
is required when hosting behind HTTPS. The local HTTP preview leaves it false.
Authentication attempts are limited per client IP in this single-process setup.

## Validation

Frontend: `npm run build`,
`CI=true npm test -- --watchAll=false --runInBand --watchman=false`, and
`npm run test:production`.
Backend: `npm test` and `npm run test:integration`.
Integration checks create and remove an isolated MongoDB test database and test
uploads, and read the real printer endpoints without operating hardware.

This is a local production build, not a public deployment. Domain, HTTPS,
production database/storage backups, and hosting configuration remain to be set
for an internet release. Browser visual QA could not be completed because the
connected browser was unavailable in this session.
