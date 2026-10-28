import { getPrivacyRetentionAuditCutoffs } from "../privacy-retention-audit"

describe("privacy retention audit cutoffs", () => {
  it("calculates the report-only cart and rights-request cutoffs", () => {
    const cutoffs = getPrivacyRetentionAuditCutoffs(
      new Date("2026-10-28T12:30:00.000Z")
    )

    expect(cutoffs.abandoned_cart_before).toBe(
      "2026-09-28T12:30:00.000Z"
    )
    expect(cutoffs.overdue_rights_request_before).toBe(
      "2026-10-28T12:30:00.000Z"
    )
    expect(cutoffs.closed_rights_request_before).toBe(
      "2023-10-28T12:30:00.000Z"
    )
  })

  it("clamps leap-day year subtraction to the target month", () => {
    const cutoffs = getPrivacyRetentionAuditCutoffs(
      new Date("2024-02-29T08:00:00.000Z")
    )

    expect(cutoffs.closed_rights_request_before).toBe(
      "2021-02-28T08:00:00.000Z"
    )
  })
})
