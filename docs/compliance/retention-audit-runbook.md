# Retention audit runbook

Status: report-only operational control. This process does not delete or
anonymise any record.

## Purpose

The retention audit identifies records that may need review under the proposed
retention schedule without applying unapproved deletion periods. Its output
contains counts and rule names only, never customer, purchaser or recipient
details.

The current report covers:

- carts not completed and not updated for 30 days;
- open rights requests whose response deadline has passed;
- completed or rejected rights requests older than the proposed three-year
  period.

The cart and closed-rights periods remain proposals. A reported candidate is
not authority to delete it.

## Manual run

From `apps/backend` run:

```bash
pnpm exec medusa exec ./src/scripts/run-privacy-retention-audit.ts
```

The command writes one structured `[privacy-retention-audit]` entry to the
application log. Record the run date, environment, counts and reviewer in the
launch evidence without copying personal data.

## Scheduled report

The backend contains a daily read-only job scheduled for 03:15. It runs only
when `PRIVACY_RETENTION_AUDIT_ENABLED=true`. Leave this false until the
production logging destination, alert owner and review process are confirmed.

The job is intentionally low-frequency and performs count queries with a
one-row result limit. It does not run a deletion workflow.

## Review and escalation

1. Investigate overdue rights requests immediately using the Admin privacy
   queue.
2. Review abandoned-cart counts for unexpected growth or broken checkout
   flows. Do not delete carts until `CART-01` is approved.
3. Review old closed rights-request candidates against legal holds and the
   approved `RIGHTS-01` period.
4. Do not place personal data, references, emails or order numbers into audit
   logs or monitoring alerts.
5. Escalate unexpected count changes, failed reports or missed scheduled runs
   to the privacy and technical owners.

## Deliberate exclusions

- Unverified registration cleanup needs a durable pending-registration marker
  so it cannot delete another kind of authentication identity.
- Delivery and gift-message cleanup needs an actual delivery-completion
  timestamp; the requested delivery date is not sufficient evidence.
- Order, payment, support, log and incident periods need owner approval.
- Processor and backup deletion must use the provider-specific procedures in
  the processor register and hosting documentation.

These gaps are launch actions, not reasons to guess or perform broad deletion.
