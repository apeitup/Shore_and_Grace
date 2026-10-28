# Shore & Grace privacy compliance register

Status: working implementation record, last reviewed 28 October 2026.

This folder records the decisions and evidence needed to operate the Shore &
Grace store under UK data protection law and PECR. It supports compliance but
is not a substitute for legal advice.

## Before production launch

The business owner must confirm:

- the controller's full legal name and postal address;
- whether the business has completed the ICO fee self-assessment and any
  required registration;
- the final production hosting, email, payment, delivery, analytics and support
  providers;
- the PostHog Cloud region and countersigned DPA;
- the final retention periods with the business's accountant or legal adviser;
- whether marketing will use consent only or the customer soft opt-in;
- the international transfer mechanism used by each non-UK processor;
- the person responsible for rights requests and personal-data incidents.

## Files

- `data-processing-register.md` maps processing purposes and lawful bases.
- `retention-schedule.md` lists proposed deletion and review periods.
- `retention-audit-runbook.md` explains the count-only retention report and its
  deliberate deletion safeguards.
- `processor-register.md` records suppliers and contract checks.
- `rights-request-runbook.md` defines intake, identity checks, handling and
  completion of individual-rights requests.
- `launch-checklist.md` is the evidence-led launch gate.

Review this folder whenever a provider, cookie, form, payment method or use of
customer information changes.
