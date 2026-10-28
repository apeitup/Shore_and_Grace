# Processor and data-sharing register

Status: provider-discovery checklist. Do not mark a provider approved until its
contract, location, security information and international transfer position
have been reviewed.

| Service                         | Current evidence                                                                    | Data involved                                                         | Contract / DPA                                                                                  | Location and transfer safeguard                                                      | Status                 |
| ------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------- |
| Production hosting and database | VPS deployment configuration exists; final commerce hosting not confirmed           | All storefront/backend data, logs and backups                         | Required                                                                                        | Confirm data centres and support access                                              | Open                   |
| Stripe / payment provider       | Stripe client integration exists; production provider not confirmed                 | Transaction, device, fraud and payment data                           | Stripe services agreement/DPA                                                                   | Confirm UK/EEA processing and safeguards for other locations                         | Open                   |
| Transactional email             | Provider not configured in the inspected storefront                                 | Email, name, verification, order and delivery content                 | Required                                                                                        | Confirm before enabling                                                              | Open                   |
| Newsletter / marketing email    | Holding-page signup is self-hosted; future provider not configured                  | Email, consent evidence, preferences and suppression                  | Required                                                                                        | Confirm before migrating subscribers                                                 | Open                   |
| Delivery/courier                | No final external courier identified                                                | Recipient name, address, phone and delivery notes                     | Required if processing on behalf of Shore & Grace; document controller sharing where applicable | Confirm before integration                                                           | Open                   |
| PostHog analytics               | Consent-gated pageview integration added; project token and host not yet configured | Anonymous identifier, URL, referrer, device/browser and pageview time | Generate and sign the PostHog Cloud DPA in the PostHog legal dashboard before production        | Confirm whether the account uses EU or US Cloud and record the applicable safeguards | Configured, not active |
| Advertising                     | No scripts found in storefront                                                      | Would include online identifiers and event data                       | Required before enabling                                                                        | Confirm before enabling                                                              | Not enabled            |
| Error monitoring/support        | No final provider identified                                                        | Logs, account/order context and support messages                      | Required before enabling                                                                        | Confirm before enabling                                                              | Open                   |

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
