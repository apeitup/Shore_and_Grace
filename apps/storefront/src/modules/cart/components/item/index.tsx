"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { EditPencil, Minus, Plus, RefreshDouble, Trash } from "iconoir-react"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview" | "checkout" | "mobile"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isOnSale =
    (item.original_total ?? item.total ?? 0) > (item.total ?? 0)
  const hasConfigurableOptions = Boolean(
    item.variant?.title && !/^default(?: variant)?$/i.test(item.variant.title)
  )

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  const quantityControl = (
    <div className="sg-cart-line-quantity" data-testid="product-select-button">
      <button
        type="button"
        onClick={() => changeQuantity(Math.max(1, item.quantity - 1))}
        disabled={updating || item.quantity <= 1}
        aria-label="Decrease quantity"
      >
        <Minus aria-hidden="true" />
      </button>
      <span aria-live="polite">
        {updating ? <RefreshDouble className="animate-spin" /> : item.quantity}
      </span>
      <button
        type="button"
        onClick={() => changeQuantity(Math.min(maxQuantity, item.quantity + 1))}
        disabled={updating || item.quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        <Plus aria-hidden="true" />
      </button>
    </div>
  )

  if (type === "mobile") {
    return (
      <article
        className="sg-cart-mobile-item"
        data-testid="product-row"
        data-on-sale={isOnSale ? "true" : undefined}
      >
        <div className="sg-cart-mobile-item__product">
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className="sg-cart-mobile-item__image"
          >
            <Thumbnail
              thumbnail={item.thumbnail}
              images={item.variant?.product?.images}
              size="square"
              alt={item.product_title}
            />
          </LocalizedClientLink>

          <div className="sg-cart-mobile-item__info">
            <LocalizedClientLink
              href={`/products/${item.product_handle}`}
              className="sg-cart-mobile-item__title"
              data-testid="product-title"
            >
              {item.product_title}
            </LocalizedClientLink>

            {hasConfigurableOptions && (
              <div className="sg-cart-mobile-item__options">
                <LineItemOptions
                  variant={item.variant}
                  data-testid="product-variant"
                />
                <LocalizedClientLink
                  href={`/products/${item.product_handle}`}
                  className="sg-cart-mobile-item__edit"
                  aria-label={`Edit ${item.product_title}`}
                >
                  <EditPencil aria-hidden="true" />
                </LocalizedClientLink>
              </div>
            )}

            <div className="sg-cart-mobile-item__price">
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </div>
          </div>
        </div>

        <div className="sg-cart-mobile-item__actions">
          {quantityControl}
          <span className="sg-cart-mobile-item__total">
            <strong>Total</strong>
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>
          <DeleteButton
            id={item.id}
            className="sg-cart-mobile-item__remove"
            data-testid="product-delete-button"
            icon={<Trash aria-hidden="true" />}
            analytics={{
              product_id: item.product_id ?? undefined,
              variant_id: item.variant_id ?? undefined,
              price: item.unit_price,
              currency_code: currencyCode,
              quantity: item.quantity,
            }}
          />
        </div>

        {error && (
          <ErrorMessage error={error} data-testid="product-error-message" />
        )}
      </article>
    )
  }

  return (
    <Table.Row
      className={clx("w-full", { "sg-checkout-order-item": type === "checkout" })}
      data-testid="product-row"
      data-on-sale={type === "full" && isOnSale ? "true" : undefined}
      data-has-options={
        type === "full" && hasConfigurableOptions ? "true" : undefined
      }
    >
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        {(type === "checkout" || hasConfigurableOptions) && (
          <span className="sg-checkout-order-item__options">
            <LineItemOptions variant={item.variant} data-testid="product-variant" />
            {(type === "checkout" || type === "full") && (
              <LocalizedClientLink
                href={`/products/${item.product_handle}`}
                className={clx({ "sg-cart-item__edit": type === "full" })}
                aria-label={`Edit ${item.product_title}`}
              >
                <EditPencil aria-hidden="true" />
              </LocalizedClientLink>
            )}
          </span>
        )}
        {type === "checkout" && (
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        )}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell>
          <div className="flex items-center justify-center gap-2">
            {quantityControl}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell>
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="text-right">
          <DeleteButton
            id={item.id}
            data-testid="product-delete-button"
            icon={<Trash aria-hidden="true" />}
            analytics={{
              product_id: item.product_id ?? undefined,
              variant_id: item.variant_id ?? undefined,
              price: item.unit_price,
              currency_code: currencyCode,
              quantity: item.quantity,
            }}
          />
        </Table.Cell>
      )}

      {type === "preview" && (
        <Table.Cell className="!pr-0">
          <span className="flex h-full flex-col items-end justify-center">
            <span className="flex gap-x-1">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>
        </Table.Cell>
      )}

      {type === "checkout" && (
        <Table.Cell className="sg-checkout-order-item__actions">
          {quantityControl}
          <span className="sg-checkout-order-item__total">
            <strong>Total</strong>
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>
          <DeleteButton
            id={item.id}
            className="sg-checkout-order-item__remove"
            data-testid="product-delete-button"
            icon={<Trash aria-hidden="true" />}
          />
          {error && (
            <ErrorMessage error={error} data-testid="product-error-message" />
          )}
        </Table.Cell>
      )}
    </Table.Row>
  )
}

export default Item
