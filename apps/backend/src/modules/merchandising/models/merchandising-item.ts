import { model } from "@medusajs/framework/utils"

const MerchandisingItem = model
  .define("merchandising_item", {
    id: model.id().primaryKey(),
    set_id: model.text().index("IDX_MERCHANDISING_ITEM_SET_ID"),
    product_id: model.text().index("IDX_MERCHANDISING_ITEM_PRODUCT_ID"),
    position: model.number().default(0),
  })
  .indexes([
    {
      name: "IDX_MERCHANDISING_ITEM_SET_PRODUCT_UNIQUE",
      on: ["set_id", "product_id"],
      unique: true,
      where: { deleted_at: null },
    },
  ])

export default MerchandisingItem
