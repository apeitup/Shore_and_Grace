import type {
  INotificationModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { renderOccasionReminderEmail } from "../emails"
import { CUSTOMER_PREFERENCES_MODULE } from "../modules/customer-preferences"
import CustomerPreferencesModuleService from "../modules/customer-preferences/service"
import { SPECIAL_OCCASION_MODULE } from "../modules/special-occasion"
import SpecialOccasionModuleService from "../modules/special-occasion/service"
import {
  isOccasionReminderDue,
  resolveNextOccasionDate,
  resolveNextPersonalOccasionDate,
} from "../utils/occasion-dates"

type CustomerOccasionRecord = {
  id: string
  customer_id: string
  system_occasion_id?: string | null
  name: string
  occasion_date?: string | null
  reminder_days: number
  enabled: boolean
  repeats_annually: boolean
}

type SystemOccasionRecord = {
  id: string
  date_type: "fixed" | "easter" | "mothering_sunday" | "fathers_day"
  month?: number | null
  day?: number | null
}

type CustomerRecord = {
  id: string
  email?: string | null
  first_name?: string | null
}

const storefrontUrl = () =>
  (process.env.STOREFRONT_URL || "http://localhost:8000").replace(/\/$/, "")

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`))

const occurrenceFor = (
  occasion: CustomerOccasionRecord,
  systemOccasions: Map<string, SystemOccasionRecord>,
  today: Date
) => {
  if (occasion.system_occasion_id) {
    const systemOccasion = systemOccasions.get(occasion.system_occasion_id)
    return systemOccasion
      ? resolveNextOccasionDate(systemOccasion, today)
      : null
  }

  return occasion.occasion_date
    ? resolveNextPersonalOccasionDate(
        occasion.occasion_date,
        occasion.repeats_annually,
        today
      )
    : null
}

export default async function occasionRemindersJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const from = process.env.NOTIFICATION_FROM_EMAIL

  if (!from) {
    logger.info(
      "[occasion-reminders] Skipped because NOTIFICATION_FROM_EMAIL is not configured."
    )
    return
  }

  const specialOccasionService: SpecialOccasionModuleService =
    container.resolve(SPECIAL_OCCASION_MODULE)
  const preferencesService: CustomerPreferencesModuleService =
    container.resolve(CUSTOMER_PREFERENCES_MODULE)
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const replyTo = process.env.CONTACT_REPLY_TO_EMAIL
  const today = new Date()
  const [customerOccasions, systemOccasionRows] = await Promise.all([
    specialOccasionService.listCustomerOccasions({ enabled: true }),
    specialOccasionService.listSystemOccasions({ active: true }),
  ])
  const systemOccasions = new Map(
    (systemOccasionRows as SystemOccasionRecord[]).map((occasion) => [
      occasion.id,
      occasion,
    ])
  )

  for (const occasion of customerOccasions as CustomerOccasionRecord[]) {
    try {
      const occurrenceDate = occurrenceFor(occasion, systemOccasions, today)

      if (
        !occurrenceDate ||
        !isOccasionReminderDue(
          occurrenceDate,
          occasion.reminder_days,
          today
        )
      ) {
        continue
      }

      const [preferences] =
        await preferencesService.listCustomerPreferences({
          customer_id: occasion.customer_id,
        })

      if (preferences && !preferences.occasion_reminders) {
        continue
      }

      const { data } = await query.graph({
        entity: "customer",
        fields: ["id", "email", "first_name"],
        filters: { id: occasion.customer_id },
      })
      const customer = data[0] as CustomerRecord | undefined

      if (!customer?.email) {
        continue
      }

      await notificationService.createNotifications({
        to: customer.email,
        from,
        channel: "email",
        template: "occasion-reminder",
        content: renderOccasionReminderEmail({
          recipientName: customer.first_name || "there",
          occasionName: occasion.name,
          occasionDate: formatDate(occurrenceDate),
          actionUrl: `${storefrontUrl()}/gb/store`,
        }),
        provider_data: replyTo ? { reply_to: replyTo } : undefined,
        trigger_type: "occasion.reminder_due",
        resource_id: occasion.id,
        resource_type: "customer_occasion",
        idempotency_key: `${occasion.id}:${occurrenceDate}:reminder:v1`,
      })
    } catch (error) {
      logger.error(
        `[occasion-reminders] Failed for ${occasion.id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      )
    }
  }
}

export const config = {
  name: "occasion-reminders",
  schedule: "0 8 * * *",
}
