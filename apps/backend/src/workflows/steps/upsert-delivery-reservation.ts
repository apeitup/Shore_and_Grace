import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { FLORIST_DELIVERY_MODULE } from "../../modules/florist-delivery"
import FloristDeliveryModuleService from "../../modules/florist-delivery/service"
import {
  buildAvailableDates,
  matchesPostcode,
} from "../../utils/florist-delivery"

export type UpsertDeliveryReservationInput = {
  cart_id: string
  zone_id: string
  postcode?: string | null
  delivery_date: string
}

export const upsertDeliveryReservationStep = createStep(
  "upsert-delivery-reservation",
  async (input: UpsertDeliveryReservationInput, { container }) => {
    const service: FloristDeliveryModuleService = container.resolve(
      FLORIST_DELIVERY_MODULE
    )
    const zone = await service.retrieveDeliveryZone(input.zone_id)
    if (!zone.active) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "That delivery option is no longer active."
      )
    }
    if (
      zone.fulfillment_type === "delivery" &&
      (!input.postcode || !matchesPostcode(input.postcode, zone.postcode_patterns))
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "That delivery option is not available for this postcode."
      )
    }

    const blocked = await service.listBlockedDeliveryDates()

    const existingForDate = await service.listDeliveryReservations({
      zone_id: zone.id,
      delivery_date: input.delivery_date,
      status: ["held", "confirmed"],
    })
    const existingForCart = await service.listDeliveryReservations({
      cart_id: input.cart_id,
    })
    const isExistingDateReservation = existingForDate.some(
      (item) => item.cart_id === input.cart_id
    )

    const reservationCounts = new Map<string, number>()
    existingForDate
      .filter((item) => item.cart_id !== input.cart_id)
      .forEach((item) => {
      reservationCounts.set(
        item.delivery_date,
        (reservationCounts.get(item.delivery_date) ?? 0) + 1
      )
      })
    const blockedDates = new Set(
      blocked
        .filter(
          (item) =>
            item.fulfillment_type === "all" ||
            item.fulfillment_type === zone.fulfillment_type
        )
        .map((item) => item.date)
    )
    const availableDates = buildAvailableDates({
      zone,
      blockedDates,
      reservationCounts,
      days: 45,
    })
    if (!availableDates.some((item) => item.date === input.delivery_date)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "That delivery date is no longer available."
      )
    }

    if (!isExistingDateReservation && existingForDate.length >= zone.daily_capacity) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "That delivery date has just reached capacity. Please choose another date."
      )
    }

    const values = {
      cart_id: input.cart_id,
      zone_id: zone.id,
      zone_name: zone.name,
      fulfillment_type: zone.fulfillment_type,
      postcode: input.postcode || null,
      delivery_date: input.delivery_date,
      delivery_window: zone.delivery_window,
      shipping_option_id: zone.shipping_option_id,
      fee: zone.fee,
      currency_code: zone.currency_code,
      status: "held" as const,
    }
    const previous = existingForCart[0]
    const reservation = previous
      ? await service.updateDeliveryReservations({ id: previous.id, ...values })
      : await service.createDeliveryReservations(values)

    return new StepResponse(reservation, {
      id: reservation.id,
      created: !previous,
      previous,
    })
  },
  async (data, { container }) => {
    if (!data?.id) {
      return
    }
    const service: FloristDeliveryModuleService = container.resolve(
      FLORIST_DELIVERY_MODULE
    )
    if (data.created) {
      await service.deleteDeliveryReservations(data.id)
    } else if (data.previous) {
      await service.updateDeliveryReservations(data.previous)
    }
  }
)
