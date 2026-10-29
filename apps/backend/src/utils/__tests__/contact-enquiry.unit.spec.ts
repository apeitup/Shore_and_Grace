import {
  addRetentionYear,
  contactCategoryLabel,
  createContactEnquiryReference,
  escapeHtml,
} from "../contact-enquiry";

describe("contact enquiry utilities", () => {
  it("creates a date-stamped, non-sequential public reference", () => {
    const reference = createContactEnquiryReference(
      new Date("2026-10-29T09:30:00.000Z"),
    );

    expect(reference).toMatch(/^SG-C-20261029-[A-F0-9]{6}$/);
  });

  it("retains an enquiry for one calendar year", () => {
    expect(addRetentionYear(new Date("2026-10-29T09:30:00.000Z"))).toEqual(
      new Date("2027-10-29T09:30:00.000Z"),
    );
  });

  it("escapes customer-provided text before placing it in an email", () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'test'`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;test&#39;",
    );
  });

  it("uses a safe label for an unknown category", () => {
    expect(contactCategoryLabel("unexpected")).toBe("Other");
  });
});
