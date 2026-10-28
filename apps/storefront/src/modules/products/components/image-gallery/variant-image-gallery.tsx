"use client"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { useMemo, useSyncExternalStore } from "react"
import ImageGallery from "."

const subscribeToVariantChanges = (onStoreChange: () => void) => {
  window.addEventListener("sg:variant-change", onStoreChange)
  return () => window.removeEventListener("sg:variant-change", onStoreChange)
}

const getSelectedVariantId = () =>
  new URLSearchParams(window.location.search).get("v_id") ?? undefined

const getServerVariantId = () => undefined

const getImagesForVariant = (
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string,
) => {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

/**
 * Shows the images of the variant selected with `?v_id=`. Product pages are
 * statically rendered, so the filter is only applied after hydration.
 */
const VariantImageGallery = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const variantId = useSyncExternalStore(
    subscribeToVariantChanges,
    getSelectedVariantId,
    getServerVariantId
  )

  const images = useMemo(
    () => getImagesForVariant(product, variantId) ?? [],
    [product, variantId]
  )

  const selectedPrice = useMemo(() => {
    const { cheapestPrice, variantPrice } = getProductPrice({
      product,
      variantId,
    })

    return variantPrice ?? cheapestPrice
  }, [product, variantId])

  return (
    <ImageGallery
      images={images}
      onSale={selectedPrice?.price_type === "sale"}
    />
  )
}

export default VariantImageGallery
