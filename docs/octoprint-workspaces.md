# Native OctoPrint in the admin dashboard

Open `/admin` and choose **Open ED1 OctoPrint** or **Open ED2 OctoPrint**.
Each printer now has a full-width embedded OctoPrint interface with reload,
close, and full-page options. Quick controls remain in a collapsible section.
Sign into each instance with its existing OctoPrint username and password.
The site account and the OctoPrint accounts remain separate.

The native interface provides the controls, files, terminal, temperatures,
timelapses, plugins, and settings available to that OctoPrint account. Native
operations use OctoPrint's own permissions and confirmation dialogs, and are not
recorded in IronRoot's quick-command audit collection. Sensitive OctoPrint
settings may still require its normal password reauthentication.

## Routing and sessions

The production preview forwards `/ED1/`, `/ED2/`, and their camera paths to the
backend. The backend requires a verified site administrator for every proxied
HTTP request, including static assets, login, uploads, downloads, and SockJS.
Native prefixes stay intact for OctoPrint and plugin-generated URLs. This setup
uses the existing upstream `/ED1` and `/ED2` base paths.

Request bodies are streamed before Express JSON parsing, preserving multipart
uploads and native login requests. Native response bodies are not rewritten.
WebSocket upgrades go through both proxy layers; the backend checks the site
session, admin role, and browser origin before opening a connection, and rechecks
session/role validity periodically. Polling fallback requests use the same gate.

The site session cookie now has `Path=/` so it reaches the protected native
routes. Opening a panel refreshes an existing admin session into that scope;
old `/api` cookies are cleared during migration and logout. The site JWT and
bearer token are removed before requests reach OctoPrint. No stored printer API
key is injected into the native UI or returned to the browser. OctoPrint's own
cookies, CSRF headers, permissions, and login flow are preserved.

Only the native OctoPrint paths permit same-origin framing and native inline
scripts/styles; the public website keeps its existing restrictive content policy.
OctoPrint runs on the site's origin, so this integration is intended for the
owner's trusted printer instances and plugins. It is not a sandbox for untrusted
third-party applications. Public visitors and ordinary members cannot access it.

This integration is configured in the production preview at port 3002; the older
CRA development server does not implement these root-path/WebSocket proxy rules.
A future hosting proxy must forward those paths and upgrades to the backend,
which must retain connectivity to the printer LAN.

## Validation

55 automated checks pass: 11 backend unit, 19 integration, 20 frontend interaction,
and 5 production-server tests. Coverage includes admin/guest/member HTTP and
WebSocket access, raw body preservation, stripping site credentials, native
cookie handling, independent panels, and both production proxy transports.
Both real OctoPrint login screens loaded through an isolated admin proxy with
no stored API keys in the returned HTML. No hardware commands or native login
attempts were sent to the real printers during these checks.

The build passed. Browser visual QA and a signed-in click-through of every
OctoPrint plugin remain unverified because no browser connection was available.
