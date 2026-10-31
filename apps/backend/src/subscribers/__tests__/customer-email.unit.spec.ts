import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import customerEmailHandler from "../customer-email"

describe("customer email subscriber", () => {
  const originalEnvironment = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnvironment }
    jest.restoreAllMocks()
  })

  const createContainer = () => {
    const createNotifications = jest.fn().mockResolvedValue({ id: "noti_01" })
    const container = {
      resolve: jest.fn((key: string) => {
        if (key === Modules.NOTIFICATION) {
          return { createNotifications }
        }
        if (key === ContainerRegistrationKeys.LOGGER) {
          return { error: jest.fn() }
        }
        if (key === ContainerRegistrationKeys.QUERY) {
          return {
            graph: jest.fn().mockResolvedValue({
              data: [
                {
                  id: "cus_01",
                  email: "troy@example.com",
                  first_name: "Troy",
                  last_name: "Halliday",
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

  it("sends a welcome email when a customer is created", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    process.env.STOREFRONT_URL = "https://shoreandgrace.com"
    const { container, createNotifications } = createContainer()

    await customerEmailHandler({
      event: { name: "customer.created", data: { id: "cus_01" } },
      container,
    } as never)

    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "troy@example.com",
        template: "account-welcome",
        idempotency_key: "cus_01:account-welcome:v1",
        content: expect.objectContaining({
          text: expect.stringContaining("Hello Troy"),
        }),
      }),
    )
  })

  it("uses the verification code in the storefront confirmation link", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    process.env.STOREFRONT_URL = "https://shoreandgrace.com"
    const { container, createNotifications } = createContainer()

    await customerEmailHandler({
      event: {
        name: "auth.verification_requested",
        data: {
          entity_id: "troy@example.com",
          entity_type: "customer",
          code: "verify-token",
        },
      },
      container,
    } as never)

    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "troy@example.com",
        template: "email-verification",
        content: expect.objectContaining({
          html: expect.stringContaining(
            "https://shoreandgrace.com/verify-account?token=verify-token",
          ),
        }),
      }),
    )
  })

  it("uses the reset token in a customer password reset link", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    process.env.STOREFRONT_URL = "https://shoreandgrace.com"
    const { container, createNotifications } = createContainer()

    await customerEmailHandler({
      event: {
        name: "auth.password_reset",
        data: {
          entity_id: "troy@example.com",
          actor_type: "customer",
          token: "reset-token",
        },
      },
      container,
    } as never)

    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "troy@example.com",
        template: "password-reset",
        content: expect.objectContaining({
          html: expect.stringContaining(
            "https://shoreandgrace.com/reset-password?token=reset-token",
          ),
        }),
      }),
    )
  })

  it("ignores password reset events for other actor types", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    const { container, createNotifications } = createContainer()

    await customerEmailHandler({
      event: {
        name: "auth.password_reset",
        data: {
          entity_id: "admin@example.com",
          actor_type: "user",
          token: "reset-token",
        },
      },
      container,
    } as never)

    expect(createNotifications).not.toHaveBeenCalled()
  })

  it("uses the captured address after a customer account is deleted", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    const { container, createNotifications } = createContainer()

    await customerEmailHandler({
      event: {
        name: "customer.account_deleted",
        data: {
          id: "cus_01",
          email: "troy@example.com",
          first_name: "Troy",
        },
      },
      container,
    } as never)

    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "troy@example.com",
        template: "account-deleted",
        trigger_type: "customer.account_deleted",
        content: expect.objectContaining({
          text: expect.stringContaining("Hello Troy"),
        }),
      }),
    )
  })
})
