# Storefront analytics event taxonomy

Status: implemented contract, last reviewed 28 October 2026.

The storefront sends these events to PostHog only after analytics consent. The
central runtime allowlist removes every property not listed below. Names,
emails, phone numbers, postal addresses, delivery instructions and gift
messages must never be passed to the analytics API.

| Event | Trigger | Allowed properties |
| --- | --- | --- |
| `product_viewed` | A product page is shown | `product_id`, `variant_id`, `category_id`, `price`, `currency_code`, `country_code` |
| `product_added_to_cart` | A product or quick-add action succeeds | `product_id`, `variant_id`, `price`, `currency_code`, `quantity`, `country_code` |
| `product_removed_from_cart` | A cart-line deletion succeeds | `product_id`, `variant_id`, `price`, `currency_code`, `quantity` |
| `cart_viewed` | A non-empty cart page is shown | `cart_value`, `currency_code`, `item_count`, `country_code` |
| `checkout_started` | Checkout is shown | `cart_value`, `currency_code`, `item_count`, `country_code` |
| `checkout_step_completed` | The visitor advances from details, delivery or payment, or completes review | `step_name`, `cart_value`, `currency_code`, `item_count`, `country_code` |
| `order_completed` | The confirmed-order page is shown after a successful order | `order_value`, `currency_code`, `item_count`, `country_code` |
| `wishlist_item_added` | An authenticated wishlist add succeeds | `product_id` |

## Deduplication

- Repeated React renders are deduplicated in memory.
- Completed checkout steps and order-confirmation events are deduplicated for
  the browser tab using consent-gated session storage.
- Removing analytics consent stops future capture. No checkout or order
  deduplication storage is written before consent.

## PostHog configuration

- Product Analytics and Web Analytics are selected.
- Autocapture, heatmaps, web vitals, session replay and surveys are disabled.
- Person profiles are identified-only; this implementation does not identify
  visitors or send customer/recipient fields.
- Localhost capture is disabled by default and requires the explicit
  `NEXT_PUBLIC_POSTHOG_CAPTURE_LOCALHOST=true` development override.
