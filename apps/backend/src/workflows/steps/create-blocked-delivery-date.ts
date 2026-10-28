import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { FLORIST_DELIVERY_MODULE } from "../../modules/florist-delivery"
import FloristDeliveryModuleService from "../../modules/florist-delivery/service"

export type CreateBlockedDeliveryDateInput = {
  date: string
  fulfillment_type: "delivery" | "collection" | "all"
  reason?: string | null
}

export const createBlockedDeliveryDateStep = createStep(
  "create-blocked-delivery-date",
  async (input: CreateBlockedDeliveryDateInput, { container }) => {
    const service: FloristDeliveryModuleService = container.resolve(
      FLORIST_DELIVERY_MODULE
    )
    const blockedDate = await service.createBlockedDeliveryDates(input)
    return new StepResponse(blockedDate, blockedDate.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const service: FloristDeliveryModuleService = container.resolve(
      FLORIST_DELIVERY_MODULE
    )
    await service.deleteBlockedDeliveryDates(id)
  }
)
