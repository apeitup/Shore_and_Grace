import { listFaqs } from "@lib/data/faqs"
import { STORE_NAME } from "@lib/util/site"
import ShopPageHero from "@modules/brand/components/shop-page-hero"
import FaqBrowser from "@modules/faq/components/faq-browser"
import type { Metadata } from "next"
import Image from "next/image"

export const revalidate = 60

export const metadata: Metadata = {
  title: "FAQ",
  description: `Helpful answers about ordering, delivery, flower care and services from ${STORE_NAME}.`,
}

export default async function FaqPage() {
  const { faq_categories: categories } = await listFaqs().catch(() => ({
    faq_categories: [],
  }))

  return (
    <main className="sg-faq-page">
      <ShopPageHero
        title="FAQ"
        mobileTitle="FAQ"
        trail={[{ label: "FAQ" }]}
      />
      <div className="content-container sg-faq-page__content">
        <header className="sg-faq-page__intro">
          <Image
            className="sg-faq-page__botanical"
            src="/assets/brand/contact-botanical.svg"
            alt=""
            width={59}
            height={158}
          />
          <p className="sg-faq-page__eyebrow">HELP &amp; GUIDANCE</p>
          <h1>How can we help?</h1>
          <p>
            Find quick answers about ordering, delivery, flower care and our
            studio services.
          </p>
        </header>
        <FaqBrowser categories={categories} />
      </div>
    </main>
  )
}
