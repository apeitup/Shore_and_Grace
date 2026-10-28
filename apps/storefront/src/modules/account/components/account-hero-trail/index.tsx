"use client"

import { usePathname } from "next/navigation"
import ShopPageHero from "@modules/brand/components/shop-page-hero"

const labels: Record<string, string> = {
  orders: "Orders",
  wishlist: "Wishlist",
  addresses: "Addresses",
  occasions: "Dates & occasions",
  profile: "Account details",
  notifications: "Notifications",
  settings: "Settings",
}

export default function AccountHeroTrail() {
  const path = usePathname()
  const segments = path.split("/").filter(Boolean)
  const accountIndex = segments.indexOf("account")
  const section = segments[accountIndex + 1]
  const detail = section === "orders" ? segments[accountIndex + 3] : undefined
  const label = section ? labels[section] : "Overview"

  const trail: Array<{ label: string; href?: string }> = [{ label: "Account", href: "/account" }]
  if (section) {
    trail.push({ label, href: detail ? `/account/${section}` : undefined })
  } else {
    trail.push({ label: "Overview" })
  }
  if (detail) {
    trail.push({ label: `#${detail}`, href: undefined })
  }

  return <ShopPageHero title="My Account" trail={trail} />
}
