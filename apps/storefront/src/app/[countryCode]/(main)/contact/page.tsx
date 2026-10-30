import { Metadata } from "next"
import Image from "next/image"

import { STORE_NAME } from "@lib/util/site"
import ShopPageHero from "@modules/brand/components/shop-page-hero"
import ContactForm from "@modules/contact/components/contact-form"
import { Mail, MapPin, Phone } from "iconoir-react"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Contact",
  description: `How to contact ${STORE_NAME}.`,
}

export default function ContactPage() {
  return (
    <main className="sg-contact-page">
      <ShopPageHero title="Contact us" trail={[{ label: "Contact us" }]} />

      <div className="content-container sg-contact-page__content">
        <header className="sg-contact-page__intro">
          <span className="sg-contact-page__botanical" aria-hidden="true">
            <Image
              className="sg-contact-page__botanical-graphic"
              src="/assets/brand/contact-botanical.svg"
              alt=""
              width={59}
              height={158}
              priority
            />
          </span>
          <p className="sg-contact-page__eyebrow">CONTACT SHORE &amp; GRACE</p>
          <h1>We’d love to hear from you</h1>
          <p>
            Planning a meaningful gift, arranging flowers for an event, or have
            a question about an order? Our team is here to help.
          </p>
        </header>

        <section
          className="sg-contact-page__details"
          aria-label="Contact details"
        >
          <article className="sg-contact-card">
            <span className="sg-contact-card__icon" aria-hidden="true">
              <MapPin />
            </span>
            <h2>Consultations</h2>
            <p>Floral consultations are available by appointment.</p>
          </article>
          <article className="sg-contact-card">
            <span className="sg-contact-card__icon" aria-hidden="true">
              <Phone />
            </span>
            <h2>Call us</h2>
            <a href="tel:+447754870498">
              <span>Monday–Saturday</span>
              <span>9am–5pm · 07754 870498</span>
            </a>
          </article>
          <article className="sg-contact-card">
            <span className="sg-contact-card__icon" aria-hidden="true">
              <Mail />
            </span>
            <h2>Email us</h2>
            <a href="mailto:contact@shoreandgrace.com">
              contact@shoreandgrace.com
            </a>
          </article>
        </section>

        <section className="sg-contact-page__message">
          <div className="sg-contact-page__message-copy">
            <h2>Send us a message</h2>
            <p>
              Complete the form and we’ll reply within two working days. Include
              your order number in the subject if you need order support.
            </p>
          </div>
          <ContactForm />
        </section>
      </div>
    </main>
  )
}
