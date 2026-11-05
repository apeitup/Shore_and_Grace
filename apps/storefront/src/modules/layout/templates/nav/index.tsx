import { Suspense } from "react"

import { retrieveCustomer } from "@lib/data/customer"
import SiteHeader from "@modules/brand/components/site-header"
import ScrollHeader from "@modules/brand/components/scroll-header"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import Image from "next/image"

export default async function Nav() {
  const customer = await retrieveCustomer()

  return (
    <ScrollHeader>
      <SiteHeader
        menu={
          <SideMenu customer={customer} />
        }
        cart={
          <Suspense
            fallback={
              <LocalizedClientLink
                className="sg-nav-icon"
                href="/cart"
                aria-label="Cart, empty"
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
              </LocalizedClientLink>
            }
          >
            <CartButton />
          </Suspense>
        }
      />
    </ScrollHeader>
  )
}
