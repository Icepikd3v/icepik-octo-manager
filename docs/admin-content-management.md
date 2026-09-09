# Printer and website administration

Use the production preview at http://127.0.0.1:3002 and sign in with the verified
administrator account. `/admin` opens native OctoPrint automatically, with an
ED1/ED2 switcher, status polling, and focus mode. Previously opened printer panels
stay mounted when switching. OctoPrint retains its own login and permissions.

`/admin/website` is the separate content workspace. Create or edit a project,
choose its category and completion stage, add a date, summary and detailed notes,
and choose a studio photo or upload a JPG, PNG or WebP (up to 10 MB). Supply useful
image alternative text. Save as a draft to review it privately, or publish it to
the public portfolio. Changing a published entry back to draft removes it from
public API responses and project pages. The homepage shows the newest published
projects; the printing page also lists published printing projects.

The five original portfolio entries remain defaults until edited. Database
records override those defaults, including their publication status. The original
printing photo gallery remains available separately. Public visitors see updates
on their next page load; no rebuild is needed for project changes.

Project records are stored in MongoDB. Uploaded images are stored in
`App/iom-backend/content-images/`, which is ignored by Git: back up this directory
along with MongoDB and retain it across deployments. Unpublished uploaded images
require admin authentication. Public image requests require a published project
reference. Uploads are retained when unpublished so drafts can be restored.

The website view also manages the existing announcement, introductory copy,
upload availability and camera visibility settings. It is not a general page
builder or source-code editor.

The About and portfolio pages link to https://resume-site-eight-snowy.vercel.app/.
Each project can also have an optional HTTPS résumé or case-study link. The résumé
remains an independent website; publishing here does not synchronize its content.

Validation: 12 backend unit, 21 backend integration, 23 frontend interaction and
6 production-server checks passed, together with the production build. Tests
cover draft privacy, publishing, image access, role checks, separate admin views,
printer panel persistence and project deep links. Integration content uses an
isolated test database. No real printer commands or customer emails were sent.
Browser visual inspection remains unavailable without an attached browser.
