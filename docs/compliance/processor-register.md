# Processor and data-sharing register

Status: provider-discovery checklist. Do not mark a provider approved until its
contract, location, security information and international transfer position
have been reviewed.

| Service                         | Current evidence                                                                    | Data involved                                                         | Contract / DPA                                                                                  | Location and transfer safeguard                                                      | Status                 |
| ------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------- |
| Storefront hosting              | Next.js storefront exists; final production platform is not configured in repository | Requests, IP/device data, storefront logs and any edge-cache content | Required if a third party hosts or supports it                                                   | Confirm data centres, support access, logs and backups                               | Open                   |
| Medusa backend and PostgreSQL   | Self-hostable Medusa backend with PostgreSQL configuration; final production host is not confirmed | Customer, recipient, order, account and custom-module records         | Required if hosted or administered by a third party                                             | Confirm database region, administrator access, encryption and backup locations       | Open                   |
| Redis/cache                     | Backend supports a configured Redis URL; production use and provider are not confirmed | Sessions, cache entries and transient workflow/security state         | Required if externally hosted                                                                  | Confirm region, persistence, backups and eviction/deletion behaviour                 | Open                   |
| File/image storage              | Local/demo images and optional Medusa Cloud S3 hostname support exist; production storage is not confirmed | Product media and any future uploaded files                           | Required if externally hosted                                                                  | Confirm bucket region, access logs, lifecycle rules and public/private boundaries    | Open                   |
| Stripe / payment provider       | Stripe client integration exists; production Medusa payment provider is not confirmed | Transaction, device, fraud and payment data                           | Stripe services agreement/DPA                                                                  | Confirm UK/EEA processing and safeguards for other locations                         | Open                   |
| Transactional email             | Provider not configured in the inspected storefront                                 | Email, name, verification, order and delivery content                 | Required                                                                                        | Confirm before enabling                                                              | Open                   |
| Newsletter / marketing email    | Holding-page signup is self-hosted; future provider not configured                  | Email, consent evidence, preferences and suppression                  | Required                                                                                        | Confirm before migrating subscribers                                                 | Open                   |
| Delivery/courier                | No final external courier identified                                                | Recipient name, address, phone and delivery notes                     | Required if processing on behalf of Shore & Grace; document controller sharing where applicable | Confirm before integration                                                           | Open                   |
| PostHog analytics               | EU Cloud project configured locally; consent-gated pageviews and allowlisted commerce events implemented | Anonymous identifier, URL, referrer, device/browser, product/variant identifiers, prices, quantities, currency, country code, checkout step and event time | Generate and sign the PostHog Cloud DPA in the PostHog legal dashboard before production | EU Cloud selected; review subprocessors and applicable safeguards before launch | Development configured; production inactive |
| Advertising                     | No scripts found in storefront                                                      | Would include online identifiers and event data                       | Required before enabling                                                                        | Confirm before enabling                                                              | Not enabled            |
| Error monitoring/support        | No final provider identified                                                        | Logs, account/order context and support messages                      | Required before enabling                                                                        | Confirm before enabling                                                              | Open                   |

## Evidence still required before approval

For every provider record the legal entity, product, account/project owner,
contract date, DPA link or signed copy, subprocessor-list review date, primary
processing region, transfer mechanism where relevant, retention configuration,
deletion/export procedure, breach-notification term and annual review date.

Repository evidence confirms whether an integration exists; it does not prove
that a production account, contract, region or retention setting is approved.

## Approval checklist for each provider

- Purpose and instructions are documented.
- Only necessary fields are shared.
- Article 28 terms or other appropriate controller terms are in place.
- Sub-processors are disclosed and reviewed.
- Hosting locations and any UK international transfer mechanism are recorded.
- Security, access control, encryption, resilience, backup and breach-notice
  commitments are adequate.
- Retention, deletion/return and end-of-contract arrangements are documented.
- The public privacy and cookie notices name or describe the provider clearly.
