import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { GIFT_ORDER_MODULE } from "../../modules/gift-order"
import GiftOrderModuleService from "../../modules/gift-order/service"

export type UpsertGiftOrderDetailsInput = {
  cart_id: string
  recipient_type?: "self" | "other"
  recipient_first_name?: string | null
  recipient_last_name?: string | null
  recipient_phone?: string | null
  purchaser_first_name?: string | null
  purchaser_last_name?: string | null
  purchaser_phone?: string | null
  purchaser_email?: string | null
  gift_message?: string | null
  delivery_instructions?: string | null
  leave_safe?: boolean
  hide_prices?: boolean
  anonymous_sender?: boolean
}

export const upsertGiftOrderDetailsStep = createStep(
  "upsert-gift-order-details",
  async (input: UpsertGiftOrderDetailsInput, { container }) => {
    const service: GiftOrderModuleService = container.resolve(GIFT_ORDER_MODULE)
    const existing = await service.listGiftOrderDetails({ cart_id: input.cart_id })
    const previous = existing[0]
    const details = previous
      ? await service.updateGiftOrderDetails({ id: previous.id, ...input })
      : await service.createGiftOrderDetails(input)

    return new StepResponse(details, {
      id: details.id,
      created: !previous,
      previous,
    })
  },
  async (data, { container }) => {
    if (!data?.id) {
      return
    }
    const service: GiftOrderModuleService = container.resolve(GIFT_ORDER_MODULE)
    if (data.created) {
      await service.deleteGiftOrderDetails(data.id)
    } else if (data.previous) {
      await service.updateGiftOrderDetails(data.previous)
    }
  }
)
