"use client"

import React, { useTransition } from "react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const [isNavigating, startNavigation] = useTransition()

  if (!customer) {
    return <>{children}</>
  }

  const navigate = (href: string) => {
    startNavigation(() => router.push(href))
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
          <AccountNav onNavigate={navigate} />
          <div className="sg-account-main" aria-busy={isNavigating}>
            <div
              className={`sg-account-main__content${
                isNavigating ? " is-navigating" : ""
              }`}
            >
              {children}
            </div>
            {isNavigating && (
              <div
                className="sg-account-navigation-status"
                role="status"
                aria-live="polite"
              >
                <span className="sg-account-navigation-status__spinner" />
                <span>Loading…</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default AccountLayout
