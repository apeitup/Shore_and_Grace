import { PostAdminNewsletterBatchSchema } from "../batch/route"
import { PostAdminNewsletterExportSchema } from "../export/route"

describe("newsletter bulk action schemas", () => {
  it("accepts a bounded bulk delete request", () => {
    expect(
      PostAdminNewsletterBatchSchema.parse({
        action: "delete",
        ids: ["news_01", "news_02"],
      }),
    ).toEqual({
      action: "delete",
      ids: ["news_01", "news_02"],
    })
  })

  it("rejects bulk actions without selected records", () => {
    expect(
      PostAdminNewsletterBatchSchema.safeParse({
        action: "delete",
        ids: [],
      }).success,
    ).toBe(false)
    expect(
      PostAdminNewsletterExportSchema.safeParse({ ids: [] }).success,
    ).toBe(false)
  })

  it("limits bulk actions to 500 records", () => {
    const ids = Array.from({ length: 501 }, (_, index) => `news_${index}`)

    expect(
      PostAdminNewsletterBatchSchema.safeParse({
        action: "delete",
        ids,
      }).success,
    ).toBe(false)
    expect(PostAdminNewsletterExportSchema.safeParse({ ids }).success).toBe(
      false,
    )
  })
})
