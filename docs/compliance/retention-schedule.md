# Retention schedule

Status: proposed schedule. The owner must confirm financial/legal periods with
an accountant or legal adviser before these values are used for automated
deletion.

| ID          | Record                                                                           | Proposed period / trigger                                                                         | End-of-period action                                                           | Owner confirmation                                 |
| ----------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- |
| `WEB-01`    | Cookie consent preference                                                        | 180 days on the device                                                                            | Expire and request a fresh choice                                              | Implemented                                        |
| `SEC-01`    | Web, security and application logs                                               | 90 days unless retained for an active incident                                                    | Delete or irreversibly aggregate                                               | Required                                           |
| `ACC-01`    | Active customer profile and addresses                                            | Account lifetime                                                                                  | Delete after closure except data linked to retained legal records              | Implemented in part; verify all processors/backups |
| `ACC-02`    | Unverified registration data                                                     | 7 days; browser pending-registration cookie expires after 24 hours                                | Delete the unverified identity and temporary data                              | Automation required                                |
| `CART-01`   | Abandoned baskets                                                                | 30 days after last activity                                                                       | Delete or anonymise                                                            | Automation required                                |
| `ORD-01`    | Completed order, refund, tax and accounting records                              | Provisional: six years after the relevant financial period; confirm for the business's legal form | Delete or anonymise fields not legally required                                | Accountant confirmation required                   |
| `DEL-01`    | Recipient operational contact and delivery details outside the core order record | 90 days after completed delivery or resolution of a complaint                                     | Delete or anonymise                                                            | Automation required                                |
| `GIFT-01`   | Gift messages and detailed delivery instructions                                 | 90 days after completed delivery                                                                  | Delete message/instructions while retaining only necessary order evidence      | Automation required                                |
| `PAY-01`    | Payment identifiers and dispute/refund evidence                                  | Align with `ORD-01`, card data excluded                                                           | Delete with financial record; payment provider follows its own schedule        | Processor confirmation required                    |
| `PREF-01`   | Wishlist, occasions and shopping preferences                                     | Until removed by the customer or account closure                                                  | Delete                                                                         | Implemented for account deletion; verify backups   |
| `REV-01`    | Product reviews                                                                  | While relevant to the product/store; review annually                                              | Delete or retain content in anonymised form                                    | Anonymisation implemented on account deletion      |
| `SUP-01`    | General support correspondence                                                   | Two years after the matter closes, longer only for an active dispute                              | Delete                                                                         | Required                                           |
| `MKT-01`    | Active marketing preference and consent evidence                                 | Until withdrawal or the permission is no longer relied on                                         | Stop marketing and move minimum address/channel data to suppression            | Workflow/provider required                         |
| `MKT-02`    | Marketing suppression record                                                     | While needed to honour the opt-out                                                                | Retain minimum hashed or plain contact/channel necessary to prevent re-contact | Provider/process required                          |
| `RIGHTS-01` | Rights request log and response evidence                                         | Three years after closure, subject to legal review                                                | Delete or anonymise                                                            | Required                                           |
| `INC-01`    | Personal-data incident record                                                    | Six years after closure, subject to legal review                                                  | Secure deletion                                                                | Required                                           |
| `BACKUP-01` | Encrypted backups                                                                | Rolling 30–90 day window                                                                          | Automatic overwrite; deleted records must not be restored into live use        | Hosting confirmation required                      |

## Automation requirements

Do not create deletion jobs until the owner-confirmation column is resolved.
When implemented, jobs must:

1. log counts and record types, not deleted personal content;
2. support a legal hold for active disputes or regulatory requirements;
3. be idempotent and testable against non-production data;
4. cover custom Medusa modules as well as core customer, cart and order data;
5. document how expired backup copies are handled.
