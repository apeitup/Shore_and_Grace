import { Metadata } from "next"

import ShopPageHero from "@modules/brand/components/shop-page-hero"
import NewsletterConfirmation from "@modules/layout/components/newsletter-confirmation"

export const metadata: Metadata = {
  title: "Confirm newsletter subscription",
  description: "Confirm your Shore & Grace newsletter subscription.",
}

type NewsletterConfirmPageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function NewsletterConfirmPage({
  searchParams,
}: NewsletterConfirmPageProps) {
  const { token } = await searchParams

  return (
    <main className="sg-newsletter-confirmation-page">
      <ShopPageHero
        title="Newsletter"
        trail={[{ label: "Newsletter" }]}
      />
      <div className="content-container">
        {token ? (
          <NewsletterConfirmation token={token} />
        ) : (
          <section className="sg-newsletter-confirmation" role="alert">
            <p className="sg-newsletter-confirmation__eyebrow">
              Confirmation link missing
            </p>
            <h1>We need your confirmation token</h1>
            <p>
              Open the complete link from your confirmation email, or subscribe
              again to receive a new one.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
