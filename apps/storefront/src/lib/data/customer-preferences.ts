"use server"

import { sdk } from "@lib/config"
import { revalidatePath } from "next/cache"
import {
  getAuthHeaders,
  removeAuthToken,
  removeCartId,
} from "./cookies"

export type CustomerPreferences = {
  id?: string
  customer_id?: string
  personalised_recommendations: boolean
  remember_delivery_preferences: boolean
  delivery_updates: boolean
  occasion_reminders: boolean
  marketing_collections: boolean
  marketing_offers: boolean
  marketing_stories: boolean
  default_delivery_instructions: string | null
  leave_in_safe_place: boolean
  hide_prices: boolean
}

export type CustomerPreferencesUpdate = Partial<
  Omit<CustomerPreferences, "id" | "customer_id">
>

const defaultCustomerPreferences: CustomerPreferences = {
  personalised_recommendations: false,
  remember_delivery_preferences: false,
  delivery_updates: true,
  occasion_reminders: true,
  marketing_collections: false,
  marketing_offers: true,
  marketing_stories: false,
  default_delivery_instructions: null,
  leave_in_safe_place: false,
  hide_prices: true,
}

export const retrieveCustomerPreferences = async () => {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return defaultCustomerPreferences
  }

  return sdk.client
    .fetch<{ preferences: CustomerPreferences }>(
      "/store/customer-preferences",
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    )
    .then(({ preferences }) => preferences)
    .catch(() => defaultCustomerPreferences)
}

export const saveCustomerPreferences = async (
  input: CustomerPreferencesUpdate
) => {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    preferences: CustomerPreferences
  }>("/store/customer-preferences", {
    method: "POST",
    headers,
    body: input,
    cache: "no-store",
  })
  revalidatePath("/[countryCode]/(main)/account/settings", "page")
  return response.preferences
}

export const downloadCustomerData = async () => {
  const headers = await getAuthHeaders()
  return sdk.client.fetch<Record<string, unknown>>(
    "/store/customer-data-export",
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  )
}

export const deleteCustomerAccount = async () => {
  const headers = await getAuthHeaders()
  await sdk.client.fetch("/store/customer-account", {
    method: "DELETE",
    headers,
    cache: "no-store",
  })
  await removeAuthToken()
  await removeCartId()
  return { deleted: true }
}
