# Customer email updates

Company contact: **ironrootsolutions@gmail.com**. The contact page opens a draft
in the visitor's email application; visitors still send that inquiry themselves.

The backend uses Gmail SMTP with the sender name **IronRoot Solutions** and
replies returning to the company mailbox. HTML and plain-text messages cover
upload receipts and queued, printing, paused, completed, canceled, failed, and
shipped print states. Upload receipts explicitly say printing has not started.

## Configure and verify

In `App/iom-backend/.env`, set `SMTP_USER=ironrootsolutions@gmail.com`,
`SMTP_PASS` to a Gmail app password, and initially `EMAIL_ENABLED=false`.
Use [Google's app-password setup](https://support.google.com/mail/answer/185833?hl=en)
with 2-Step Verification enabled. Keep credentials in the ignored local `.env`;
never commit them. Spaces in the app password are removed by the SMTP adapter.

From `App/iom-backend`, run `npm run email:verify`. This authenticates with Gmail
without sending a message. If Google returns `WebLoginRequired`, sign into the
company Gmail account in a browser and complete its security checks, then retry.
Once verification succeeds, set `EMAIL_ENABLED=true`
and restart the backend. Setting it back to `false` pauses automatic processing.
The backend and MongoDB must remain running to process updates.

## What triggers an update

New authenticated uploads persist a pending receipt flag alongside the saved
file. The worker checks every 15 seconds and queues the receipt for the account's
email address. Pre-existing files without that flag are not backfilled. Files
uploaded while email is disabled retain the flag until processing is enabled.

Lifecycle emails require a trusted `PrintJob` record with the correct `userId`
and `notifyCustomer: true`. The worker detects changes to its recorded `status`.
Only opt in a job after confirming ownership; printer filenames alone do not
establish which customer owns a job. Old records default to no notifications.

**The current workspace does not start prints or synchronize printer telemetry
into customer-owned PrintJob records.** This worker is ready for that future
operator workflow, but live printer polling alone does not generate start or
completion emails. Existing legacy execution endpoints remain unmounted.
A shipment email is generated only for a recorded `shipped` status, with an
optional HTTPS `trackingUrl`. Completion does not claim shipment or collection
readiness.

## Delivery and failures

MongoDB's `emailnotifications` collection stores queued messages and delivery
state. Unique event keys prevent duplicate collection of the same upload or job
status. A repeated status on the same job produces at most one notification;
brief intermediate states between polls can be skipped.

The worker claims messages atomically with a five-minute lease, retries temporary
failures with increasing delays, and stops after five attempts. `status: failed`
records require operator review; `lastError` contains an error code rather than
SMTP contents or credentials. Sent messages have `sentAt` and `messageId`.
SMTP delivery is at least once: a crash after SMTP acceptance and before saving
success may cause a retry, even though retries preserve the Message-ID.

`npm test` checks templates and mocked SMTP. `npm run test:integration` checks
queue persistence, deduplication, retry behavior, ownership, and lifecycle opt-in
in an isolated temporary database. These checks never send customer email.
