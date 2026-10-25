import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import SiteHeader from "@modules/brand/components/site-header"
import ScrollHeader from "@modules/brand/components/scroll-header"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import Image from "next/image"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <ScrollHeader>
      <SiteHeader
        menu={
          <SideMenu
            regions={regions}
            locales={locales}
            currentLocale={currentLocale}
          />
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
