import type { Metadata } from "next"
import { Suspense } from "react"

import ShopPageHero from "@modules/brand/components/shop-page-hero"
import ResetPassword from "@modules/account/components/reset-password"

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Reset your Shore & Grace account password.",
}

export default function ResetPasswordPage() {
  return (
    <main className="sg-account-auth">
      <ShopPageHero
        title="My Account"
        trail={[
          { label: "Account", href: "/account" },
          { label: "Reset password" },
        ]}
      />
      <div className="sg-account-auth__content">
        <Suspense fallback={<p>Loading password reset...</p>}>
          <ResetPassword />
        </Suspense>
      </div>
    </main>
  )
}
