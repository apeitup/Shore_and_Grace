# Privacy and PECR launch gate

Do not describe the store as compliant until every launch-blocking item has an
owner, evidence and a completion date.

## Business decisions

- [ ] Record the controller's legal name, postal address and contact email.
- [ ] Complete the ICO fee self-assessment and record the result.
- [ ] Approve the lawful basis for every row in the processing register.
- [ ] Approve the retention schedule with an accountant or legal adviser.
- [ ] Assign owners for rights requests, security incidents and annual review.
- [ ] Decide whether marketing uses consent only or a documented soft opt-in.

## Public information

- [x] Replace the storefront privacy-policy placeholder with a full working
      notice.
- [ ] Add the confirmed controller legal name and postal address to that notice.
- [x] Publish a cookie inventory and permanent Cookie settings control.
- [ ] Insert the final processor list and international-transfer safeguards.
- [ ] Add short, just-in-time privacy text beside checkout, account, recipient,
      review, occasion and newsletter collection points.

## Cookies and tracking

- [x] Optional categories default off and require a positive choice.
- [x] Accept and decline are equally available.
- [x] Personalisation storage is gated and cleared on withdrawal.
- [x] PostHog cannot initialise, persist analytics identifiers or transmit
      analytics data until analytics consent is active; session replay, surveys
      and autocapture are disabled.
- [x] Withdrawing analytics consent calls PostHog's opt-out mechanism and
      disables its persistence.
- [x] Commerce analytics use a central event/property allowlist and exclude
      customer and recipient identity, contact, address, instruction and gift
      message fields.
- [x] Product Analytics and Web Analytics are configured without autocapture,
      heatmaps, web-vitals capture, session replay or surveys.
- [ ] Add the PostHog project token and the correct EU or US host to the
      production environment.
- [ ] Generate and sign the PostHog DPA, record the selected cloud region and
      review its subprocessors and international-transfer position.
- [x] No advertising scripts were found in the storefront on 28 October 2026.
- [ ] Run a production-domain cookie scan before launch, including checkout and
      Stripe payment UI.
- [ ] Add a consent-gated integration and withdrawal cleanup for every future
      analytics or marketing vendor before its script is enabled.

## Individual rights

- [x] Authenticated account data download and deletion controls exist.
- [ ] Verify exports include every Medusa module and every production processor.
- [ ] Test deletion through live systems, retained order records and backups.
- [ ] Publish a route for requests from guests and gift recipients.
- [ ] Create an internal request log, identity-check process and one-month timer.
- [ ] Document correction, restriction, objection and portability handling.

## Marketing

- [ ] Connect newsletter forms to an approved provider or remove submission
      controls until they work.
- [ ] Store consent wording/version, source, time and communication channel.
- [ ] Add one-click unsubscribe without requiring an account.
- [ ] Maintain and test a suppression list.
- [ ] Import holding-page subscribers only with their recorded permission and
      provide the promised communications.

## Security and operations

- [ ] Require MFA for production admin and infrastructure access.
- [ ] Restrict roles to the minimum access needed and review them periodically.
- [ ] Confirm encryption, secret management, patching and tested restoration.
- [ ] Confirm processor contracts and breach-notification clauses.
- [ ] Adopt an incident register and a documented 72-hour assessment process.
- [ ] Implement approved retention and deletion jobs.
- [ ] Perform and retain a final launch audit covering cookies, forms, orders,
      exports, deletion and provider data flows.
