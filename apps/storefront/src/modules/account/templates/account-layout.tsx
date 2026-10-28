import React from "react"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"
import AccountHeroTrail from "../components/account-hero-trail"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  if (!customer) {
    return <>{children}</>
  }

  return (
    <main className="sg-account-page" data-testid="account-page">
      <AccountHeroTrail />
      <section className="content-container sg-account-content">
        <header className="sg-account-welcome">
          <h2>Welcome back, {customer.first_name || "there"}</h2>
          <p>Manage your orders, saved flowers and account details.</p>
        </header>
        <div className="sg-account-layout">
          <AccountNav />
          <div className="sg-account-main">{children}</div>
        </div>
      </section>
    </main>
  )
}

export default AccountLayout
