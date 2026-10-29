"use server"

import { sdk } from "@lib/config"

export type ContactEnquiryInput = {
  name: string
  email: string
  phone?: string | null
  order_reference?: string | null
  category:
    | "order"
    | "delivery"
    | "returns"
    | "products"
    | "services"
    | "privacy"
    | "other"
  message: string
  privacy_notice_accepted: true
  website?: string
}

export type ContactEnquiryReceipt = {
  reference: string
  status: "new"
}

export const submitContactEnquiry = async (input: ContactEnquiryInput) => {
  const response = await sdk.client.fetch<{
    contact_enquiry: ContactEnquiryReceipt
  }>("/store/contact-enquiries", {
    method: "POST",
    body: input,
    cache: "no-store",
  })

  return response.contact_enquiry
}
