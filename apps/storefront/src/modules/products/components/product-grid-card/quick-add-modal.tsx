"use client"

import { addToCart } from "@lib/data/cart"
import { getProductPrice } from "@lib/util/get-product-price"
import { notifyCartUpdated } from "@lib/util/cart-events"
import { isVariantInStock } from "@lib/util/inventory"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useWishlist } from "@modules/wishlist/components/wishlist-provider"
import WishlistHeart from "@modules/wishlist/components/wishlist-heart"
import { captureStorefrontEvent } from "@modules/analytics/lib/posthog-client"

type QuickAddModalProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
  onClose: () => void
}

const optionsAsKeymap = (
  options: HttpTypes.StoreProductVariant["options"] | undefined
) =>
  options?.reduce((values: Record<string, string>, option) => {
    if (option.option_id) {
      values[option.option_id] = option.value
    }
    return values
  }, {}) ?? {}

const QuickAddModal = ({
  product,
  countryCode,
  onClose,
}: QuickAddModalProps) => {
  const defaultVariant =
    product.variants?.find(isVariantInStock) ?? product.variants?.[0]
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => optionsAsKeymap(defaultVariant?.options))
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { isSaved: productIsSaved, pendingProductIds, toggle } = useWishlist()
  const isSaved = productIsSaved(product.id)
  const [error, setError] = useState("")

  const selectedVariant = useMemo(
    () =>
      product.variants?.find((variant) => {
        const values = optionsAsKeymap(variant.options)
        return Object.entries(selectedOptions).every(
          ([optionId, value]) => values[optionId] === value
        )
      }),
    [product.variants, selectedOptions]
  )

  const price = selectedVariant?.id
    ? getProductPrice({ product, variantId: selectedVariant.id }).variantPrice
    : getProductPrice({ product }).cheapestPrice
  const inStock = isVariantInStock(selectedVariant)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [onClose])

  const optionIsAvailable = (optionId: string, value: string) =>
    product.variants?.some((variant) => {
      const values = optionsAsKeymap(variant.options)
      return (
        values[optionId] === value &&
        Object.entries(selectedOptions).every(
          ([selectedId, selectedValue]) =>
            selectedId === optionId || values[selectedId] === selectedValue
        ) &&
        isVariantInStock(variant)
      )
    }) ?? false

  const handleAdd = async () => {
    if (!selectedVariant?.id || !inStock) return

    setIsAdding(true)
    setError("")
    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      })
      notifyCartUpdated()
      void captureStorefrontEvent("product_added_to_cart", {
        product_id: product.id,
        variant_id: selectedVariant.id,
        price: price?.calculated_price_number,
        currency_code: price?.currency_code,
        quantity,
        country_code: countryCode,
      })
      onClose()
    } catch {
      setError("This item could not be added. Please try again.")
    } finally {
      setIsAdding(false)
    }
  }

  return createPortal(
    <div
      className="sg-quick-add"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="sg-quick-add__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sg-quick-add-title"
      >
        <div className="sg-quick-add__body">
          <div className="sg-quick-add__product">
            <div className="sg-quick-add__image">
              {product.thumbnail ? (
                <Image src={product.thumbnail} alt="" fill sizes="100px" />
              ) : null}
            </div>
            <div className="sg-quick-add__info">
              <h2 id="sg-quick-add-title">{product.title}</h2>
              {price && (
                <div className="sg-quick-add__price">
                  <strong>{price.calculated_price}</strong>
                  {price.price_type === "sale" && (
                    <>
                      <del>{price.original_price}</del>
                      <span>Sale!</span>
                    </>
                  )}
                </div>
              )}
              <p className="sg-quick-add__stock">
                {inStock ? "In stock" : "Out of stock"}
              </p>
              {(product.options ?? []).map((option) => (
                <fieldset className="sg-quick-add__options" key={option.id}>
                  <legend>Select {option.title}</legend>
                  <div>
                    {(option.values ?? []).map((optionValue) => {
                      const value = optionValue.value
                      const selected = selectedOptions[option.id] === value
                      const available = optionIsAvailable(option.id, value)
                      return (
                        <button
                          type="button"
                          className={selected ? "is-selected" : ""}
                          disabled={!available}
                          aria-pressed={selected}
                          key={optionValue.id}
                          onClick={() =>
                            setSelectedOptions((current) => ({
                              ...current,
                              [option.id]: value,
                            }))
                          }
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
            <button
              type="button"
              className="sg-quick-add__close"
              onClick={onClose}
              aria-label="Close quick add"
              autoFocus
            >
              <Image
                src="/assets/shop/quick-add-close.svg"
                alt=""
                width={28}
                height={28}
              />
            </button>
          </div>
          {error && <p className="sg-quick-add__error">{error}</p>}
        </div>
        <div className="sg-quick-add__footer">
          <div className="sg-quick-add__quantity" aria-label="Quantity">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              aria-label="Decrease quantity"
            >
              <Image
                src="/assets/shop/quick-add-minus.svg"
                alt=""
                width={16}
                height={16}
              />
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(10, value + 1))}
              aria-label="Increase quantity"
            >
              <Image
                src="/assets/shop/quick-add-plus.svg"
                alt=""
                width={16}
                height={16}
              />
            </button>
          </div>
          <button
            type="button"
            className="sg-quick-add__submit"
            disabled={!selectedVariant || !inStock || isAdding}
            onClick={handleAdd}
          >
            {isAdding ? "Adding…" : "Add to cart"}
          </button>
          <button
            type="button"
            className={
              isSaved
                ? "sg-quick-add__wishlist is-saved"
                : "sg-quick-add__wishlist"
            }
            aria-pressed={isSaved}
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            disabled={pendingProductIds.has(product.id)}
            onClick={() => toggle(product.id)}
          >
            <WishlistHeart saved={isSaved} />
            <span>{isSaved ? "Added to wishlist" : "Add to wishlist"}</span>
          </button>
        </div>
      </section>
    </div>,
    document.body
  )
}

export default QuickAddModal
