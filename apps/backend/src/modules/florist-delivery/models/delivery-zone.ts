import { model } from "@medusajs/framework/utils"

const DeliveryZone = model.define("delivery_zone", {
  id: model.id().primaryKey(),
  name: model.text(),
  fulfillment_type: model.enum(["delivery", "collection"]).default("delivery"),
  postcode_patterns: model.json().default({ values: [] }),
  shipping_option_id: model.text().nullable(),
  currency_code: model.text().default("gbp"),
  fee: model.number().default(0),
  minimum_lead_days: model.number().default(1),
  same_day_cutoff: model.text().nullable(),
  daily_capacity: model.number().default(20),
  allowed_weekdays: model.json().default({ values: [1, 2, 3, 4, 5, 6] }),
  delivery_window: model.text().nullable(),
  active: model.boolean().default(true),
})

export default DeliveryZone
