import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import newsletterConfirmationRequestedHandler from "../newsletter-confirmation-requested"

describe("newsletter confirmation requested subscriber", () => {
  const originalEnvironment = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnvironment }
    jest.restoreAllMocks()
  })

  it("sends the confirmation link without storing the raw token in the idempotency key", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@example.com"
    process.env.CONTACT_REPLY_TO_EMAIL = "contact@example.com"
    process.env.STOREFRONT_URL = "https://shoreandgrace.example"

    const createNotifications = jest.fn().mockResolvedValue({ id: "noti_01" })
    const logger = { error: jest.fn() }
    const container = {
      resolve: jest.fn((key: string) => {
        if (key === Modules.NOTIFICATION) {
          return { createNotifications }
        }
        if (key === ContainerRegistrationKeys.LOGGER) {
          return logger
        }
        throw new Error(`Unexpected container key: ${key}`)
      }),
    }

    await newsletterConfirmationRequestedHandler({
      event: {
        data: {
          id: "newsletter_01",
          email: "customer@example.com",
          should_send: true,
          confirmation_token: "raw-token-value",
          confirmation_token_hash: "hashed-token-value",
        },
      },
      container,
    } as never)

    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "customer@example.com",
        from: "notifications@example.com",
        idempotency_key:
          "newsletter_01:hashed-token-value:confirmation:v1",
        content: expect.objectContaining({
          html: expect.stringContaining(
            "https://shoreandgrace.example/gb/newsletter/confirm?token=raw-token-value"
          ),
          text: expect.stringContaining(
            "https://shoreandgrace.example/gb/newsletter/confirm?token=raw-token-value"
          ),
        }),
      })
    )
    expect(
      createNotifications.mock.calls[0][0].idempotency_key
    ).not.toContain("raw-token-value")
    expect(logger.error).not.toHaveBeenCalled()
  })

  it("does not send when the workflow says no confirmation is needed", async () => {
    const createNotifications = jest.fn()
    const container = {
      resolve: jest.fn((key: string) => {
        if (key === Modules.NOTIFICATION) {
          return { createNotifications }
        }
        if (key === ContainerRegistrationKeys.LOGGER) {
          return { error: jest.fn() }
        }
        throw new Error(`Unexpected container key: ${key}`)
      }),
    }

    await newsletterConfirmationRequestedHandler({
      event: {
        data: {
          id: "newsletter_01",
          email: "customer@example.com",
          should_send: false,
        },
      },
      container,
    } as never)

    expect(createNotifications).not.toHaveBeenCalled()
  })
})
