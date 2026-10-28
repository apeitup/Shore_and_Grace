import { model } from "@medusajs/framework/utils"

const CustomerPreference = model.define("customer_preference", {
  id: model.id().primaryKey(),
  customer_id: model
    .text()
    .unique()
    .index("IDX_CUSTOMER_PREFERENCE_CUSTOMER_ID"),
  personalised_recommendations: model.boolean().default(false),
  remember_delivery_preferences: model.boolean().default(false),
  default_delivery_instructions: model.text().nullable(),
  leave_in_safe_place: model.boolean().default(false),
  hide_prices: model.boolean().default(true),
})

export default CustomerPreference
