import { model } from "@medusajs/framework/utils"

const CustomerOccasion = model
  .define("customer_occasion", {
    id: model.id().primaryKey(),
    customer_id: model.text().index("IDX_CUSTOMER_OCCASION_CUSTOMER_ID"),
    system_occasion_id: model.text().nullable(),
    name: model.text(),
    occasion_date: model.text().nullable(),
    reminder_days: model.number().default(14),
    enabled: model.boolean().default(true),
    repeats_annually: model.boolean().default(true),
  })
  .indexes([
    {
      name: "IDX_CUSTOMER_OCCASION_SYSTEM_ID",
      on: ["system_occasion_id"],
      where: { deleted_at: null },
    },
  ])

export default CustomerOccasion
