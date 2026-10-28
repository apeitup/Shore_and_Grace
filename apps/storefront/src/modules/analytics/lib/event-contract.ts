export type StorefrontEventProperties = {
  product_viewed: {
    product_id: string
    variant_id?: string
    category_id?: string
    price?: number
    currency_code?: string
    country_code?: string
  }
  product_added_to_cart: {
    product_id: string
    variant_id: string
    price?: number
    currency_code?: string
    quantity: number
    country_code?: string
  }
  product_removed_from_cart: {
    product_id?: string
    variant_id?: string
    price?: number
    currency_code?: string
    quantity: number
  }
  cart_viewed: {
    cart_value: number
    currency_code: string
    item_count: number
    country_code?: string
  }
  checkout_started: {
    cart_value: number
    currency_code: string
    item_count: number
    country_code?: string
  }
  checkout_step_completed: {
    step_name: "details" | "delivery" | "payment" | "review"
    cart_value: number
    currency_code: string
    item_count: number
    country_code?: string
  }
  order_completed: {
    order_value: number
    currency_code: string
    item_count: number
    country_code?: string
  }
  wishlist_item_added: {
    product_id: string
  }
}

export type StorefrontEventName = keyof StorefrontEventProperties

const allowedProperties: {
  [EventName in StorefrontEventName]: ReadonlyArray<
    keyof StorefrontEventProperties[EventName]
  >
} = {
  product_viewed: [
    "product_id",
    "variant_id",
    "category_id",
    "price",
    "currency_code",
    "country_code",
  ],
  product_added_to_cart: [
    "product_id",
    "variant_id",
    "price",
    "currency_code",
    "quantity",
    "country_code",
  ],
  product_removed_from_cart: [
    "product_id",
    "variant_id",
    "price",
    "currency_code",
    "quantity",
  ],
  cart_viewed: [
    "cart_value",
    "currency_code",
    "item_count",
    "country_code",
  ],
  checkout_started: [
    "cart_value",
    "currency_code",
    "item_count",
    "country_code",
  ],
  checkout_step_completed: [
    "step_name",
    "cart_value",
    "currency_code",
    "item_count",
    "country_code",
  ],
  order_completed: [
    "order_value",
    "currency_code",
    "item_count",
    "country_code",
  ],
  wishlist_item_added: ["product_id"],
}

const safeValue = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed ? trimmed.slice(0, 200) : undefined
  }

  return undefined
}

export const sanitizeStorefrontEventProperties = <
  EventName extends StorefrontEventName,
>(
  eventName: EventName,
  properties: StorefrontEventProperties[EventName]
) => {
  const source = properties as Record<string, unknown>

  return Object.fromEntries(
    allowedProperties[eventName].flatMap((key) => {
      const value = safeValue(source[String(key)])
      return value === undefined ? [] : [[key, value]]
    })
  )
}
