import BrandSignature from "@modules/brand/components/brand-signature"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { ReactNode } from "react"

type SiteHeaderProps = {
  cart?: ReactNode
  menu?: ReactNode
}

export default function SiteHeader({ cart, menu }: SiteHeaderProps) {
  return (
    <header className="sg-header">
      <nav className="content-container sg-nav" aria-label="Primary navigation">
        <div className="sg-nav__mobile-menu">
          {menu ?? (
            <button className="sg-nav-icon" aria-label="Open menu">
              <Image
                src="/assets/icons/menu.svg"
                alt=""
                width={28}
                height={28}
              />
            </button>
          )}
        </div>

        <LocalizedClientLink href="/" className="sg-nav__brand">
          <span className="sg-nav__brand-desktop">
            <BrandSignature />
          </span>
          <span className="sg-nav__brand-mobile">
            <BrandSignature mobile />
          </span>
        </LocalizedClientLink>

        <div className="sg-nav__links">
          <LocalizedClientLink href="/">Home</LocalizedClientLink>
          <LocalizedClientLink href="/store">Shop</LocalizedClientLink>
          <LocalizedClientLink href="/contact">Services</LocalizedClientLink>
          <LocalizedClientLink href="/contact">About</LocalizedClientLink>
          <LocalizedClientLink href="/contact">Contact</LocalizedClientLink>
        </div>

        <div className="sg-nav__actions">
          {cart ?? (
            <LocalizedClientLink
              href="/cart"
              className="sg-nav-icon"
              aria-label="Shopping cart"
            >
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet="/assets/icons/cart-mobile.svg"
                />
                <Image
                  src="/assets/icons/cart.svg"
                  alt=""
                  width={28}
                  height={28}
                />
              </picture>
            </LocalizedClientLink>
          )}
          <LocalizedClientLink
            className="sg-nav-icon sg-nav__account"
            href="/account"
            aria-label="My account"
          >
            <Image src="/assets/icons/user.svg" alt="" width={28} height={28} />
          </LocalizedClientLink>
        </div>
      </nav>
    </header>
  )
}
