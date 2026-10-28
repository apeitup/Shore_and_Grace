"use server"

import { sdk } from "@lib/config"
import { revalidatePath } from "next/cache"
import { getAuthHeaders } from "./cookies"

export type SystemOccasion = {
  id: string
  name: string
  slug: string
  date_type: "fixed" | "easter" | "mothering_sunday" | "fathers_day"
  month?: number | null
  day?: number | null
  default_reminder_days: number
  enabled_by_default: boolean
  active: boolean
  description?: string | null
  sort_order: number
  next_date: string
  enabled: boolean
  reminder_days: number
  preference_id?: string | null
}

export type CustomerOccasion = {
  id: string
  customer_id: string
  system_occasion_id?: string | null
  name: string
  occasion_date?: string | null
  reminder_days: number
  enabled: boolean
  repeats_annually: boolean
}

export type OccasionsResponse = {
  system_occasions: SystemOccasion[]
  customer_occasions: CustomerOccasion[]
}

const accountOccasionsPath = "/[countryCode]/(main)/account/occasions"

export const listOccasions = async (): Promise<OccasionsResponse> => {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { system_occasions: [], customer_occasions: [] }
  }
  return sdk.client.fetch<OccasionsResponse>("/store/occasions", {
    method: "GET",
    headers,
    cache: "no-store",
  })
}

export const saveCustomerOccasion = async (input: {
  id?: string
  name: string
  occasion_date: string
  reminder_days: number
  enabled: boolean
  repeats_annually: boolean
}) => {
  const headers = await getAuthHeaders()
  const path = input.id
    ? `/store/occasions/personal/${input.id}`
    : "/store/occasions"
  const { id: _id, ...body } = input
  const response = await sdk.client.fetch<{ occasion: CustomerOccasion }>(path, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  })
  revalidatePath(accountOccasionsPath, "page")
  return response.occasion
}

export const deleteCustomerOccasion = async (id: string) => {
  const headers = await getAuthHeaders()
  await sdk.client.fetch(`/store/occasions/personal/${id}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  })
  revalidatePath(accountOccasionsPath, "page")
}

export const saveSystemOccasionPreference = async (input: {
  system_occasion_id: string
  enabled: boolean
  reminder_days: number
}) => {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{ occasion: CustomerOccasion }>(
    "/store/occasions/preferences",
    {
      method: "POST",
      headers,
      body: input,
      cache: "no-store",
    }
  )
  revalidatePath(accountOccasionsPath, "page")
  return response.occasion
}
