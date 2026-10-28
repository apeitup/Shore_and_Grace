"use client"

import { addToCart } from "@lib/data/cart"
import { notifyCartUpdated } from "@lib/util/cart-events"
import { isVariantInStock } from "@lib/util/inventory"
import { HttpTypes } from "@medusajs/types"
import BrandButton from "@modules/brand/components/button"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname } from "next/navigation"
import { FormEvent, useEffect, useMemo, useState } from "react"
import ProductPrice from "../product-price"
import Image from "next/image"
import { useWishlist } from "@modules/wishlist/components/wishlist-provider"
import WishlistHeart from "@modules/wishlist/components/wishlist-heart"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

const getDefaultVariant = (product: HttpTypes.StoreProduct) =>
  product.variants?.find(isVariantInStock) ?? product.variants?.[0]

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const pathname = usePathname()
  // Preselected on the server so the form posts a valid variant without JavaScript.
  // The page is statically rendered, so `?v_id=` is applied after hydration.
  const [options, setOptions] = useState<Record<string, string | undefined>>(
    () => optionsAsKeymap(getDefaultVariant(product)?.options ?? null) ?? {}
  )
  const [isUrlVariantApplied, setIsUrlVariantApplied] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { isSaved: productIsSaved, pendingProductIds, toggle } = useWishlist()
  const isSaved = productIsSaved(product.id)
  const countryCode = useParams().countryCode as string

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const variantId = new URLSearchParams(window.location.search).get("v_id")
    const variant = product.variants?.find((v) => v.id === variantId)
    if (variant) {
      setOptions(optionsAsKeymap(variant.options) ?? {})
    }
    setIsUrlVariantApplied(true)
  }, [product.variants])

  useEffect(() => {
    if (!isUrlVariantApplied) {
      return
    }

    const params = new URLSearchParams(window.location.search)
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    const nextUrl = pathname + "?" + params.toString()

    History.prototype.replaceState.call(
      window.history,
      window.history.state,
      "",
      nextUrl
    )
    window.dispatchEvent(
      new CustomEvent("sg:variant-change", {
        detail: value ?? undefined,
      })
    )
  }, [selectedVariant, isValidVariant, isUrlVariantApplied, pathname])

  const inStock = useMemo(
    () => isVariantInStock(selectedVariant),
    [selectedVariant]
  )

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })
    notifyCartUpdated()

    setIsAdding(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleAddToCart()
  }

  const copyProductLink = () =>
    navigator.clipboard?.writeText(window.location.href)

  const shareProduct = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.title,
        url: window.location.href,
      })
      return
    }

    await copyProductLink()
  }

  return (
    <>
      <div className="flex flex-col gap-y-2">
        <form
          method="post"
          action={`/${countryCode}/cart/add`}
          onSubmit={handleSubmit}
          className="flex flex-col gap-y-2"
          {...{
            toolname: "add_to_cart",
            tooldescription:
              "Add the selected product variant to the shopping cart",
          }}
        >
          <input type="hidden" name="product_id" value={product.id} />
          <input
            type="hidden"
            name="variant_id"
            value={isValidVariant ? selectedVariant?.id ?? "" : ""}
          />
          <input type="hidden" name="quantity" value={quantity} />

          <ProductPrice product={product} variant={selectedVariant} />

          <div className="sg-product-actions__meta">
            <span>SKU:</span>
            <strong>{selectedVariant?.sku || "—"}</strong>
          </div>

          {product.description && (
            <p
              className="sg-product-info__description whitespace-pre-line"
              data-testid="product-description"
            >
              {product.description}
            </p>
          )}

          <div>
            {(product.variants?.length ?? 0) > 1 && (
              <div className="flex flex-col gap-y-4">
                {(product.options || []).map((option) => {
                  return (
                    <div key={option.id}>
                      <OptionSelect
                        option={option}
                        current={options[option.id]}
                        updateOption={setOptionValue}
                        title={option.title ?? ""}
                        name={`options[${option.id}]`}
                        data-testid="product-options"
                        disabled={!!disabled || isAdding}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {selectedVariant && isValidVariant && (
            <p
              className="text-small-regular text-ui-fg-subtle"
              data-testid="product-availability"
            >
              {inStock ? "In stock" : "Out of stock"}
            </p>
          )}

          <div className="sg-product-actions__row">
            <div className="sg-product-actions__quantity" aria-label="Quantity">
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
            <BrandButton
              type="submit"
              disabled={
                !inStock ||
                !selectedVariant ||
                !!disabled ||
                isAdding ||
                !isValidVariant
              }
              variant="primary"
              className="sg-product-actions__cart"
              data-testid="add-product-button"
            >
              {isAdding
                ? "Adding..."
                : !selectedVariant
                ? "Select variant"
                : !inStock || !isValidVariant
                ? "Out of stock"
                : "Add to cart"}
            </BrandButton>
            <BrandButton
              type="button"
              variant="secondary"
              selected={isSaved}
              className="sg-product-actions__save"
              leadingIcon={<WishlistHeart saved={isSaved} />}
              onClick={() => toggle(product.id)}
              disabled={pendingProductIds.has(product.id)}
              aria-pressed={isSaved}
              aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isSaved ? "Added to wishlist" : "Add to wishlist"}
            </BrandButton>
          </div>
        </form>
        <div className="sg-product-actions__share">
          <span>Share:</span>
          <BrandButton
            type="button"
            variant="social"
            size="small"
            leadingIcon={
              <Image
                src="/assets/shop/product-instagram.svg"
                alt=""
                width={20.16}
                height={20.16}
              />
            }
            aria-label="Share on Instagram"
            onClick={copyProductLink}
          />
          <BrandButton
            type="button"
            variant="social"
            size="small"
            leadingIcon={
              <Image
                src="/assets/shop/product-facebook.svg"
                alt=""
                width={20.16}
                height={20.16}
              />
            }
            aria-label="Share on Facebook"
            onClick={() =>
              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  window.location.href
                )}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          />
          <BrandButton
            type="button"
            variant="social"
            size="small"
            leadingIcon={
              <Image
                src="/assets/shop/product-x.svg"
                alt=""
                width={20.16}
                height={20.16}
              />
            }
            aria-label="Share on X"
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  window.location.href
                )}&text=${encodeURIComponent(product.title || "")}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          />
          <BrandButton
            type="button"
            variant="social"
            size="small"
            leadingIcon={
              <Image
                src="/assets/shop/product-share.svg"
                alt=""
                width={20.16}
                height={20.16}
              />
            }
            aria-label="Share product"
            onClick={shareProduct}
          />
        </div>
      </div>
    </>
  )
}
