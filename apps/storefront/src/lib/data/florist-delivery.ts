"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders } from "./cookies"

export type FloristDeliveryDate = {
  date: string
  remaining_capacity: number
}

export type FloristDeliveryOption = {
  id: string
  name: string
  fulfillment_type: "delivery" | "collection"
  shipping_option_id: string | null
  fee: number
  currency_code: string
  delivery_window: string | null
  dates: FloristDeliveryDate[]
}

export async function getFloristDeliveryOptions(
  postcode: string,
  fulfillmentType?: "delivery" | "collection"
) {
  const headers = await getAuthHeaders()
  return sdk.client
    .fetch<{
      postcode: string | null
      eligible: boolean
      options: FloristDeliveryOption[]
    }>("/store/florist-delivery/options", {
      method: "GET",
      query: {
        postcode,
        ...(fulfillmentType ? { fulfillment_type: fulfillmentType } : {}),
      },
      headers,
      cache: "no-store",
    })
    .catch(medusaError)
}

export async function reserveFloristDelivery(input: {
  cart_id: string
  zone_id: string
  postcode?: string | null
  delivery_date: string
}) {
  const headers = await getAuthHeaders()
  return sdk.client
    .fetch("/store/florist-delivery/reservations", {
      method: "POST",
      body: input,
      headers,
      cache: "no-store",
    })
    .catch(medusaError)
}
