import { model } from "@medusajs/framework/utils"

const FaqCategory = model
  .define("faq_category", {
    id: model.id().primaryKey(),
    name: model.text(),
    handle: model.text().index("IDX_FAQ_CATEGORY_HANDLE"),
    description: model.text().nullable(),
    position: model.number().default(0),
    active: model.boolean().default(true),
  })
  .indexes([
    {
      name: "IDX_FAQ_CATEGORY_HANDLE_UNIQUE",
      on: ["handle"],
      unique: true,
      where: { deleted_at: null },
    },
  ])

export default FaqCategory
