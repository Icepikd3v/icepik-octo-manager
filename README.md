# IronRoot Solutions

### Samuel Farmer

![Degree Program](https://img.shields.io/badge/degree-web%20development-blue.svg)

Originally Icepik Octo Manager, a Full Sail University Web Development final project. Now the home of the IronRoot Solutions company website and a separate print-commerce project.

- 🔧 Built with: Node.js, React, OctoPrint API, TailwindCSS, MongoDB
- Public website: web development, technology repair, custom 3D printing, selected work, and email/Facebook inquiries.
- Prototype backend: authentication, print jobs, admin controls, and analytics require further integration before commerce launch.

📘 [View Project Log](./docs/log.md)

### Local startup

The main application lives in `App/`; `demo/` contains older demos.
MongoDB must be running locally on port 27017 (or use your own `MONGO_URI`).

Create `App/iom-backend/.env` from `.env.example` and replace `JWT_SECRET`
with a random secret. Keep `.env` private; it is ignored by Git.

In one terminal:

```sh
cd App/iom-backend
npm install
npm run dev
```

In a second terminal:

```sh
cd App/iom-frontend
npm install
npm start
```

If the legacy dev server reports `options.allowedHosts[0]` is invalid, use this
loopback-only command in the frontend directory:

```sh
BROWSER=none HOST=127.0.0.1 PORT=3000 DANGEROUSLY_DISABLE_HOST_CHECK=true npm start
```

Keep `HOST=127.0.0.1` when using this workaround, which disables host validation.

Open http://localhost:3000. The prototype API status endpoint is
http://localhost:3001/api/status. The public company pages do not depend on it.

### Live print workspace

Open **Print studio** in the website header, or visit `/signup` to create a real
account. `/login` opens an existing account. The same workspace is available in
development and production builds; `/dev` redirects into it.

The dashboard and `/live` read ED1 and ED2 status, temperatures, and job progress
every 15 seconds. `/upload` saves STL and G-code files (up to 50 MB) to the backend
and MongoDB. `/file-library` shows only the signed-in user's saved files. Uploads
are saved for review; automatic transfer and payments are not enabled.
Owner-only controls operate files already stored in OctoPrint; public camera
streams are available at `/watch`. Legacy command and test-email routes
are not mounted by the workspace API.

Sessions use an HttpOnly cookie. API requests use `/api` on the website's origin;
the production preview proxies these requests to the backend on port 3001.
Both the preview and backend bind to loopback by default. Run both servers to use
the workspace. No deployment to a public host has occurred.

Validate the frontend with `npm run build`,
`CI=true npm test -- --watchAll=false --runInBand --watchman=false`, and
`npm run test:production` from `App/iom-frontend`.
Run backend unit checks with `npm test` from `App/iom-backend`.
`npm run test:integration` uses local MongoDB with an isolated temporary database,
cleans up its own test records/files, and makes read-only requests to both printers.

### Local OctoPrint connections

ED1 uses `http://192.168.1.34/ED1` and ED2 uses `http://192.168.1.34/ED2`.
Set `OCTOPRINT_ED1_URL`, `OCTOPRINT_ED1_API_KEY`, `OCTOPRINT_ED2_URL`, and
`OCTOPRINT_ED2_API_KEY` in `App/iom-backend/.env`. Keep keys on the backend.
Restart the backend after changing configuration.

The connection layer accepts ED1 and ED2. Existing stored jobs still use
`EnderDirect` (mapped to ED1) and `EnderMultiColor` (mapped to ED2), preserving
compatibility with the current job models. Per-instance settings take priority
over the legacy shared URL/key settings. The live workspace uses ED1 and ED2 directly for new uploads.

Run the backend connection tests with `node --test test/octoprint.test.js` from
`App/iom-backend`. These tests mock printer commands and do not operate hardware.

### Compiled public website

From `App/iom-frontend`, run `npm run build` then `npm run preview`.
Open http://127.0.0.1:3002 for the compiled production preview.

See [current release scope and remaining commerce work](docs/ironroot-release.md).

### Printing gallery photos

The 3D-printing page and custom-prints project share a gallery with 21 new photos.
The supplied HEIC/PNG originals remain in `App/iom-frontend/public`; the website
uses optimized JPEGs and thumbnails from `public/printing`. The three Instagram
screenshots use exact photo-only crops, without generated or retouched content.
On macOS, run `node scripts/prepare-printing-photos.cjs` from the frontend to
recreate these copies. Captions and display order live in `src/data/printingGallery.js`.

### Customer email

Company contact: **ironrootsolutions@gmail.com**. Gmail SMTP and a persistent
notification queue support upload receipts and enrolled job status updates.
See [email setup and current automation scope](docs/email-setup.md) before enabling sending.

### Public cameras and owner administration

Visit `/watch` for public ED1/ED2 live views and `/admin/login` for owner controls
and website settings. New accounts require an emailed verification link and code.
See [setup, access rules, and current email limitation](docs/live-admin-and-verification.md).
