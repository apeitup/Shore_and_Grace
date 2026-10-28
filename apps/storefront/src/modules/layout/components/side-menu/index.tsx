"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { signout } from "@lib/data/customer"
import { serviceLinks } from "@lib/service-links"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  LogIn,
  LogOut,
  NavArrowDown,
  NavArrowUp,
  PageEdit,
  Xmark,
} from "iconoir-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Fragment, ReactNode, useEffect, useState } from "react"

type SideMenuProps = {
  categories: HttpTypes.StoreProductCategory[]
  customer: HttpTypes.StoreCustomer | null
}

type AccordionName = "shop" | "services"

function PageTransform({ open }: { open: boolean }) {
  useEffect(() => {
    if (!open) {
      return
    }

    document.documentElement.classList.add("sg-mobile-menu-open")

    return () => {
      document.documentElement.classList.remove("sg-mobile-menu-open")
    }
  }, [open])

  return null
}

function MenuLink({
  href,
  label,
  close,
  icon,
}: {
  href: string
  label: string
  close: () => void
  icon?: ReactNode
}) {
  return (
    <LocalizedClientLink href={href} onClick={close}>
      <span>{label}</span>
      {icon}
    </LocalizedClientLink>
  )
}

function MenuContents({
  categories,
  customer,
  close,
}: SideMenuProps & { close: () => void }) {
  const [expanded, setExpanded] = useState<AccordionName | null>(null)
  const { countryCode = "gb" } = useParams<{ countryCode?: string }>()
  const customerName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ")

  const toggleSection = (section: AccordionName) => {
    setExpanded((current) => (current === section ? null : section))
  }

  return (
    <>
      <header className="sg-mobile-menu__header">
        <button
          type="button"
          className="sg-mobile-menu__close"
          onClick={close}
          aria-label="Close menu"
        >
          <Xmark aria-hidden="true" />
        </button>

        {customer && (
          <p className="sg-mobile-menu__welcome">
            <span>Welcome back,</span>
            <strong>{customerName || customer.email}</strong>
          </p>
        )}
      </header>

      <div className="sg-mobile-menu__body">
        <p className="sg-mobile-menu__eyebrow">Explore</p>
        <nav aria-label="Mobile navigation">
          <ul className="sg-mobile-menu__links">
            <li>
              <MenuLink href="/" label="Home" close={close} />
            </li>
            <li>
              <button
                type="button"
                className="sg-mobile-menu__row"
                aria-expanded={expanded === "shop"}
                aria-controls="mobile-shop-links"
                onClick={() => toggleSection("shop")}
              >
                <span>Shop</span>
                {expanded === "shop" ? (
                  <NavArrowUp aria-hidden="true" />
                ) : (
                  <NavArrowDown aria-hidden="true" />
                )}
              </button>
              {expanded === "shop" && (
                <ul id="mobile-shop-links" className="sg-mobile-menu__subnav">
                  <li>
                    <MenuLink
                      href="/store"
                      label="Our Collection"
                      close={close}
                    />
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <MenuLink
                        href={`/categories/${category.handle}`}
                        label={category.name}
                        close={close}
                      />
                    </li>
                  ))}
                  <li>
                    <MenuLink
                      href="/wishlist"
                      label="Wishlist"
                      close={close}
                    />
                  </li>
                  <li>
                    <MenuLink href="/cart" label="Cart" close={close} />
                  </li>
                </ul>
              )}
            </li>
            <li>
              <button
                type="button"
                className="sg-mobile-menu__row"
                aria-expanded={expanded === "services"}
                aria-controls="mobile-service-links"
                onClick={() => toggleSection("services")}
              >
                <span>Services</span>
                {expanded === "services" ? (
                  <NavArrowUp aria-hidden="true" />
                ) : (
                  <NavArrowDown aria-hidden="true" />
                )}
              </button>
              {expanded === "services" && (
                <ul
                  id="mobile-service-links"
                  className="sg-mobile-menu__subnav"
                >
                  {serviceLinks.map((service) => (
                    <li key={service.slug}>
                      <MenuLink
                        href={`/services/${service.slug}`}
                        label={service.title}
                        close={close}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <MenuLink href="/contact" label="About" close={close} />
            </li>
            <li>
              <MenuLink href="/contact" label="Contact" close={close} />
            </li>
          </ul>
        </nav>

        <p className="sg-mobile-menu__eyebrow sg-mobile-menu__account-heading">
          Your account
        </p>
        <ul className="sg-mobile-menu__links">
          {customer ? (
            <>
              <li>
                <MenuLink href="/account" label="My Account" close={close} />
              </li>
              <li>
                <MenuLink href="/account/orders" label="Orders" close={close} />
              </li>
              <li>
                <MenuLink
                  href="/account/addresses"
                  label="Addresses"
                  close={close}
                />
              </li>
              <li>
                <button
                  type="button"
                  className="sg-mobile-menu__row"
                  onClick={() => void signout(countryCode)}
                >
                  <span>Sign out</span>
                  <LogOut aria-hidden="true" />
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <MenuLink
                  href="/account"
                  label="Sign in"
                  close={close}
                  icon={<LogIn aria-hidden="true" />}
                />
              </li>
              <li>
                <MenuLink
                  href="/account"
                  label="Create account"
                  close={close}
                  icon={<PageEdit aria-hidden="true" />}
                />
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  )
}

export default function SideMenu({ categories, customer }: SideMenuProps) {
  return (
    <Popover className="sg-mobile-menu">
      {({ open, close }) => (
        <>
          <PageTransform open={open} />
          <Popover.Button
            data-testid="nav-menu-button"
            className="sg-nav-icon"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <Xmark className="sg-nav-icon__close" aria-hidden="true" />
            ) : (
              <>
                <Image
                  className="sg-theme-asset sg-theme-asset--light"
                  src="/assets/icons/menu.svg"
                  alt=""
                  width={28}
                  height={28}
                />
                <Image
                  className="sg-theme-asset sg-theme-asset--dark"
                  src="/assets/icons/menu-dark.svg"
                  alt=""
                  width={28}
                  height={28}
                />
              </>
            )}
          </Popover.Button>

          <Transition
            show={open}
            as={Fragment}
            enter="transition-transform duration-200 ease-out"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-150 ease-in"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <PopoverPanel portal className="sg-mobile-menu__panel">
              <MenuContents
                categories={categories}
                customer={customer}
                close={close}
              />
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
