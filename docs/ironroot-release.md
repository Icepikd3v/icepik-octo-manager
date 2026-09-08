# IronRoot Solutions public website

## Current scope

IronRoot Solutions provides web application development and maintenance,
technology repair and installation, and custom FDM 3D printing. The public site
presents these services and actual workshop projects supplied from the company's
Facebook posts. Facebook is the confirmed contact destination until business
email, service area, and domain details are provided.

The contact page prepares a project brief locally for a visitor to copy to
Facebook. It does not submit the brief, store personal information, or claim a
request was received. Facebook handles the eventual message.

Public routes: `/`, `/services`, `/work`, `/work/:id`, `/about`, `/3d-printing`,
and `/contact`.

## Development versus production

`npm start` runs the local development app on port 3000. `/dev` provides mock
access to the existing print workspace. These routes and their lazy-loaded pages
are excluded from `npm run build`. Production users cannot unlock the workspace
with a mock token. The public site does not call the legacy printer API.

From `App/iom-frontend`:

```sh
npm run build
npm run preview
```

The compiled website is available at `http://127.0.0.1:3002`. The preview server
serves only `build/`, supplies static-asset caching and browser security headers,
and returns 404 for unknown routes and API requests. Domain, HTTPS, hosting, and
provider-specific configuration remain to be selected. It is not deployed.

Checks:

```sh
CI=true npm test -- --watchAll=false --runInBand --watchman=false
npm run test:production
```

Run the production checks after building. They verify public deep links,
missing/private routes, response headers, and exclusion of mock workspace text.
Browser visual verification is still required; the connected Browser tool was
unavailable during this pass. Facebook screenshots are original, unmodified
assets; cards frame them in CSS and detail pages show the originals. Smaller
web-ready source photos would improve image transfer size.

## Print-commerce direction

Customers without printers should be able to request suitable parts at a price
covering printing, processing, and shipping. Start with individual orders;
subscriptions, membership pricing, and priority benefits come later.

Before enabling paid online orders:

- Confirm all three printer models, firmware, hosts, cameras, and LAN addresses.
- Choose the customer model-file workflow and operator-controlled preparation.
- Define acceptance review, materials, quote calculation, shipping, and fulfillment.
- Implement customer authentication, order ownership, admin approval, payment
  confirmation, and print-job state transitions.
- Connect printer status/video and execution through the backend after local tests.

The existing Express/MongoDB backend is a prototype. Known gaps include an
unauthenticated test-email route, overly broad user listing, direct uploads to
OctoPrint, and print submission without the required commercial approval/payment
workflow. It must not be treated as the production commerce API merely because
the company site now has a production build.

The old proposal, stack document, and terms are historical materials and do not
constitute current product scope or launch-ready policies.
