import { formatContactReplySubject } from "../contact-enquiry"

describe("formatContactReplySubject", () => {
  it("uses the contact message subject", () => {
    expect(
      formatContactReplySubject(
        "Subject: Corrected mailbox acceptance test\n\nPlease help.",
      ),
    ).toBe("Re: Corrected mailbox acceptance test")
  })

  it("does not add a duplicate reply prefix", () => {
    expect(formatContactReplySubject("Subject: Re: Existing thread")).toBe(
      "Re: Existing thread",
    )
  })

  it("uses a helpful fallback for legacy messages", () => {
    expect(formatContactReplySubject("Please help with my order.")).toBe(
      "Re: Your Shore & Grace enquiry",
    )
  })
})
