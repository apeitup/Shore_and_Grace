"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type PrivacyRequestInput = {
  request_type:
    | "access"
    | "correction"
    | "deletion"
    | "restriction"
    | "objection"
    | "portability"
  requester_type: "customer" | "gift_recipient" | "visitor"
  name: string
  email: string
  phone?: string | null
  order_reference?: string | null
  details?: string | null
  privacy_notice_accepted: true
  website?: string
}

export type PrivacyRequestReceipt = {
  reference: string
  status: "received"
  due_at: string
}

export const submitPrivacyRequest = async (input: PrivacyRequestInput) => {
  const headers = await getAuthHeaders()
  const response = await sdk.client.fetch<{
    privacy_request: PrivacyRequestReceipt
  }>("/store/privacy-requests", {
    method: "POST",
    headers,
    body: input,
    cache: "no-store",
  })
  return response.privacy_request
}
