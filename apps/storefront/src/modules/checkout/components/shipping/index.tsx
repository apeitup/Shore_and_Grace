"use client"

import { Radio, RadioGroup } from "@headlessui/react"
import { setShippingMethod, updateCart } from "@lib/data/cart"
import {
  FloristDeliveryOption,
  getFloristDeliveryOptions,
  reserveFloristDelivery,
} from "@lib/data/florist-delivery"
import { saveGiftOrderDetails } from "@lib/data/gift-order"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartTotals from "@modules/common/components/cart-totals"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { Check, CheckCircleSolid, RefreshDouble } from "iconoir-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  CustomerPreferences,
  saveCustomerPreferences,
} from "@lib/data/customer-preferences"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
  customerPreferences?: CustomerPreferences
}

type ShippingOptionWithDetails = HttpTypes.StoreCartShippingOption & {
  type?: {
    description?: string
  }
  service_zone?: {
    fulfillment_set?: {
      type?: string
      location?: {
        address?: HttpTypes.StoreCartAddress
      }
    }
  }
}

const displayShippingPrice = (
  amount: number | null | undefined,
  currencyCode: string
) =>
  !amount
    ? "FREE"
    : convertToLocale({ amount, currency_code: currencyCode })

const formatAddress = (address?: HttpTypes.StoreCartAddress) => {
  if (!address) {
    return "Collect from the studio"
  }

  return [address.address_1, address.address_2, address.city, address.postal_code]
    .filter(Boolean)
    .join(", ")
}

const Shipping = ({
  cart,
  availableShippingMethods,
  customerPreferences,
}: ShippingProps) => {
  const metadata = cart.metadata ?? {}
  const hasDeliveryInstructions = Object.prototype.hasOwnProperty.call(
    metadata,
    "delivery_instructions"
  )
  const hasLeaveSafe = Object.prototype.hasOwnProperty.call(metadata, "leave_safe")
  const hasHidePrices = Object.prototype.hasOwnProperty.call(metadata, "hide_prices")
  const rememberDelivery =
    customerPreferences?.remember_delivery_preferences === true
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    hasDeliveryInstructions
      ? String(metadata.delivery_instructions ?? "")
      : rememberDelivery
        ? customerPreferences?.default_delivery_instructions ?? ""
        : ""
  )
  const [giftMessage, setGiftMessage] = useState(
    String(metadata.gift_message ?? "")
  )
  const [leaveSafe, setLeaveSafe] = useState(
    hasLeaveSafe
      ? metadata.leave_safe === true
      : rememberDelivery
        ? customerPreferences?.leave_in_safe_place === true
        : false
  )
  const [hidePrices, setHidePrices] = useState(
    hasHidePrices
      ? metadata.hide_prices !== false
      : rememberDelivery
        ? customerPreferences?.hide_prices !== false
        : true
  )
  const [floristOptions, setFloristOptions] = useState<
    FloristDeliveryOption[]
  >([])
  const [selectedZoneId, setSelectedZoneId] = useState(
    String(metadata.delivery_zone_id ?? "")
  )
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(
    String(metadata.delivery_date ?? "")
  )
  const [isLoadingDates, setIsLoadingDates] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isOpen = searchParams.get("step") === "delivery"

  const shippingMethods = useMemo(
    () => (availableShippingMethods ?? []) as ShippingOptionWithDetails[],
    [availableShippingMethods]
  )
  const eligibleShippingOptionIds = useMemo(
    () =>
      floristOptions
        .map((option) => option.shipping_option_id)
        .filter((id): id is string => Boolean(id)),
    [floristOptions]
  )
  const visibleShippingMethods = useMemo(
    () =>
      eligibleShippingOptionIds.length
        ? shippingMethods.filter((method) =>
            eligibleShippingOptionIds.includes(method.id)
          )
        : shippingMethods,
    [eligibleShippingOptionIds, shippingMethods]
  )

  useEffect(() => {
    const calculatedMethods = shippingMethods.filter(
      (method) => method.price_type === "calculated"
    )

    if (!calculatedMethods.length) {
      return
    }

    Promise.allSettled(
      calculatedMethods.map((method) =>
        calculatePriceForShippingOption(method.id, cart.id)
      )
    ).then((results) => {
      const prices: Record<string, number> = {}

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value?.id) {
          prices[result.value.id] = result.value.amount ?? 0
        }
      })

      setCalculatedPricesMap(prices)
      setIsLoadingPrices(false)
    })
  }, [cart.id, shippingMethods])

  useEffect(() => {
    const postcode = cart.shipping_address?.postal_code
    if (!postcode) {
      return
    }

    getFloristDeliveryOptions(postcode)
      .then((result) => {
        setFloristOptions(result.options)
        const initial =
          result.options.find((option) => option.id === selectedZoneId) ||
          result.options[0]
        if (initial) {
          setSelectedZoneId(initial.id)
          setSelectedDeliveryDate((current) => current || initial.dates[0]?.date || "")
        }
      })
      .catch(() => setFloristOptions([]))
      .finally(() => setIsLoadingDates(false))
  }, [cart.shipping_address?.postal_code, selectedZoneId])

  const handleEdit = () => {
    router.push(`${pathname}?step=delivery`, { scroll: false })
  }

  const handleSetShippingMethod = async (id: string) => {
    const previousId = shippingMethodId
    setError(null)
    setIsLoading(true)
    setShippingMethodId(id)

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((reason) => {
        setShippingMethodId(previousId)
        setError(reason instanceof Error ? reason.message : String(reason))
      })
      .finally(() => setIsLoading(false))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!shippingMethodId) {
      setError("Choose a delivery option to continue.")
      return
    }

    if (floristOptions.length && (!selectedZoneId || !selectedDeliveryDate)) {
      setError("Choose an available delivery date to continue.")
      return
    }
    if (
      eligibleShippingOptionIds.length &&
      (!shippingMethodId || !eligibleShippingOptionIds.includes(shippingMethodId))
    ) {
      setError("Choose the delivery method linked to your selected date.")
      return
    }

    setError(null)
    setIsLoading(true)

    const selectedZone = floristOptions.find(
      (option) => option.id === selectedZoneId
    )

    await Promise.all([
      updateCart({
        metadata: {
          ...metadata,
          delivery_instructions: deliveryInstructions,
          gift_message: giftMessage,
          leave_safe: leaveSafe,
          hide_prices: hidePrices,
          delivery_zone_id: selectedZoneId || null,
          delivery_zone_name: selectedZone?.name || null,
          delivery_date: selectedDeliveryDate || null,
          delivery_window: selectedZone?.delivery_window || null,
        },
      }),
      saveGiftOrderDetails({
        cart_id: cart.id,
        gift_message: giftMessage || null,
        delivery_instructions: deliveryInstructions || null,
        leave_safe: leaveSafe,
        hide_prices: hidePrices,
      }),
      ...(selectedZoneId && selectedDeliveryDate
        ? [
            reserveFloristDelivery({
              cart_id: cart.id,
              zone_id: selectedZoneId,
              postcode: cart.shipping_address?.postal_code,
              delivery_date: selectedDeliveryDate,
            }),
          ]
        : []),
    ])
      .then(async () => {
        if (rememberDelivery) {
          await saveCustomerPreferences({
            default_delivery_instructions: deliveryInstructions || null,
            leave_in_safe_place: leaveSafe,
            hide_prices: hidePrices,
          })
        }
      })
      .then(() => router.push(`${pathname}?step=payment`, { scroll: false }))
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : String(reason))
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <section
      className={`sg-checkout-section sg-checkout-section--delivery${isOpen ? " is-open" : ""}`}
    >
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
        >
          Delivery
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircleSolid aria-hidden="true" />
          )}
        </Heading>
        {!isOpen && cart.shipping_methods?.length ? (
          <Text>
            <button
              type="button"
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-delivery-button"
            >
              Edit
            </button>
          </Text>
        ) : null}
      </div>

      {isOpen ? (
        <form
          id="checkout-delivery-form"
          className="sg-checkout-delivery"
          onSubmit={handleSubmit}
        >
          <div className="sg-checkout-delivery-card sg-checkout-delivery-options">
            <Heading level="h3">Choose a delivery date</Heading>
            <p>
              Available options for{" "}
              {cart.shipping_address?.postal_code || "the recipient postcode"}.
              Select the date the flowers should arrive.
            </p>

            {isLoadingDates && <p>Checking date availability…</p>}
            {!isLoadingDates && floristOptions.length > 0 && (
              <div className="sg-checkout-florist-dates">
                {floristOptions.map((option) => (
                  <div key={option.id} className="sg-checkout-florist-zone">
                    <strong>{option.name}</strong>
                    {option.delivery_window && <span>{option.delivery_window}</span>}
                    <div className="sg-checkout-florist-dates__list">
                      {option.dates.slice(0, 7).map((date) => {
                        const checked =
                          selectedZoneId === option.id &&
                          selectedDeliveryDate === date.date
                        return (
                          <button
                            key={date.date}
                            type="button"
                            className={checked ? "is-selected" : ""}
                            aria-pressed={checked}
                            onClick={() => {
                              setSelectedZoneId(option.id)
                              setSelectedDeliveryDate(date.date)
                              if (
                                option.shipping_option_id &&
                                option.shipping_option_id !== shippingMethodId
                              ) {
                                handleSetShippingMethod(option.shipping_option_id)
                              }
                            }}
                          >
                            <span>
                              {new Intl.DateTimeFormat("en-GB", {
                                weekday: "short",
                              }).format(new Date(`${date.date}T12:00:00`))}
                            </span>
                            <strong>
                              {new Intl.DateTimeFormat("en-GB", {
                                day: "numeric",
                                month: "short",
                              }).format(new Date(`${date.date}T12:00:00`))}
                            </strong>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoadingDates &&
              cart.shipping_address?.postal_code &&
              floristOptions.length === 0 && (
                <p>
                  No florist delivery schedule has been configured for this
                  postcode yet. The standard delivery methods remain available.
                </p>
              )}

            <RadioGroup
              value={shippingMethodId}
              onChange={(value) => value && handleSetShippingMethod(value)}
              className="sg-checkout-delivery-options__list"
            >
              {visibleShippingMethods.map((option) => {
                const calculatedAmount = calculatedPricesMap[option.id]
                const isDisabled =
                  option.insufficient_inventory ||
                  (option.price_type === "calculated" &&
                    !isLoadingPrices &&
                    typeof calculatedAmount !== "number")
                const isPickup =
                  option.service_zone?.fulfillment_set?.type === "pickup"
                const description = isPickup
                  ? formatAddress(
                      option.service_zone?.fulfillment_set?.location?.address
                    )
                  : option.type?.description || "Local delivery"

                return (
                  <Radio
                    key={option.id}
                    value={option.id}
                    disabled={isDisabled}
                    data-testid="delivery-option-radio"
                    className={({ checked }) =>
                      `sg-checkout-delivery-option${checked ? " is-selected" : ""}`
                    }
                  >
                    {({ checked }) => (
                      <>
                        <span
                          className="sg-checkout-delivery-radio"
                          aria-hidden="true"
                        >
                          {checked && <span />}
                        </span>
                        <span className="sg-checkout-delivery-option__name">
                          {option.name}
                        </span>
                        <span className="sg-checkout-delivery-option__description">
                          {description}
                        </span>
                        <strong>
                          {option.price_type === "flat"
                            ? displayShippingPrice(
                                option.amount,
                                cart.currency_code
                              )
                            : typeof calculatedAmount === "number"
                              ? displayShippingPrice(
                                  calculatedAmount,
                                  cart.currency_code
                                )
                              : isLoadingPrices
                                ? (
                                    <RefreshDouble
                                      className="animate-spin"
                                      aria-label="Calculating"
                                    />
                                  )
                                : "Unavailable"}
                        </strong>
                      </>
                    )}
                  </Radio>
                )
              })}
            </RadioGroup>
          </div>

          <div className="sg-checkout-delivery-card sg-checkout-delivery-details">
            <Heading level="h3">Delivery details</Heading>

            <label className="sg-checkout-delivery-field">
              <span>Delivery instructions</span>
              <input
                name="delivery_instructions"
                value={deliveryInstructions}
                onChange={(event) => setDeliveryInstructions(event.target.value)}
                autoComplete="off"
              />
            </label>

            <label className="sg-checkout-delivery-check">
              <span className="sg-checkout-delivery-checkbox">
                <input
                  type="checkbox"
                  name="leave_safe"
                  checked={leaveSafe}
                  onChange={(event) => setLeaveSafe(event.target.checked)}
                />
                {leaveSafe && <Check aria-hidden="true" />}
              </span>
              <span>Leave in a safe place if the recipient is unavailable</span>
            </label>

            <label className="sg-checkout-delivery-field">
              <span>Gift message</span>
              <input
                name="gift_message"
                value={giftMessage}
                onChange={(event) => setGiftMessage(event.target.value)}
                autoComplete="off"
              />
            </label>

            <label className="sg-checkout-delivery-check">
              <span className="sg-checkout-delivery-checkbox">
                <input
                  type="checkbox"
                  name="hide_prices"
                  checked={hidePrices}
                  onChange={(event) => setHidePrices(event.target.checked)}
                />
                {hidePrices && <Check aria-hidden="true" />}
              </span>
              <span>Do not include prices with the flowers</span>
            </label>
          </div>

          <div className="sg-checkout-mobile-totals">
            <Heading level="h3">Order Summary</Heading>
            <CartTotals totals={cart} />
            <Button
              size="large"
              type="submit"
              isLoading={isLoading}
              disabled={!shippingMethodId}
              data-testid="submit-delivery-option-button-mobile"
            >
              Continue to payment
            </Button>
            <LocalizedClientLink href="/checkout?step=address">
              Go back to details
            </LocalizedClientLink>
          </div>

          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />
        </form>
      ) : (
        <div className="text-small-regular">
          {cart.shipping_methods?.length ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Method
              </Text>
              <Text className="txt-medium text-ui-fg-subtle">
                {cart.shipping_methods.at(-1)?.name}{" "}
                {convertToLocale({
                  amount: cart.shipping_methods.at(-1)?.amount ?? 0,
                  currency_code: cart.currency_code,
                })}
              </Text>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

export default Shipping
