import BrandButton from "@modules/brand/components/button"
import ServicesMotion from "@modules/services/components/services-motion"
import Image from "next/image"
import { Fragment } from "react"

const quickLinks = [
  { label: "Funeral Flowers", href: "#funeral-flowers" },
  { label: "Faux Flowers", href: "#faux-flowers" },
  { label: "Fresh Flowers", href: "#fresh-flowers" },
  { label: "Floral Gifts", href: "#floral-gifts" },
  { label: "Bespoke Designs", href: "#bespoke-designs" },
]

function Flourish() {
  return (
    <Image
      className="sg-services-flourish"
      src="/assets/home/sections/section-foliage.svg"
      alt=""
      width={159}
      height={63}
      aria-hidden="true"
    />
  )
}

export default function ServicesTemplate() {
  return (
    <main className="sg-services-page">
      <ServicesMotion />

      <section
        className="sg-services-hero"
        aria-labelledby="services-title"
        data-services-reveal="hero"
      >
        <Image
          className="sg-services-hero__image"
          src="/assets/services/hero-desktop.png"
          alt="Amanda arranging a bouquet in the Shore & Grace studio"
          fill
          priority
          sizes="100vw"
        />
        <div className="sg-services-hero__shade" aria-hidden="true" />
        <div className="sg-services-hero__content">
          <p className="sg-services-eyebrow">Our services</p>
          <h1 id="services-title">
            Thoughtful flowers,
            <br />
            made personal.
          </h1>
        </div>
      </section>

      <nav
        className="sg-services-quick-links"
        aria-label="Explore our services"
        data-services-reveal="content"
      >
        <p>Explore our services</p>
        <div>
          {quickLinks.map((link, index) => (
            <Fragment key={link.href}>
              {index > 0 && (
                <Image
                  className="sg-services-quick-links__divider"
                  src="/assets/services/divider.svg"
                  alt=""
                  width={6}
                  height={62}
                  aria-hidden="true"
                />
              )}
              <a href={link.href}>{link.label}</a>
            </Fragment>
          ))}
        </div>
      </nav>

      <section
        className="sg-services-funeral sg-services-anchor"
        id="funeral-flowers"
        aria-labelledby="funeral-flowers-title"
      >
        <div
          className="sg-services-centered-copy"
          data-services-reveal="content"
        >
          <Flourish />
          <p className="sg-services-eyebrow">Remembrance &amp; sympathy</p>
          <h2 id="funeral-flowers-title">
            Funeral Flowers &amp; Sympathy Tributes
          </h2>
          <div className="sg-services-body-copy">
            <p>
              Choosing flowers to remember someone is deeply personal. We offer
              gentle, personal guidance and create thoughtful tributes shaped
              around the person, the memories and the occasion.
            </p>
            <p>
              From traditional arrangements to something individual, each
              tribute is approached with sensitivity, care and respect.
            </p>
          </div>
        </div>

        <div className="sg-services-funeral__gallery">
          <div
            className="sg-services-funeral__supporting"
            data-services-reveal="image"
            data-services-delay="1"
          >
            <Image
              src="/assets/services/funeral-spray-desktop.png"
              alt="Ivory funeral spray with white flowers and greenery"
              fill
              sizes="(max-width: 767px) calc((100vw - 60px) / 2), 387px"
            />
          </div>
          <div
            className="sg-services-funeral__feature"
            data-services-reveal="image"
          >
            <span aria-hidden="true" />
            <Image
              src="/assets/services/funeral-vase-desktop.png"
              alt="White sympathy flowers arranged in a glass vase"
              fill
              sizes="(max-width: 767px) calc(100vw - 48px), 387px"
            />
          </div>
          <div
            className="sg-services-funeral__supporting"
            data-services-reveal="image"
            data-services-delay="2"
          >
            <Image
              src="/assets/services/funeral-sheaf-desktop.png"
              alt="Red rose sympathy sheaf with greenery"
              fill
              sizes="(max-width: 767px) calc((100vw - 60px) / 2), 387px"
            />
          </div>
        </div>

        <div data-services-reveal="content" data-services-delay="1">
          <BrandButton href="/contact" variant="secondary">
            Enquire about a tribute
          </BrandButton>
        </div>
      </section>

      <section
        className="sg-services-split sg-services-split--image-first sg-services-anchor"
        id="faux-flowers"
        aria-labelledby="faux-flowers-title"
      >
        <div
          className="sg-services-split__image"
          data-services-reveal="image"
        >
          <Image
            src="/assets/services/faux-desktop.png"
            alt="Amanda arranging an everlasting floral gift"
            fill
            sizes="(max-width: 767px) calc(100vw - 48px), 50vw"
          />
        </div>
        <div
          className="sg-services-split__copy"
          data-services-reveal="content"
          data-services-delay="1"
        >
          <p className="sg-services-eyebrow">Beauty that lasts</p>
          <h2 id="faux-flowers-title">Faux &amp; Everlasting Flowers</h2>
          <p>
            Beautiful florals made to be enjoyed for longer. Our faux collection
            includes arrangements for the home, boxed flowers, floral gift bags
            and seasonal wreaths.
          </p>
          <p>
            Each design brings together colour, texture and carefully selected
            details for a lasting and thoughtful gift.
          </p>
          <BrandButton href="/store" variant="secondary">
            Browse everlasting flowers
          </BrandButton>
        </div>
      </section>

      <section
        className="sg-services-fresh sg-services-anchor"
        id="fresh-flowers"
        aria-labelledby="fresh-flowers-title"
        data-services-reveal="content"
      >
        <Flourish />
        <p className="sg-services-eyebrow">Naturally beautiful</p>
        <h2 id="fresh-flowers-title">Fresh Flowers &amp; Bouquets</h2>
        <div
          className="sg-services-fresh__image"
          data-services-reveal="image"
        >
          <Image
            src="/assets/services/fresh-desktop.png"
            alt="Amanda tying a fresh bouquet by hand"
            fill
            sizes="(max-width: 767px) calc(100vw - 48px), 800px"
          />
        </div>
        <div className="sg-services-body-copy">
          <p>
            From seasonal bouquets to flowers for a special occasion, our fresh
            designs celebrate natural beauty, complementary textures and the
            pleasure of giving.
          </p>
          <p>
            For birthdays, anniversaries, thank-yous or simply because, we can
            help you find something that feels just right.
          </p>
        </div>
        <BrandButton href="/store" variant="secondary">
          Browse fresh flowers
        </BrandButton>
      </section>

      <section
        className="sg-services-split sg-services-split--copy-first sg-services-anchor"
        id="floral-gifts"
        aria-labelledby="floral-gifts-title"
      >
        <div
          className="sg-services-split__copy"
          data-services-reveal="content"
        >
          <p className="sg-services-eyebrow">The art of giving</p>
          <h2 id="floral-gifts-title">Floral Gifts &amp; Special Occasions</h2>
          <p>
            Sometimes a small gesture leaves the biggest impression. Discover
            thoughtfully chosen floral gifts and distinctive arrangements for
            the people and occasions that matter.
          </p>
          <p>
            From birthdays and new homes to a simple thank-you, each piece is
            finished with care.
          </p>
          <BrandButton href="/store" variant="secondary">
            Shop floral gifts
          </BrandButton>
        </div>
        <div
          className="sg-services-split__image"
          data-services-reveal="image"
          data-services-delay="1"
        >
          <Image
            src="/assets/services/gifts-desktop.png"
            alt="Envelope-style handmade floral gift"
            fill
            sizes="(max-width: 767px) calc(100vw - 48px), 50vw"
          />
        </div>
      </section>

      <section
        className="sg-services-bespoke sg-services-anchor"
        id="bespoke-designs"
        aria-labelledby="bespoke-designs-title"
      >
        <div className="sg-services-bespoke__inner">
          <div
            className="sg-services-bespoke__image"
            data-services-reveal="image"
          >
            <Image
              src="/assets/services/bespoke-desktop.png"
              alt="A personal floristry consultation in the Shore & Grace studio"
              fill
              sizes="(max-width: 767px) calc(100vw - 48px), 582px"
            />
          </div>
          <div
            className="sg-services-bespoke__copy"
            data-services-reveal="content"
            data-services-delay="1"
          >
            <p className="sg-services-eyebrow">Created with you in mind</p>
            <h2 id="bespoke-designs-title">Bespoke Floral Designs</h2>
            <p>
              Have a colour palette, particular style or idea in mind? We would
              love to hear about it and explore how to create something personal
              to you.
            </p>
            <p>
              Whether for a home, a celebration or a meaningful gift, we
              consider the details together.
            </p>
            <BrandButton href="/contact" variant="secondary">
              Discuss a bespoke design
            </BrandButton>
          </div>
        </div>
      </section>

      <section
        className="sg-services-cta"
        aria-labelledby="services-cta-title"
        data-services-reveal="content"
      >
        <p className="sg-services-eyebrow">Here when you need us</p>
        <h2 id="services-cta-title">Have something special in mind?</h2>
        <p>
          Explore our flowers and gifts, or speak to Amanda about creating
          something personal.
        </p>
        <div>
          <BrandButton href="/store" variant="tertiary">
            Shop flowers and gifts
          </BrandButton>
          <BrandButton href="/contact" variant="tertiary">
            Talk to Amanda
          </BrandButton>
        </div>
      </section>

      <section
        className="sg-services-closing"
        aria-label="Shore & Grace sentiment"
        data-services-reveal="content"
      >
        <Image
          src="/assets/services/closing-desktop.png"
          alt="Green pom-pom flower"
          width={94}
          height={94}
        />
        <p>
          Thoughtfully gathered.
          <br />
          Beautifully remembered.
        </p>
      </section>
    </main>
  )
}
