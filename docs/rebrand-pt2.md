# Rebrand pt2

Branch: `rebrand-pt2`. The prior live workspace and gallery are saved on `ReBrand`
at checkpoint `f05c753` before this design begins.

IronRoot Solutions keeps its name and shifts to a graphite/electric-blue visual
identity. The circuit-root mark, typography, technical SVG hero, navigation,
service presentation, public pages, gallery, and authenticated print workspace
share the new palette. No stock or generated product photos are introduced.

The home page gives visitors two clear paths:

- 3D printing: explore the gallery, discuss a project, or open the print studio.
- Technology work: web applications and software design, hardware diagnostics and
  repair, and security-camera, device, and network setup.

The service page has four categories. Security-service links preselect the
security topic in the contact page; software design is also a contact option.
Contact remains the existing Facebook brief workflow. No inquiry is presented as
sent until the visitor sends it through Facebook.

The local production preview is `http://127.0.0.1:3002` after `npm run build` and
`npm run preview` in `App/iom-frontend`. This change is not a public deployment.

Validation: frontend interaction tests cover the printing/tech paths, security
inquiry navigation, and the existing account, gallery, and upload flows. The
production build and production server tests check the compiled route/asset
behavior. The in-app browser was unavailable, so a rendered desktop/mobile visual
review remains outstanding.
