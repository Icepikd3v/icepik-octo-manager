# IronRoot Solutions

### Samuel Farmer

![Degree Program](https://img.shields.io/badge/degree-web%20development-blue.svg)

Originally Icepik Octo Manager, a Full Sail University Web Development final project. Now the home of the IronRoot Solutions company website and a separate print-commerce project.

- 🔧 Built with: Node.js, React, OctoPrint API, TailwindCSS, MongoDB
- Public website: web development, technology repair, custom 3D printing, selected work, and Facebook inquiries.
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

### Development preview

Open `/dev` and click **Explore demo workspace** to view the development print pages. No
credentials are required. Demo access and file metadata use session storage in
this tab; files are never uploaded and no printer commands or emails are sent.
The demo entry is disabled in production builds. Real account registration and
login integration remain a later step. The public company website works without
a login and routes project inquiries to the confirmed Facebook page.

The circuit-root SVG is an initial web interpretation of the supplied IronRoot
Solutions logo, using forest green, moss, cream, and earth tones.

Validate the frontend with `npm run build` and
`CI=true npm test -- --watchAll=false --runInBand --watchman=false` from its directory.
The Jest module mapping supports React Router's subpath export in the older CRA
Jest resolver.

### Next steps, to confirm before implementation

1. Review the brand and page direction.
2. Identify all three printers, firmware, host devices, cameras, and local network
   addresses; verify each locally.
3. Implement real authentication and authorized project/print workflows.
4. Decide deployment architecture using GitHub and Cloudflare, plus a backend
   and database host if needed. No provider migration or deployment has occurred.

The backend still uses MongoDB. Actual printer operations require OctoPrint
settings; email notifications require SMTP settings in the backend `.env`.

### Compiled public website

From `App/iom-frontend`, run `npm run build` then `npm run preview`.
Open http://127.0.0.1:3002 for the compiled production preview.

See [current release scope and remaining commerce work](docs/ironroot-release.md).
