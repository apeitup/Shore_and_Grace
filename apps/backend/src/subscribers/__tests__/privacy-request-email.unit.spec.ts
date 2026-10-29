import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { PRIVACY_REQUEST_MODULE } from "../../modules/privacy-request"
import privacyRequestEmailHandler from "../privacy-request-email"

describe("privacy request email subscriber", () => {
  const originalEnvironment = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnvironment }
    jest.restoreAllMocks()
  })

  const createContainer = (status: string) => {
    const createNotifications = jest.fn().mockResolvedValue({ id: "noti_01" })
    const logger = { error: jest.fn() }
    const request = {
      id: "privacy_01",
      reference: "SG-PR-20261029-ABC123",
      name: "Troy Halliday",
      email: "troy@example.com",
      status,
    }
    const container = {
      resolve: jest.fn((key: string) => {
        if (key === PRIVACY_REQUEST_MODULE) {
          return {
            retrievePrivacyRequest: jest.fn().mockResolvedValue(request),
          }
        }
        if (key === Modules.NOTIFICATION) {
          return { createNotifications }
        }
        if (key === ContainerRegistrationKeys.LOGGER) {
          return logger
        }
        throw new Error(`Unexpected container key: ${key}`)
      }),
    }

    return { container, createNotifications }
  }

  it("sends a branded receipt when a privacy request is created", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    const { container, createNotifications } = createContainer("received")

    await privacyRequestEmailHandler({
      event: {
        name: "privacy_request.created",
        data: { id: "privacy_01" },
      },
      container,
    } as never)

    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        template: "privacy-request-received",
        idempotency_key: "privacy_01:received:v1",
        content: expect.objectContaining({
          text: expect.stringContaining("Hello Troy"),
        }),
      }),
    )
  })

  it("only sends an update email when the request is completed", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    const pending = createContainer("in_progress")
    const completed = createContainer("completed")

    await privacyRequestEmailHandler({
      event: {
        name: "privacy_request.updated",
        data: { id: "privacy_01" },
      },
      container: pending.container,
    } as never)
    await privacyRequestEmailHandler({
      event: {
        name: "privacy_request.updated",
        data: { id: "privacy_01" },
      },
      container: completed.container,
    } as never)

    expect(pending.createNotifications).not.toHaveBeenCalled()
    expect(completed.createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        template: "privacy-request-completed",
        idempotency_key: "privacy_01:completed:v1",
      }),
    )
  })
})
