import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import reviewRequestsJob from "../review-requests"

describe("review requests job", () => {
  const originalEnvironment = { ...process.env }

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-10-30T09:00:00Z"))
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    process.env.CONTACT_REPLY_TO_EMAIL = "contact@shoreandgrace.com"
    process.env.STOREFRONT_URL = "https://shoreandgrace.com"
  })

  afterEach(() => {
    jest.useRealTimers()
    process.env = { ...originalEnvironment }
    jest.restoreAllMocks()
  })

  it("requests one review per delivered product with stable idempotency", async () => {
    const createNotifications = jest.fn().mockResolvedValue({ id: "noti_01" })
    const graph = jest
      .fn()
      .mockResolvedValueOnce({
        data: [
          {
            id: "ful_01",
            delivered_at: "2026-10-27T12:00:00Z",
            order: { id: "order_01" },
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: "order_01",
            display_id: 42,
            email: "troy@example.com",
            billing_address: { first_name: "Troy" },
            items: [
              {
                product_id: "prod_01",
                product_handle: "pearly-everlasting",
                title: "Pearly Everlasting",
              },
            ],
          },
        ],
      })
    const container = {
      resolve: jest.fn((key: string) => {
        if (key === ContainerRegistrationKeys.LOGGER) {
          return { info: jest.fn(), error: jest.fn() }
        }
        if (key === ContainerRegistrationKeys.QUERY) {
          return { graph }
        }
        if (key === Modules.NOTIFICATION) {
          return { createNotifications }
        }
        throw new Error(`Unexpected container key: ${key}`)
      }),
    }

    await reviewRequestsJob(container as never)

    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "troy@example.com",
        template: "review-request",
        idempotency_key: "order_01:prod_01:review-request:v1",
        content: expect.objectContaining({
          html: expect.stringContaining(
            "https://shoreandgrace.com/gb/products/pearly-everlasting#reviews"
          ),
        }),
      })
    )
  })
})
