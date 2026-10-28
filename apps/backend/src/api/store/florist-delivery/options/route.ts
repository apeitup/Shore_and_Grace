import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { FLORIST_DELIVERY_MODULE } from "../../../../modules/florist-delivery"
import FloristDeliveryModuleService from "../../../../modules/florist-delivery/service"
import {
  buildAvailableDates,
  matchesPostcode,
  normalizePostcode,
} from "../../../../utils/florist-delivery"

export const GetStoreFloristDeliveryOptionsSchema = z.object({
  postcode: z.string().trim().max(16).optional(),
  fulfillment_type: z.enum(["delivery", "collection"]).optional(),
})

type Query = z.infer<typeof GetStoreFloristDeliveryOptionsSchema>

export const GET = async (
  req: MedusaRequest<unknown, Query>,
  res: MedusaResponse
) => {
  const service: FloristDeliveryModuleService = req.scope.resolve(
    FLORIST_DELIVERY_MODULE
  )
  const postcode = req.validatedQuery.postcode || ""
  const requestedType = req.validatedQuery.fulfillment_type
  const zones = await service.listDeliveryZones({ active: true })
  const eligibleZones = zones.filter((zone) => {
    if (requestedType && zone.fulfillment_type !== requestedType) {
      return false
    }
    return zone.fulfillment_type === "collection" || matchesPostcode(postcode, zone.postcode_patterns)
  })
  const blocked = await service.listBlockedDeliveryDates()
  const reservations = await service.listDeliveryReservations({
    status: ["held", "confirmed"],
  })

  const options = eligibleZones.map((zone) => {
    const blockedDates = new Set(
      blocked
        .filter(
          (item) =>
            item.fulfillment_type === "all" ||
            item.fulfillment_type === zone.fulfillment_type
        )
        .map((item) => item.date)
    )
    const reservationCounts = new Map<string, number>()
    reservations
      .filter((item) => item.zone_id === zone.id)
      .forEach((item) => {
        reservationCounts.set(
          item.delivery_date,
          (reservationCounts.get(item.delivery_date) ?? 0) + 1
        )
      })

    return {
      id: zone.id,
      name: zone.name,
      fulfillment_type: zone.fulfillment_type,
      shipping_option_id: zone.shipping_option_id,
      fee: zone.fee,
      currency_code: zone.currency_code,
      delivery_window: zone.delivery_window,
      dates: buildAvailableDates({
        zone,
        blockedDates,
        reservationCounts,
        days: 14,
      }),
    }
  })

  res.json({
    postcode: postcode ? normalizePostcode(postcode) : null,
    eligible: options.length > 0,
    options,
  })
}
