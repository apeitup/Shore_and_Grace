"use server"

import { sdk } from "@lib/config"
import { revalidatePath } from "next/cache"
import { getAuthHeaders } from "./cookies"

export type WishlistItem = {
  id: string
  customer_id: string
  product_id: string
  created_at: string
  updated_at: string
}

export const listWishlist = async (): Promise<WishlistItem[]> => {
  const headers = await getAuthHeaders()

  if (!("authorization" in headers)) {
    return []
  }

  return sdk.client
    .fetch<{ items: WishlistItem[] }>("/store/wishlist", {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ items }) => items)
    .catch(() => [])
}

export const setWishlistProduct = async ({
  productId,
  saved,
}: {
  productId: string
  saved: boolean
}): Promise<{ authenticated: boolean; saved: boolean }> => {
  const headers = await getAuthHeaders()

  if (!("authorization" in headers)) {
    return { authenticated: false, saved: false }
  }

  if (saved) {
    await sdk.client.fetch("/store/wishlist", {
      method: "POST",
      headers,
      body: { product_id: productId },
      cache: "no-store",
    })
  } else {
    await sdk.client.fetch(`/store/wishlist/${productId}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    })
  }

  revalidatePath("/[countryCode]/(main)/account/wishlist", "page")
  revalidatePath("/[countryCode]/(main)/wishlist", "page")

  return { authenticated: true, saved }
}
