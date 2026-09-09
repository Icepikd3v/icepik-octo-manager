# Web build showcase

Selected Work now includes seven development projects from the Resume portfolio
and the local AOTG handoff screenshots. Click a card to open its `/work/:id` page.

| Project | Presentation |
| --- | --- |
| Rick and Morty | Embedded original React app; character-search API |
| UFC | Embedded Expo/React Native web app; sample fighter API |
| ReadySetTravel | Local copy of the original five-page frontend |
| Icepik Octo Manager | Archived résumé demo, separate from this site's live workspace |
| AOTG Transportation | Eight ride-request, payment, driver, and dispatch screenshots |
| HomeFit AI | Backend dashboard and API documentation screenshots |
| MyBrothersFinds | Archived storefront screenshot |

The demo viewer provides desktop/mobile width controls, reload, close/relaunch,
and an external fallback link. The screenshot viewer selects full screenshots
inside the project page. Portrait images retain their proportions.

## Sources

Reference repository: https://github.com/Icepikd3v/Resume

Reviewed commit: `c60b2d341dd7ab5233b64b4395e4d05af5fead9d`.
Project descriptions came from `lib/resume-data.ts` and `data/site-content.json`.
Artwork and screenshots were copied from that repository's `public/` directory;
the UFC cover is a new SVG project illustration, not an app screenshot.

AOTG screenshots were copied unchanged from:
`/Users/icepik/Desktop/Work/AOTG/AOTG Transportation Firebase Flutter Web App Build Handoff Packet/assets/`:

- `consumer_request_ride_form.png`
- `consumer_request_checkout_button.png`
- `consumer_upcoming_rides.png`
- `consumer_track_awaiting_payment.png`
- `driver_home_on_duty.png`
- `admin_dispatch_payment_holds.png`
- `admin_pricing_settings.png`
- `admin_menu_operations.png`

The AOTG app, Firebase configuration, private handoff documents, and customer data
were not imported. Screenshots show a development build, not live transportation
availability or current prices.

## Runtime and editing

Project metadata is in `App/iom-backend/config/projectDefaults.json`. The existing
website editor can override descriptions, thumbnails and visibility. Curated demo
URLs, technology labels and screenshot lists remain source-controlled. The
September 9 date records the showcase addition, not project completion; these
pages display “Development portfolio” instead of inventing a completion date.

Rick and Morty, UFC and the archived print manager load directly from
`https://resume-site-eight-snowy.vercel.app/embedded/`. They use the Resume site's
existing API/data store and remain separate from IronRoot sessions and MongoDB.
UFC data is a shared portfolio sample, not official current sports data. External
demos depend on that deployment and may require opening in a new tab if a browser
blocks embedded storage. No credentials or remote writes were used for testing.

ReadySetTravel lives in `App/iom-frontend/public/demos/ready-set-travel/`. Its
capitalization-mismatched About/Destinations links and absolute laptop home links
were corrected. The original Tailwind CDN, Google Fonts, and remote tour images
remain dependencies. Booking controls are part of the original student mockup,
not a booking service. Its frame policy permits same-site embedding; only that
demo gets the styles/CDN permissions it needs. The main site allows remote frames
only from the Resume deployment, with existing script policies retained.

## Validation

- Production build passed.
- 25 React tests passed, including card-to-demo navigation, width controls,
  reload/close/relaunch, repository links, and screenshot selection.
- 8 production-preview checks passed, including all showcase routes, screenshot
  assets, embedding policies, and every local travel page link.
- 21 backend integration tests passed with an isolated MongoDB database.
- Remote demo documents and Rick and Morty/UFC read API responses returned HTTP 200.
- An interactive browser was unavailable in this session. Browser rendering,
  third-party storage behavior, and end-to-end remote editing were not verified.

The gallery was expanded from four to eight inspected screenshots and now uses the clean ride-request form as its cover. The newer July release screenshots were found in iCloud, but their bytes were not available despite download requests; they were not substituted without inspection. Elysium Mall was removed at the owner’s request.
