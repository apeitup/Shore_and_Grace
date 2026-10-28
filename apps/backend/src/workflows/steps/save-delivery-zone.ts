import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { FLORIST_DELIVERY_MODULE } from "../../modules/florist-delivery"
import FloristDeliveryModuleService from "../../modules/florist-delivery/service"

export type SaveDeliveryZoneInput = {
  id?: string
  name: string
  fulfillment_type: "delivery" | "collection"
  postcode_patterns: string[]
  shipping_option_id?: string | null
  currency_code: string
  fee: number
  minimum_lead_days: number
  same_day_cutoff?: string | null
  daily_capacity: number
  allowed_weekdays: number[]
  delivery_window?: string | null
  active: boolean
}

export const saveDeliveryZoneStep = createStep(
  "save-delivery-zone",
  async (input: SaveDeliveryZoneInput, { container }) => {
    const service: FloristDeliveryModuleService = container.resolve(
      FLORIST_DELIVERY_MODULE
    )
    const previous = input.id
      ? await service.retrieveDeliveryZone(input.id)
      : undefined
    const values = {
      ...input,
      postcode_patterns: { values: input.postcode_patterns },
      allowed_weekdays: { values: input.allowed_weekdays },
    }
    const zone = input.id
      ? await service.updateDeliveryZones(values)
      : await service.createDeliveryZones(values)

    return new StepResponse(zone, { id: zone.id, previous })
  },
  async (data, { container }) => {
    if (!data?.id) {
      return
    }
    const service: FloristDeliveryModuleService = container.resolve(
      FLORIST_DELIVERY_MODULE
    )
    if (data.previous) {
      await service.updateDeliveryZones(data.previous)
    } else {
      await service.deleteDeliveryZones(data.id)
    }
  }
)
