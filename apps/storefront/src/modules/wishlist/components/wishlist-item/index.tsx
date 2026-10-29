"use client"

import { addToCart } from "@lib/data/cart"
import { notifyCartUpdated } from "@lib/util/cart-events"
import { getProductPrice } from "@lib/util/get-product-price"
import { isVariantInStock } from "@lib/util/inventory"
import { HttpTypes } from "@medusajs/types"
import BrandButton from "@modules/brand/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import QuickAddModal from "@modules/products/components/product-grid-card/quick-add-modal"
import SaleBanner from "@modules/products/components/sale-banner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useWishlist } from "@modules/wishlist/components/wishlist-provider"
import { RefreshDouble, Trash } from "iconoir-react"
import { useParams } from "next/navigation"
import { useState } from "react"

type WishlistItemProps = {
  product: HttpTypes.StoreProduct
}

const WishlistItem = ({ product }: WishlistItemProps) => {
  const { countryCode = "gb" } = useParams<{ countryCode?: string }>()
  const { pendingProductIds, toggle } = useWishlist()
  const [modalOpen, setModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [buttonLabel, setButtonLabel] = useState("Add to cart")

  const price = getProductPrice({ product }).cheapestPrice
  const onSale = price?.price_type === "sale"
  const inStock = product.variants?.some(isVariantInStock) ?? false
  const isRemoving = pendingProductIds.has(product.id)

  const handleAddToCart = async () => {
    if (!inStock || isAdding) return

    setIsAdding(true)
    setButtonLabel("Loading…")

    try {
      if ((product.variants?.length ?? 0) > 1) {
        setModalOpen(true)
        setButtonLabel("Add to cart")
        return
      }

      const variant =
        product.variants?.find(isVariantInStock) ?? product.variants?.[0]

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
    <article className="sg-wishlist-item">
      <div className="sg-wishlist-item__image">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`View ${product.title}`}
        >
          <Thumbnail
            thumbnail={product.thumbnail}
            alt={product.title}
            size="square"
          />
          {onSale && <SaleBanner />}
        </LocalizedClientLink>
      </div>

      <div className="sg-wishlist-item__product">
        <LocalizedClientLink href={`/products/${product.handle}`}>
          {product.title}
        </LocalizedClientLink>
      </div>

      <div className="sg-wishlist-item__price">
        {price ? (
          <>
            <span>{price.calculated_price}</span>
            {onSale && <del>{price.original_price}</del>}
          </>
        ) : (
          <span>Price unavailable</span>
        )}
      </div>

      <p className="sg-wishlist-item__stock">
        {inStock ? "In stock" : "Out of stock"}
      </p>

      <div className="sg-wishlist-item__view">
        <BrandButton
          href={`/products/${product.handle}`}
          variant="secondary"
        >
          VIEW
        </BrandButton>
      </div>

      <div className="sg-wishlist-item__add">
        <BrandButton
          className="sg-wishlist-item__add-button"
          disabled={!inStock || isAdding}
          onClick={handleAddToCart}
          variant="primary"
        >
          {inStock ? buttonLabel : "Out of stock"}
        </BrandButton>
      </div>

      <div className="sg-wishlist-item__remove">
        <button
          type="button"
          aria-label={`Remove ${product.title} from wishlist`}
          disabled={isRemoving}
          onClick={() => toggle(product.id)}
        >
          {isRemoving ? (
            <RefreshDouble aria-hidden="true" className="animate-spin" />
          ) : (
            <Trash aria-hidden="true" />
          )}
        </button>
      </div>

      {modalOpen && (
        <QuickAddModal
          product={product}
          countryCode={countryCode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </article>
  )
}

export default WishlistItem
