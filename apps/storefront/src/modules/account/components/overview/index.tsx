import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders: _orders }: OverviewProps) => {
  const links = [
    ["Orders", "Manage your recent orders.", "/account/orders"],
    ["Wishlist", "View and manage your saved flowers.", "/account/wishlist"],
    ["Addresses", "Manage your account addresses.", "/account/addresses"],
    ["Dates & occasions", "Manage your meaningful dates.", "/account/occasions"],
    ["Account details", "Manage your personal information.", "/account/profile"],
    ["Notifications", "Choose which updates you receive and how.", "/account/notifications"],
    ["Settings", "Manage your preferences, privacy and account.", "/account/settings"],
  ]

  return (
    <div className="sg-account-overview" data-testid="overview-page-wrapper">
      <h1>Welcome back, {customer?.first_name || "there"}</h1>
      <p>Where would you like to start?</p>
      <ul>
        {links.map(([label, description, href]) => (
          <li key={href}>
            <LocalizedClientLink href={href}>
              <strong>{label}</strong>
              <span>{description}</span>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Overview
