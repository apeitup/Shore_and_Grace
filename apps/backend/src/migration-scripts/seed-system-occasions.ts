import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createSystemOccasionWorkflow } from "../workflows/create-system-occasion"

const defaults = [
  {
    name: "Valentine’s Day",
    slug: "valentines-day",
    date_type: "fixed" as const,
    month: 2,
    day: 14,
    sort_order: 10,
    enabled_by_default: true,
    description: "A reminder for Valentine’s Day.",
  },
  {
    name: "Mothering Sunday",
    slug: "mothering-sunday",
    date_type: "mothering_sunday" as const,
    sort_order: 20,
    enabled_by_default: true,
    description: "The fourth Sunday of Lent in the United Kingdom.",
  },
  {
    name: "International Women’s Day",
    slug: "international-womens-day",
    date_type: "fixed" as const,
    month: 3,
    day: 8,
    sort_order: 30,
    description: "International Women’s Day.",
  },
  {
    name: "Easter Sunday",
    slug: "easter-sunday",
    date_type: "easter" as const,
    sort_order: 40,
    description: "The calculated Western Easter Sunday date.",
  },
  {
    name: "Father’s Day",
    slug: "fathers-day",
    date_type: "fathers_day" as const,
    sort_order: 50,
    description: "The third Sunday in June.",
  },
  {
    name: "Christmas Day",
    slug: "christmas-day",
    date_type: "fixed" as const,
    month: 12,
    day: 25,
    sort_order: 60,
    default_reminder_days: 21,
    description: "A reminder for Christmas Day.",
  },
]

export default async function seedSystemOccasions({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  for (const occasion of defaults) {
    await createSystemOccasionWorkflow(container).run({
      input: {
        default_reminder_days: 14,
        enabled_by_default: false,
        active: true,
        ...occasion,
      },
    })
  }
  logger.info("Ensured default special occasions are available.")
}
