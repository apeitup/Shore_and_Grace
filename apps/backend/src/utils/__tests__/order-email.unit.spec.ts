import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { FLORIST_DELIVERY_MODULE } from "../../modules/florist-delivery"
import { GIFT_ORDER_MODULE } from "../../modules/gift-order"
import { CUSTOMER_PREFERENCES_MODULE } from "../../modules/customer-preferences"
import {
  retrieveOrderIdFromFulfillment,
  sendOrderConfirmationEmail,
  sendOrderLifecycleEmail,
  sendRefundConfirmationEmail,
} from "../order-email"

describe("order emails", () => {
  const originalEnvironment = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnvironment }
    jest.restoreAllMocks()
  })

  const order = {
    id: "order_01",
    customer_id: "cus_01",
    display_id: 42,
    email: "troy@example.com",
    created_at: "2026-10-29T12:00:00.000Z",
    currency_code: "gbp",
    subtotal: 8000,
    shipping_total: 1000,
    total: 9000,
    items: [
      {
        title: "Pearly Everlasting",
        variant_title: "Medium / White",
        quantity: 1,
        unit_price: 8000,
        total: 8000,
        thumbnail: "https://example.com/flowers.jpg",
      },
    ],
    shipping_address: {
      first_name: "Amanda",
      last_name: "Speller",
      address_1: "303 Walton Road",
      city: "Walton-on-the-Naze",
      province: "Essex",
      postal_code: "CO14 8LS",
      country_code: "gb",
      phone: "07000000000",
    },
    billing_address: {
      first_name: "Troy",
      last_name: "Halliday",
      address_1: "303 Walton Road",
      city: "Walton-on-the-Naze",
      province: "Essex",
      postal_code: "CO14 8LS",
      country_code: "gb",
    },
    shipping_methods: [{ name: "Local delivery" }],
  }

  const createContainer = (deliveryUpdates = true) => {
    const createNotifications = jest.fn().mockResolvedValue({ id: "noti_01" })
    const query = {
      graph: jest.fn().mockImplementation(({ entity }) => {
        if (entity === "order") {
          return Promise.resolve({ data: [order] })
        }
        if (entity === "fulfillment") {
          return Promise.resolve({ data: [{ id: "ful_01", order }] })
        }
        if (entity === "payment") {
          return Promise.resolve({
            data: [
              {
                id: "pay_01",
                currency_code: "gbp",
                payment_collection: { order: { id: order.id } },
                refunds: [
                  {
                    id: "ref_01",
                    amount: 2500,
                    created_at: "2026-10-29T13:00:00.000Z",
                  },
                ],
              },
            ],
          })
        }
        return Promise.resolve({ data: [] })
      }),
    }
    const container = {
      resolve: jest.fn((key: string) => {
        if (key === ContainerRegistrationKeys.QUERY) {
          return query
        }
        if (key === ContainerRegistrationKeys.LOGGER) {
          return { error: jest.fn() }
        }
        if (key === Modules.NOTIFICATION) {
          return { createNotifications }
        }
        if (key === CUSTOMER_PREFERENCES_MODULE) {
          return {
            listCustomerPreferences: jest.fn().mockResolvedValue([
              { delivery_updates: deliveryUpdates },
            ]),
          }
        }
        if (key === GIFT_ORDER_MODULE) {
          return {
            listGiftOrderDetails: jest.fn().mockResolvedValue([
              {
                recipient_first_name: "Amanda",
                recipient_last_name: "Speller",
                recipient_phone: "07000000000",
                purchaser_first_name: "Troy",
                purchaser_last_name: "Halliday",
                purchaser_email: "troy@example.com",
                gift_message: "With love",
                hide_prices: true,
              },
            ]),
          }
        }
        if (key === FLORIST_DELIVERY_MODULE) {
          return {
            listDeliveryReservations: jest.fn().mockResolvedValue([
              {
                delivery_date: "2026-10-31",
                delivery_window: "09:00-13:00",
                fulfillment_type: "delivery",
              },
            ]),
          }
        }
        throw new Error(`Unexpected container key: ${key}`)
      }),
    }

    return { container, createNotifications, query }
  }

  it("keeps the purchaser and recipient distinct in an order confirmation", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    process.env.CONTACT_REPLY_TO_EMAIL = "contact@shoreandgrace.com"
    process.env.STOREFRONT_URL = "https://shoreandgrace.com"
    const { container, createNotifications } = createContainer()

    await sendOrderConfirmationEmail(container as never, order.id)

    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "troy@example.com",
        template: "order-confirmation",
        idempotency_key: "order_01:confirmation:v1",
        content: expect.objectContaining({
          html: expect.stringContaining("Amanda Speller"),
          text: expect.stringContaining("Hello Troy Halliday"),
        }),
      }),
    )
  })

  it("renders lifecycle updates for the purchaser", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    const { container, createNotifications } = createContainer()

    await sendOrderLifecycleEmail(
      container as never,
      order.id,
      "prepared",
      "ful_01",
    )

    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        template: "order-prepared",
        trigger_type: "order.fulfillment_created",
        idempotency_key: "order_01:prepared:ful_01:v1",
        content: expect.objectContaining({
          text: expect.stringContaining("Hello Troy Halliday"),
        }),
      }),
    )
  })

  it("resolves an order from a fulfillment event", async () => {
    const { container } = createContainer()

    await expect(
      retrieveOrderIdFromFulfillment(container as never, "ful_01"),
    ).resolves.toBe("order_01")
  })

  it("respects a customer's delivery update preference", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    const { container, createNotifications } = createContainer(false)

    await sendOrderLifecycleEmail(
      container as never,
      order.id,
      "dispatched",
      "ful_01"
    )

    expect(createNotifications).not.toHaveBeenCalled()
  })

  it("sends a refund confirmation for the linked order", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@shoreandgrace.com"
    process.env.STOREFRONT_URL = "https://shoreandgrace.com"
    const { container, createNotifications } = createContainer()

    await sendRefundConfirmationEmail(container as never, "pay_01")

    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "troy@example.com",
        template: "refund-confirmation",
        trigger_type: "payment.refunded",
        idempotency_key: "order_01:refund:ref_01:v1",
        content: expect.objectContaining({
          text: expect.stringContaining("Refund: £25.00"),
        }),
      }),
    )
  })
})
