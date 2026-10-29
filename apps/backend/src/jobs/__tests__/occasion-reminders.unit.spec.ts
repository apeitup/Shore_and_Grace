import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { CUSTOMER_PREFERENCES_MODULE } from "../../modules/customer-preferences"
import { SPECIAL_OCCASION_MODULE } from "../../modules/special-occasion"
import occasionRemindersJob from "../occasion-reminders"

describe("occasion reminders job", () => {
  const originalEnvironment = { ...process.env }

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-12-04T08:00:00Z"))
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    process.env.CONTACT_REPLY_TO_EMAIL = "contact@shoreandgrace.com"
    process.env.STOREFRONT_URL = "https://shoreandgrace.com"
  })

  afterEach(() => {
    jest.useRealTimers()
    process.env = { ...originalEnvironment }
    jest.restoreAllMocks()
  })

  const createContainer = (occasionReminders = true) => {
    const createNotifications = jest.fn().mockResolvedValue({ id: "noti_01" })
    const container = {
      resolve: jest.fn((key: string) => {
        if (key === ContainerRegistrationKeys.LOGGER) {
          return { info: jest.fn(), error: jest.fn() }
        }
        if (key === SPECIAL_OCCASION_MODULE) {
          return {
            listCustomerOccasions: jest.fn().mockResolvedValue([
              {
                id: "customer_occasion_01",
                customer_id: "cus_01",
                system_occasion_id: "system_occasion_01",
                name: "Christmas Day",
                reminder_days: 21,
                enabled: true,
                repeats_annually: true,
              },
            ]),
            listSystemOccasions: jest.fn().mockResolvedValue([
              {
                id: "system_occasion_01",
                date_type: "fixed",
                month: 12,
                day: 25,
              },
            ]),
          }
        }
        if (key === CUSTOMER_PREFERENCES_MODULE) {
          return {
            listCustomerPreferences: jest.fn().mockResolvedValue([
              { occasion_reminders: occasionReminders },
            ]),
          }
        }
        if (key === Modules.NOTIFICATION) {
          return { createNotifications }
        }
        if (key === ContainerRegistrationKeys.QUERY) {
          return {
            graph: jest.fn().mockResolvedValue({
              data: [
                {
                  id: "cus_01",
                  email: "troy@example.com",
                  first_name: "Troy",
                },
              ],
            }),
          }
        }
        throw new Error(`Unexpected container key: ${key}`)
      }),
    }

    return { container, createNotifications }
  }

  it("sends a due reminder with an annual idempotency key", async () => {
    const { container, createNotifications } = createContainer()

    await occasionRemindersJob(container as never)

    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "troy@example.com",
        template: "occasion-reminder",
        idempotency_key:
          "customer_occasion_01:2026-12-25:reminder:v1",
        content: expect.objectContaining({
          text: expect.stringContaining("Christmas Day"),
        }),
      })
    )
  })

  it("does not send when occasion reminders are disabled", async () => {
    const { container, createNotifications } = createContainer(false)

    await occasionRemindersJob(container as never)

    expect(createNotifications).not.toHaveBeenCalled()
  })
})
