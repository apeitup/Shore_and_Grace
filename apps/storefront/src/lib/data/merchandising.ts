"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { listProducts } from "./products"

export type MerchandisingKind =
  | "featured"
  | "upsell"
  | "complementary"
  | "frequently_bought_together"

export type StoreMerchandisingSet = {
  id: string
  name: string
  handle: string
  kind: MerchandisingKind
  source_product_id?: string | null
  strategy: "manual" | "automatic"
  product_ids: string[]
}

export const listMerchandisingSets = async (query?: {
  kind?: MerchandisingKind
  source_product_id?: string
  handle?: string
}) =>
  sdk.client.fetch<{ merchandising_sets: StoreMerchandisingSet[] }>(
    "/store/merchandising",
    {
      method: "GET",
      query,
      cache: "no-store",
    },
  )

export const listMerchandisingProducts = async ({
  countryCode,
  kind,
  sourceProductId,
  handle,
}: {
  countryCode: string
  kind?: MerchandisingKind
  sourceProductId?: string
  handle?: string
}): Promise<{
  set: StoreMerchandisingSet | null
  products: HttpTypes.StoreProduct[]
}> => {
  const { merchandising_sets: sets } = await listMerchandisingSets({
    kind,
    source_product_id: sourceProductId,
    handle,
  })
  const set = sets[0] || null

  if (!set?.product_ids.length) {
    return { set, products: [] }
  }

  const { response } = await listProducts({
    countryCode,
    queryParams: {
      id: set.product_ids,
      limit: set.product_ids.length,
      is_giftcard: false,
    },
  })
  const productsById = new Map(
    response.products.map((product) => [product.id, product]),
  )

  return {
    set,
    products: set.product_ids
      .map((id) => productsById.get(id))
      .filter((product): product is HttpTypes.StoreProduct => Boolean(product)),
  }
}
