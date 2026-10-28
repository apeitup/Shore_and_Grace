import { model } from "@medusajs/framework/utils"

const SystemOccasion = model
  .define("system_occasion", {
    id: model.id().primaryKey(),
    name: model.text(),
    slug: model.text().index("IDX_SYSTEM_OCCASION_SLUG"),
    date_type: model.enum([
      "fixed",
      "easter",
      "mothering_sunday",
      "fathers_day",
    ]),
    month: model.number().nullable(),
    day: model.number().nullable(),
    default_reminder_days: model.number().default(14),
    enabled_by_default: model.boolean().default(false),
    active: model.boolean().default(true),
    description: model.text().nullable(),
    sort_order: model.number().default(0),
  })
  .indexes([
    {
      name: "IDX_SYSTEM_OCCASION_SLUG_UNIQUE",
      on: ["slug"],
      unique: true,
      where: { deleted_at: null },
    },
  ])

export default SystemOccasion
