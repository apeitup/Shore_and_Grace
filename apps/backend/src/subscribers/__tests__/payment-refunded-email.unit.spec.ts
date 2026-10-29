import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendRefundConfirmationEmail } from "../../utils/order-email"
import paymentRefundedEmailHandler from "../payment-refunded-email"

jest.mock("../../utils/order-email", () => ({
  sendRefundConfirmationEmail: jest.fn(),
}))

describe("payment refunded email subscriber", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("sends the refund email for the event payment", async () => {
    const logger = { error: jest.fn() }
    const container = {
      resolve: jest.fn((key: string) => {
        if (key === ContainerRegistrationKeys.LOGGER) {
          return logger
        }
        throw new Error(`Unexpected container key: ${key}`)
      }),
    }
    jest.mocked(sendRefundConfirmationEmail).mockResolvedValue(true)

    await paymentRefundedEmailHandler({
      event: { name: "payment.refunded", data: { id: "pay_01" } },
      container,
    } as never)

    expect(sendRefundConfirmationEmail).toHaveBeenCalledWith(
      container,
      "pay_01",
    )
    expect(logger.error).not.toHaveBeenCalled()
  })
})
