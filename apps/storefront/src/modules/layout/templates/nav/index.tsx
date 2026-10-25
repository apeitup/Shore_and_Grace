import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import SiteHeader from "@modules/brand/components/site-header"
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
    <div className="sticky top-0 inset-x-0 z-50 group">
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
                  src="/assets/icons/cart.svg"
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
    </div>
  )
}
