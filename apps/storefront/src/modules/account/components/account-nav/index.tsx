"use client"

import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const accountLinks = [
  { href: "/account/orders", label: "Orders", testId: "orders-link" },
  { href: "/account/wishlist", label: "Wishlist", testId: "wishlist-link" },
  { href: "/account/addresses", label: "Addresses", testId: "addresses-link" },
  { href: "/account/occasions", label: "Dates & occasions", testId: "occasions-link" },
  { href: "/account/profile", label: "Account details", testId: "profile-link" },
  { href: "/account/notifications", label: "Notifications", testId: "notifications-link" },
  { href: "/account/settings", label: "Settings", testId: "settings-link" },
]

const AccountNav = () => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  return (
    <nav
      className={clx("sg-account-nav", {
        "sg-account-nav--overview": route === `/${countryCode}/account`,
      })}
      aria-label="Account"
      data-testid="account-nav"
    >
      <ul>
        {accountLinks.map((link) => (
          <li key={link.href}>
            <AccountNavLink href={link.href} route={route!} data-testid={link.testId}>
              {link.label}
            </AccountNavLink>
          </li>
        ))}
      </ul>
      <button type="button" onClick={handleLogout} data-testid="logout-button">
        Log out
      </button>
    </nav>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const localRoute = route.split(countryCode)[1]
  const active = localRoute === href || localRoute.startsWith(`${href}/`)
  return (
    <LocalizedClientLink
      href={href}
      className={clx({ "is-active": active })}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
