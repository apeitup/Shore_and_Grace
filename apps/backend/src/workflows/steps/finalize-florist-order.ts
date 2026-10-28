import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { FLORIST_DELIVERY_MODULE } from "../../modules/florist-delivery"
import FloristDeliveryModuleService from "../../modules/florist-delivery/service"
import { GIFT_ORDER_MODULE } from "../../modules/gift-order"
import GiftOrderModuleService from "../../modules/gift-order/service"

export type FinalizeFloristOrderInput = {
  cart_id: string
  order_id: string
}

export const finalizeFloristOrderStep = createStep(
  "finalize-florist-order",
  async (input: FinalizeFloristOrderInput, { container }) => {
    const deliveryService: FloristDeliveryModuleService = container.resolve(
      FLORIST_DELIVERY_MODULE
    )
    const giftService: GiftOrderModuleService = container.resolve(
      GIFT_ORDER_MODULE
    )
    const [reservations, giftOrders] = await Promise.all([
      deliveryService.listDeliveryReservations({ cart_id: input.cart_id }),
      giftService.listGiftOrderDetails({ cart_id: input.cart_id }),
    ])

    if (reservations[0]) {
      await deliveryService.updateDeliveryReservations({
        id: reservations[0].id,
        order_id: input.order_id,
        status: "confirmed",
      })
    }
    if (giftOrders[0]) {
      await giftService.updateGiftOrderDetails({
        id: giftOrders[0].id,
        order_id: input.order_id,
      })
    }

    return new StepResponse({
      delivery_reservation_id: reservations[0]?.id || null,
      gift_order_details_id: giftOrders[0]?.id || null,
    })
  }
)
