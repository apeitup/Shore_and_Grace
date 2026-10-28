"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { retrieveCart } from "@lib/data/cart"
import { CART_UPDATED_EVENT } from "@lib/util/cart-events"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import BrandButton from "@modules/brand/components/button"
import { Button } from "@modules/common/components/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"
import Image from "next/image"

const countItems = (cart?: HttpTypes.StoreCart | null) =>
  cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

const getCheckoutStep = (cart: HttpTypes.StoreCart) => {
  if (!cart.shipping_address?.address_1 || !cart.email) {
    return "address"
  }

  if (!cart.shipping_methods?.length) {
    return "delivery"
  }

  return "payment"
}

const CartDropdown = ({
  cart: serverCart,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  // Statically rendered pages can't read the cart cookie, so the cart is loaded in the browser.
  const [clientCart, setClientCart] = useState<HttpTypes.StoreCart | null>(null)
  const cartState = serverCart ?? clientCart
  const [activeTimer, setActiveTimer] = useState<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems = countItems(cartState)

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  useEffect(() => {
    if (serverCart) {
      return
    }

    let isInitialLoad = true
    const load = () =>
      retrieveCart()
        .then((cart) => {
          if (isInitialLoad) {
            // Don't auto-open the dropdown for items that were already in the cart.
            itemRef.current = countItems(cart)
            isInitialLoad = false
          }
          setClientCart(cart)
        })
        .catch(() => {})

    load()
    window.addEventListener(CART_UPDATED_EVENT, load)
    return () => window.removeEventListener(CART_UPDATED_EVENT, load)
  }, [serverCart])

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <PopoverButton className="h-full">
          <LocalizedClientLink
            className="sg-nav-icon"
            href="/cart"
            data-testid="nav-cart-link"
            aria-label={`Shopping cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
          >
            <Image
              className="sg-theme-asset sg-theme-asset--light"
              src="/assets/icons/cart.svg"
              alt=""
              width={28}
              height={28}
            />
            <Image
              className="sg-theme-asset sg-theme-asset--dark"
              src="/assets/icons/cart-dark.svg"
              alt=""
              width={28}
              height={28}
            />
            {totalItems > 0 && (
              <span className="sg-cart-count">{totalItems}</span>
            )}
          </LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="sg-cart-dropdown hidden small:block"
            data-testid="nav-cart-dropdown"
          >
            {cartState && cartState.items?.length ? (
              <>
                <div className="sg-cart-dropdown__items no-scrollbar">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="sg-cart-dropdown__item"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="sg-cart-dropdown__image"
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="sg-cart-dropdown__item-details">
                          <div className="sg-cart-dropdown__copy">
                            <h3>
                              <LocalizedClientLink
                                href={`/products/${item.product_handle}`}
                                data-testid="product-link"
                              >
                                {item.title}
                              </LocalizedClientLink>
                            </h3>
                            <LineItemOptions
                              variant={item.variant}
                              data-testid="cart-item-variant"
                              data-value={item.variant}
                            />
                            <span
                              data-testid="cart-item-quantity"
                              data-value={item.quantity}
                            >
                              Quantity: {item.quantity}
                            </span>
                          </div>
                          <div className="sg-cart-dropdown__item-actions">
                            <LineItemPrice
                              item={item}
                              style="tight"
                              currencyCode={cartState.currency_code}
                            />
                            <DeleteButton
                              id={item.id}
                              className="sg-cart-dropdown__remove"
                              icon={
                                <span
                                  className="sg-cart-dropdown__remove-icon"
                                  aria-hidden="true"
                                />
                              }
                              data-testid="cart-item-remove-button"
                            >
                              Remove
                            </DeleteButton>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="sg-cart-dropdown__subtotal">
                  <span>
                      Subtotal{" "}
                    <small>(excl. taxes)</small>
                  </span>
                  <strong
                    data-testid="cart-subtotal"
                    data-value={subtotal}
                  >
                    {convertToLocale({
                      amount: subtotal,
                      currency_code: cartState.currency_code,
                    })}
                  </strong>
                </div>
                <div className="sg-cart-dropdown__actions">
                  <BrandButton
                    href="/cart"
                    tone="outline"
                    className="sg-cart-dropdown__cart-link"
                    data-testid="go-to-cart-button"
                  >
                    Go to cart
                  </BrandButton>
                  <BrandButton
                    href={`/checkout?step=${getCheckoutStep(cartState)}`}
                    tone="ink"
                    className="sg-cart-dropdown__checkout-link"
                    data-testid="dropdown-checkout-button"
                  >
                    Checkout
                  </BrandButton>
                </div>
              </>
            ) : (
              <div>
                <div className="flex py-16 flex-col gap-y-4 items-center justify-center">
                  <div className="bg-gray-900 text-small-regular flex items-center justify-center w-6 h-6 rounded-full text-white">
                    <span>0</span>
                  </div>
                  <span>Your shopping bag is empty.</span>
                  <div>
                    <LocalizedClientLink href="/store">
                      <>
                        <span className="sr-only">Go to all products page</span>
                        <Button onClick={close}>Explore products</Button>
                      </>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
