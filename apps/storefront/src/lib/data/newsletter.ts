"use server"

import { sdk } from "@lib/config"

export const requestNewsletterSubscription = async (email: string) => {
  const response = await sdk.client.fetch<{
    newsletter: {
      status: "confirmation_required"
      message: string
    }
  }>("/store/newsletter", {
    method: "POST",
    body: { email },
    cache: "no-store",
  })

  return response.newsletter
}

export const confirmNewsletterSubscription = async (token: string) => {
  const response = await sdk.client.fetch<{
    newsletter: { status: "subscribed" }
  }>("/store/newsletter/confirm", {
    method: "POST",
    body: { token },
    cache: "no-store",
  })

  return response.newsletter
}

export const unsubscribeNewsletterSubscription = async (token: string) => {
  const response = await sdk.client.fetch<{
    newsletter: { status: "unsubscribed" }
  }>("/store/newsletter/unsubscribe", {
    method: "POST",
    body: { token },
    cache: "no-store",
  })

  return response.newsletter
}
