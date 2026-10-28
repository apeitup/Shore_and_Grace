"use client"

import { addToCart } from "@lib/data/cart"
import { sdk } from "@lib/config"
import { notifyCartUpdated } from "@lib/util/cart-events"
import { isVariantInStock } from "@lib/util/inventory"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"
import { useWishlist } from "@modules/wishlist/components/wishlist-provider"
import WishlistHeart from "@modules/wishlist/components/wishlist-heart"
import QuickAddModal from "./quick-add-modal"
import SaleBanner from "../sale-banner"

type ProductGridCardProps = {
  productId: string
  title: string
  handle: string
  thumbnail?: string | null
  price: ReactNode
  onSale?: boolean
  regionId: string
  initialProduct?: HttpTypes.StoreProduct
}

const ProductGridCard = ({
  productId,
  title,
  handle,
  thumbnail,
  price,
  onSale = false,
  regionId,
  initialProduct,
}: ProductGridCardProps) => {
  const [product, setProduct] = useState(initialProduct)
  const [modalOpen, setModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { isSaved: productIsSaved, pendingProductIds, toggle } = useWishlist()
  const isSaved = productIsSaved(productId)
  const [buttonLabel, setButtonLabel] = useState("Add to cart")
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const { countryCode = "gb" } = useParams<{ countryCode?: string }>()

  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px)").matches) return

    let active = true

    sdk.client
      .fetch<{ average_rating: number }>(
        `/store/products/${productId}/reviews`,
        {
          method: "GET",
        }
      )
      .then(({ average_rating }) => {
        if (active && average_rating > 0) setAverageRating(average_rating)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [productId])

  const loadProduct = async () => {
    if (product) return product

    const response = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
    }>("/store/products", {
      method: "GET",
      query: {
        id: [productId],
        region_id: regionId,
        limit: 1,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,*variants.options,*options.values,*images,+metadata",
      },
    })
    const loadedProduct = response.products[0]
    setProduct(loadedProduct)
    return loadedProduct
  }

  const handleQuickAdd = async () => {
    setIsAdding(true)
    setButtonLabel("Loading…")

    try {
      const currentProduct = await loadProduct()
      if (!currentProduct) throw new Error("Product not found")

      if ((currentProduct.variants?.length ?? 0) > 1) {
        setModalOpen(true)
        setButtonLabel("Add to cart")
        return
      }

      const variant =
        currentProduct.variants?.find(isVariantInStock) ??
        currentProduct.variants?.[0]
      if (!variant?.id || !isVariantInStock(variant)) {
        setButtonLabel("Out of stock")
        return
      }

      await addToCart({ variantId: variant.id, quantity: 1, countryCode })
      notifyCartUpdated()
      setButtonLabel("Added")
      window.setTimeout(() => setButtonLabel("Add to cart"), 1400)
    } catch {
      setButtonLabel("Try again")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <article className="sg-product-card" data-testid="product-wrapper">
      <div className="sg-product-card__media">
        <LocalizedClientLink
          href={`/products/${handle}`}
          aria-label={`View ${title}`}
        >
          <Thumbnail thumbnail={thumbnail} alt={title} size="square" />
          {onSale && <SaleBanner />}
        </LocalizedClientLink>
        <div className="sg-product-card__actions">
          <button
            type="button"
            className="sg-product-card__add"
            onClick={handleQuickAdd}
            disabled={isAdding}
          >
            {buttonLabel}
          </button>
          <button
            type="button"
            className={
              isSaved
                ? "sg-product-card__wishlist is-saved"
                : "sg-product-card__wishlist"
            }
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isSaved}
            disabled={pendingProductIds.has(productId)}
            onClick={() => toggle(productId)}
          >
            <WishlistHeart saved={isSaved} size={28} />
          </button>
        </div>
      </div>
      <LocalizedClientLink
        href={`/products/${handle}`}
        className="sg-product-card__details"
      >
        <h2 className="sg-product-card__title" data-testid="product-title">
          {title}
        </h2>
        {averageRating !== null && (
          <span
            className="sg-product-card__rating"
            aria-label={`${averageRating.toFixed(1)} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <Image
                key={value}
                src={
                  value <= Math.round(averageRating)
                    ? "/assets/shop/review-star-filled.svg"
                    : "/assets/shop/review-star-outline.svg"
                }
                alt=""
                width={16}
                height={16}
              />
            ))}
          </span>
        )}
        <div className="sg-product-card__price">{price}</div>
      </LocalizedClientLink>
      {modalOpen && product && (
        <QuickAddModal
          product={product}
          countryCode={countryCode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </article>
  )
}

export default ProductGridCard
