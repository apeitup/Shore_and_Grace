"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders } from "./cookies"

export type GiftOrderInput = {
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

export async function saveGiftOrderDetails(input: GiftOrderInput) {
  const headers = await getAuthHeaders()
  return sdk.client
    .fetch("/store/gift-order", {
      method: "POST",
      body: input,
      headers,
      cache: "no-store",
    })
    .catch(medusaError)
}
