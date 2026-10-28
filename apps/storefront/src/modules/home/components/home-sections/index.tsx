import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { serviceLinks as services } from "@lib/service-links"

const assetRoot = "/assets/home/sections"

type ResponsiveImageProps = {
  alt: string
  desktop: string
  mobile: string
  className?: string
}

const occasions = [
  { title: "Christmas", slug: "christmas", image: "occasion-christmas" },
  { title: "Birthday", slug: "birthday", image: "occasion-birthday" },
  { title: "Autumn", slug: "autumn", image: "occasion-autumn" },
  {
    title: "Anniversary",
    slug: "anniversary",
    image: "occasion-anniversary",
  },
]

const followImages = [
  { desktop: "follow-1-desktop.png", mobile: "follow-1-mobile.png" },
  { desktop: "follow-2-desktop.png", mobile: "follow-2-mobile.png" },
  { desktop: "follow-3-desktop.png", mobile: "follow-3-mobile.png" },
  { desktop: "follow-4-desktop.png", mobile: "follow-4-mobile.png" },
  { desktop: "follow-5-desktop.png", mobile: "follow-5-mobile.png" },
  {
    desktop: "service-weddings-desktop.png",
    mobile: "service-weddings-mobile.png",
    desktopOnly: true,
  },
  {
    desktop: "service-workshops-desktop.png",
    mobile: "service-workshops-mobile.png",
    desktopOnly: true,
  },
  {
    desktop: "service-subscription-desktop.png",
    mobile: "service-subscription-mobile.png",
    desktopOnly: true,
  },
]

function ResponsiveImage({
  alt,
  desktop,
  mobile,
  className,
}: ResponsiveImageProps) {
  return (
    <picture className={className}>
      <source media="(max-width: 767px)" srcSet={mobile} />
      <img src={desktop} alt={alt} loading="lazy" />
    </picture>
  )
}

function SectionHeading({ children, id }: { children: string; id: string }) {
  return (
    <div className="sg-home-heading">
      <span className="sg-home-heading__ornament" aria-hidden="true">
        <Image
          src={`${assetRoot}/section-foliage.svg`}
          width={159}
          height={63}
          alt=""
        />
      </span>
      <h2 id={id}>{children}</h2>
    </div>
  )
}

function GiftCardArtwork() {
  return (
    <div className="sg-gift-card-art" aria-label="Shore & Grace e-gift card">
      <div className="sg-gift-card-art__signature">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet={`${assetRoot}/gift-card-botanical-mobile.svg`}
          />
          <img src={`${assetRoot}/gift-card-botanical-desktop.svg`} alt="" />
        </picture>
        <p>Shore &amp; Grace</p>
        <span>Floral &amp; Gift Studio</span>
      </div>
      <strong>Gift Cards</strong>
    </div>
  )
}

export default function HomeSections() {
  return (
    <div className="sg-home-sections">
      <section
        className="sg-home-section sg-home-services"
        aria-labelledby="home-services-heading"
      >
        <SectionHeading id="home-services-heading">Our Services</SectionHeading>
        <div className="sg-home-services__track">
          {services.map((service) => (
            <LocalizedClientLink
              href={`/services/${service.slug}`}
              className="sg-home-service-card"
              key={service.slug}
            >
              <ResponsiveImage
                className="sg-home-service-card__image"
                desktop={`${assetRoot}/${service.image}-desktop.png`}
                mobile={`${assetRoot}/${service.image}-mobile.png`}
                alt={`${service.title} by Shore & Grace`}
              />
              <h3>{service.title}</h3>
            </LocalizedClientLink>
          ))}
        </div>
      </section>

      <section
        className="sg-home-section sg-home-occasions"
        aria-labelledby="home-occasions-heading"
      >
        <SectionHeading id="home-occasions-heading">
          Shop by Popular Occasions
        </SectionHeading>
        <div className="sg-home-occasions__grid">
          {occasions.map((occasion) => (
            <LocalizedClientLink
              href={`/categories/${occasion.slug}`}
              className="sg-home-occasion-card"
              key={occasion.slug}
            >
              <ResponsiveImage
                className="sg-home-occasion-card__image"
                desktop={`${assetRoot}/${occasion.image}-desktop.png`}
                mobile={`${assetRoot}/${occasion.image}-mobile.png`}
                alt={`${occasion.title} flowers`}
              />
              <h3>{occasion.title}</h3>
            </LocalizedClientLink>
          ))}
        </div>
      </section>

      <section
        className="sg-home-section sg-home-gifts"
        aria-labelledby="home-gifts-heading"
      >
        <SectionHeading id="home-gifts-heading">Gifts</SectionHeading>
        <div className="sg-home-gifts__grid">
          <LocalizedClientLink href="/store" className="sg-home-gift-card">
            <ResponsiveImage
              className="sg-home-gift-card__image"
              desktop={`${assetRoot}/gift-stratos-desktop.png`}
              mobile={`${assetRoot}/gift-stratos-mobile.png`}
              alt="Stratos vase"
            />
            <h3>Stratos Vase</h3>
            <p>£35.00</p>
          </LocalizedClientLink>
          <LocalizedClientLink href="/store" className="sg-home-gift-card">
            <GiftCardArtwork />
            <h3>E-Gift Cards</h3>
            <p>£50.00 – £150.00</p>
          </LocalizedClientLink>
          <LocalizedClientLink href="/store" className="sg-home-gift-card">
            <ResponsiveImage
              className="sg-home-gift-card__image"
              desktop={`${assetRoot}/gift-venus-desktop.png`}
              mobile={`${assetRoot}/gift-venus-mobile.png`}
              alt="The Venus gift set"
            />
            <h3>The Venus Set</h3>
            <p>£295.00</p>
          </LocalizedClientLink>
        </div>
        <LocalizedClientLink
          href="/store"
          className="sg-brand-button sg-brand-button--outline sg-home-gifts__button"
        >
          View all gifts
        </LocalizedClientLink>
      </section>

      <section
        className="sg-home-section sg-home-follow"
        aria-labelledby="home-follow-heading"
      >
        <SectionHeading id="home-follow-heading">Follow us</SectionHeading>
        <div className="sg-home-follow__grid">
          {followImages.map(({ desktop, mobile, desktopOnly }, index) => (
            <a
              href="https://www.instagram.com/shore_and_grace/"
              className={`sg-home-follow__item${
                desktopOnly ? " sg-home-follow__item--desktop-only" : ""
              }`}
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Shore & Grace on Instagram"
              key={`${desktop}-${index}`}
            >
              <ResponsiveImage
                desktop={`${assetRoot}/${desktop}`}
                mobile={`${assetRoot}/${mobile}`}
                alt=""
              />
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
