import { model } from "@medusajs/framework/utils"

const BlockedDeliveryDate = model.define("blocked_delivery_date", {
  id: model.id().primaryKey(),
  date: model.text().index("IDX_BLOCKED_DELIVERY_DATE"),
  fulfillment_type: model.enum(["delivery", "collection", "all"]).default("all"),
  reason: model.text().nullable(),
})

export default BlockedDeliveryDate
