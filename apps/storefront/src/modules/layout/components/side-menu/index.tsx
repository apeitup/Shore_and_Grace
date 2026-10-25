"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { Locale } from "@lib/data/locales"
import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { Fragment } from "react"

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const primaryItems = [
  { label: "Shop", href: "/store", suffix: "−", featured: true },
  { label: "Occasions", href: "/store", suffix: "+" },
  { label: "Weddings", href: "/contact", suffix: "+" },
  { label: "Funerals", href: "/contact", suffix: "+" },
  { label: "Gifts", href: "/store", suffix: "+" },
  { label: "Our story", href: "/contact", suffix: "↗" },
]

const shopShortcuts = [
  { label: "Fresh flowers", href: "/store" },
  { label: "Faux flowers", href: "/store" },
  { label: "Subscriptions", href: "/store" },
  { label: "Gift cards", href: "/store" },
]

export default function SideMenu(_: SideMenuProps) {
  return (
    <Popover className="sg-mobile-menu">
      {({ open, close }) => (
        <>
          <Popover.Button
            data-testid="nav-menu-button"
            className="sg-nav-icon"
            aria-label="Open menu"
          >
            <Image src="/assets/icons/menu.svg" alt="" width={28} height={28} />
          </Popover.Button>

          {open && (
            <button
              className="sg-mobile-menu__backdrop"
              onClick={close}
              aria-label="Close menu"
              data-testid="side-menu-backdrop"
            />
          )}

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
            <PopoverPanel className="sg-mobile-menu__panel">
              <div className="sg-mobile-menu__header">
                <LocalizedClientLink href="/" onClick={close}>
                  <strong>Shore &amp; Grace</strong>
                  <span>Floral Studio</span>
                </LocalizedClientLink>
                <button onClick={close} aria-label="Close menu">
                  <XMark />
                </button>
              </div>

              <p className="sg-mobile-menu__eyebrow">Explore</p>

              <nav aria-label="Mobile navigation">
                <ul className="sg-mobile-menu__primary">
                  {primaryItems.map(({ label, href, suffix, featured }) => (
                    <li key={label} data-featured={featured || undefined}>
                      <LocalizedClientLink href={href} onClick={close}>
                        <span>{label}</span>
                        <span aria-hidden="true">{suffix}</span>
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>

                <ul className="sg-mobile-menu__shortcuts">
                  {shopShortcuts.map(({ label, href }) => (
                    <li key={label}>
                      <LocalizedClientLink href={href} onClick={close}>
                        {label}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="sg-mobile-menu__footer">
                <div>
                  <LocalizedClientLink href="/account" onClick={close}>
                    Account
                  </LocalizedClientLink>
                  <span>·</span>
                  <LocalizedClientLink href="/search" onClick={close}>
                    Search
                  </LocalizedClientLink>
                  <span>·</span>
                  <LocalizedClientLink href="/shipping" onClick={close}>
                    Delivery
                  </LocalizedClientLink>
                </div>
                <p>Flowers for life&apos;s beautiful moments.</p>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
