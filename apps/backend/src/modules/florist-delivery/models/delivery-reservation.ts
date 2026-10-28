import { model } from "@medusajs/framework/utils"

const DeliveryReservation = model
  .define("delivery_reservation", {
    id: model.id().primaryKey(),
    cart_id: model.text().index("IDX_DELIVERY_RESERVATION_CART_ID"),
    order_id: model.text().nullable(),
    zone_id: model.text(),
    zone_name: model.text(),
    fulfillment_type: model.enum(["delivery", "collection"]),
    postcode: model.text().nullable(),
    delivery_date: model.text().index("IDX_DELIVERY_RESERVATION_DATE"),
    delivery_window: model.text().nullable(),
    shipping_option_id: model.text().nullable(),
    fee: model.number().default(0),
    currency_code: model.text().default("gbp"),
    status: model.enum(["held", "confirmed", "cancelled"]).default("held"),
  })
  .indexes([
    {
      name: "IDX_DELIVERY_RESERVATION_CART_UNIQUE",
      on: ["cart_id"],
      unique: true,
      where: { deleted_at: null },
    },
    {
      name: "IDX_DELIVERY_RESERVATION_ORDER_ID",
      on: ["order_id"],
      where: { deleted_at: null },
    },
  ])

export default DeliveryReservation
