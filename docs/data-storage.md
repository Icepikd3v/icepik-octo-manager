# Account and print-file storage

The local API uses MongoDB database `icepik_octo_manager`. The installed MongoDB
service stores data in `/opt/homebrew/var/mongodb`, as configured in
`/opt/homebrew/etc/mongod.conf`. Records persist independently of the web servers.

Accounts store a bcrypt password hash, normalized email, username, verification
state, role, and subscription tier. A unique email index prevents duplicate
accounts. `createdAt` and `updatedAt` track account creation and changes;
`emailVerifiedAt` records successful verification and `lastLoginAt` records the
most recent session issuance, including verification and admin session renewal.
Failed logins do not change `lastLoginAt`. These are MongoDB UTC dates.
Existing accounts keep unknown historical verification/login dates empty until
the corresponding event occurs; no historical dates are invented.

Uploaded STL/G-code bytes live in `App/iom-backend/uploads/`. MongoDB's
`modelfiles` collection stores the filename, original name, size, owner ID,
printer, status, and `uploadDate`. New records also have `createdAt` and
`updatedAt`; changes advance `updatedAt` while retaining the original dates.
An owner/upload-date index supports the private file library. Existing records
retain their original `uploadDate`; new timestamp fields are not backfilled.
Upload success is returned only after the metadata is saved. A failed database
save removes the uploaded file. A process crash between disk write and database
save can still leave an unreferenced file, so both stores need periodic checks.

## Local audit, September 9, 2026

- Website on port 3002 and API on port 3001 respond successfully.
- MongoDB contains one account with a creation timestamp and a unique email index.
- No print-file records exist. One older G-code file exists in `uploads/` without
  an ownership record. It was preserved; ownership must be established before
  adding it to a user's library.
- Email sending is disabled. Registration persists pending accounts, but users
  cannot receive verification emails until email delivery is configured/enabled.
- Backend tests verify password hashing, timestamps, exact uploaded bytes,
  ownership isolation, and persistence through an independent database connection.

## Backup and recovery

Git does not back up the database or private uploads. No automated backup or
restore procedure was verified in this audit. Before public launch, configure
private off-device backups with retention and perform a restore drill.

A complete application backup needs a MongoDB dump (using `mongodump`), the
`uploads/` directory, and the website's `content-images/` directory. Store the
private environment configuration separately and securely. Stop API writes while
capturing the database and directories to keep their references consistent.
Restore using `mongorestore` into an isolated database with copies of the matching
directories, then verify account counts, ownership, file sizes and library access
before relying on the backup. Do not restore over the active database to test it.
