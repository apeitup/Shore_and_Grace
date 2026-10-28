import { model } from "@medusajs/framework/utils"

const GiftOrderDetails = model
  .define("gift_order_details", {
    id: model.id().primaryKey(),
    cart_id: model.text().index("IDX_GIFT_ORDER_DETAILS_CART_ID"),
    order_id: model.text().nullable(),
    recipient_type: model.enum(["self", "other"]).default("other"),
    recipient_first_name: model.text().nullable(),
    recipient_last_name: model.text().nullable(),
    recipient_phone: model.text().nullable(),
    purchaser_first_name: model.text().nullable(),
    purchaser_last_name: model.text().nullable(),
    purchaser_phone: model.text().nullable(),
    purchaser_email: model.text().nullable(),
    gift_message: model.text().nullable(),
    delivery_instructions: model.text().nullable(),
    leave_safe: model.boolean().default(false),
    hide_prices: model.boolean().default(true),
    anonymous_sender: model.boolean().default(false),
  })
  .indexes([
    {
      name: "IDX_GIFT_ORDER_DETAILS_CART_UNIQUE",
      on: ["cart_id"],
      unique: true,
      where: { deleted_at: null },
    },
    {
      name: "IDX_GIFT_ORDER_DETAILS_ORDER_ID",
      on: ["order_id"],
      where: { deleted_at: null },
    },
  ])

export default GiftOrderDetails
