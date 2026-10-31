import { model } from "@medusajs/framework/utils"

const MerchandisingSet = model
  .define("merchandising_set", {
    id: model.id().primaryKey(),
    name: model.text(),
    handle: model.text().index("IDX_MERCHANDISING_SET_HANDLE"),
    kind: model.enum([
      "featured",
      "upsell",
      "complementary",
      "frequently_bought_together",
    ]),
    source_product_id: model.text().nullable(),
    strategy: model.enum(["manual", "automatic"]).default("manual"),
    active: model.boolean().default(true),
  })
  .indexes([
    {
      name: "IDX_MERCHANDISING_SET_HANDLE_UNIQUE",
      on: ["handle"],
      unique: true,
      where: { deleted_at: null },
    },
    {
      name: "IDX_MERCHANDISING_SET_SOURCE_PRODUCT_ID",
      on: ["source_product_id"],
      where: { deleted_at: null },
    },
  ])

export default MerchandisingSet
