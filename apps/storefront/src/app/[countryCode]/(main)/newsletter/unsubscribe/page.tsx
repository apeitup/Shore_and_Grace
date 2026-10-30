import { Metadata } from "next"

import ShopPageHero from "@modules/brand/components/shop-page-hero"
import NewsletterUnsubscribe from "@modules/layout/components/newsletter-unsubscribe"

export const metadata: Metadata = {
  title: "Unsubscribe from newsletter",
  description: "Update your Shore & Grace newsletter preferences.",
}

type NewsletterUnsubscribePageProps = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function NewsletterUnsubscribePage({
  params,
  searchParams,
}: NewsletterUnsubscribePageProps) {
  const [{ countryCode }, { token }] = await Promise.all([
    params,
    searchParams,
  ])

  return (
    <main className="sg-newsletter-confirmation-page">
      <ShopPageHero
        title="Newsletter"
        trail={[{ label: "Newsletter" }]}
      />
      <div className="content-container">
        {token ? (
          <NewsletterUnsubscribe countryCode={countryCode} token={token} />
        ) : (
          <section className="sg-newsletter-confirmation" role="alert">
            <p className="sg-newsletter-confirmation__eyebrow">
              Unsubscribe link missing
            </p>
            <h1>We need your unsubscribe token</h1>
            <p>
              Open the complete link from your newsletter, or contact us and
              we’ll help update your preferences.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
