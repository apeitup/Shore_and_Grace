import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"
import { resolveMediaUrl } from "@lib/util/resolve-media-url"
import type { HttpTypes } from "@medusajs/types"
import Image from "next/image"

import styles from "./home-sections.module.css"

const assetRoot = "/assets/home/sections"

type ResponsiveImageProps = {
  alt: string
  desktop: string
  mobile: string
  className?: string
}

export type HomeOccasionCard = {
  title: string
  slug: string
  imageUrl: string
  fallbackImage?: string
  altText: string
  sectionTitle?: string
  enabled?: boolean
  position?: number
}

const defaultOccasions = [
  { title: "Christmas", slug: "christmas", image: "occasion-christmas" },
  { title: "Birthday", slug: "birthday", image: "occasion-birthday" },
  { title: "Autumn", slug: "autumn", image: "occasion-autumn" },
  {
    title: "Anniversary",
    slug: "anniversary",
    image: "occasion-anniversary",
  },
]

const helpCards = [
  {
    eyebrow: "Remembrance & sympathy",
    title: "Funeral & sympathy",
    body: "Sensitive, personal tributes created with care.",
    cta: "Enquire about a tribute",
    href: "/services#funeral-flowers",
    image: "help-funeral",
  },
  {
    eyebrow: "Fresh & seasonal",
    title: "Fresh flowers",
    body: "Season-led bouquets designed to feel generous and natural.",
    cta: "Browse fresh flowers",
    href: "/store",
    image: "help-fresh",
  },
  {
    eyebrow: "Gifts & bespoke",
    title: "Gifts with meaning",
    body: "Floral gifts and bespoke pieces for the people who matter.",
    cta: "Shop floral gifts",
    href: "/store",
    image: "help-gifts",
  },
]

const followImages = [1, 2, 3, 4, 5]

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
    <div className={styles.sectionHeading} data-sg-reveal="content">
      <Image
        src={`${assetRoot}/section-foliage.svg`}
        width={159}
        height={63}
        alt=""
        aria-hidden="true"
      />
      <h2 id={id}>{children}</h2>
    </div>
  )
}

function GiftCardArtwork() {
  return (
    <div className={styles.giftCardArt} aria-label="Shore & Grace gift card">
      <div className={styles.giftCardDesktopLockup} aria-hidden="true">
        <Image
          src={`${assetRoot}/gift-card-mark-desktop.svg`}
          width={144}
          height={129}
          alt=""
        />
        <p>Shore &amp; Grace</p>
        <span>Floral &amp; Gift Studio</span>
      </div>
      <div className={styles.giftCardSignature}>
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

export default function HomeSections({
  occasions,
  gifts,
  occasionSectionTitle,
  giftSectionTitle,
}: {
  occasions?: HomeOccasionCard[]
  gifts?: HttpTypes.StoreProduct[]
  occasionSectionTitle?: string
  giftSectionTitle?: string
}) {
  const displayedOccasions = occasions?.length ? occasions : defaultOccasions

  return (
    <div className={styles.sections}>
      <section className={styles.help} aria-labelledby="home-help-heading">
        <div className={styles.helpIntro} data-sg-reveal="content">
          <Image
            src={`${assetRoot}/section-foliage.svg`}
            width={159}
            height={63}
            alt=""
            aria-hidden="true"
          />
          <p className={styles.eyebrow}>Floristry for life&apos;s moments</p>
          <h2 id="home-help-heading">How can we help?</h2>
          <div className={styles.helpLead}>
            <p>
              From meaningful tributes to fresh flowers and one-of-a-kind gifts.
            </p>
            <p>
              From traditional arrangements to something individual, each
              tribute is approached with sensitivity, care and respect.
            </p>
          </div>
        </div>
        <div className={styles.helpGrid} data-sg-reveal="content">
          {helpCards.map((card) => (
            <article className={styles.helpCard} key={card.title}>
              <div className={styles.helpCardFrame}>
                <ResponsiveImage
                  className={styles.helpImage}
                  desktop={`${assetRoot}/${card.image}-desktop.png`}
                  mobile={`${assetRoot}/${card.image}-mobile.png`}
                  alt={`${card.title} by Shore & Grace`}
                />
                <div className={styles.helpCopy}>
                  <p className={styles.cardEyebrow}>{card.eyebrow}</p>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <LocalizedClientLink href={card.href}>
                    {card.cta}
                    <Image
                      className={styles.helpCtaArrow}
                      src={`${assetRoot}/help-card-arrow.svg`}
                      width={18}
                      height={18}
                      alt=""
                      aria-hidden="true"
                    />
                  </LocalizedClientLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className={styles.occasions}
        aria-labelledby="home-occasions-heading"
      >
        <SectionHeading id="home-occasions-heading">
          {occasionSectionTitle || "Shop by Popular Occasions"}
        </SectionHeading>
        <div className={styles.occasionGrid} data-sg-reveal="content">
          {displayedOccasions.map((occasion) => (
            <LocalizedClientLink
              href={`/categories/${occasion.slug}`}
              className={styles.occasionCard}
              key={occasion.slug}
            >
              {"imageUrl" in occasion && occasion.imageUrl ? (
                <span className={styles.occasionImage}>
                  <Image
                    src={occasion.imageUrl}
                    alt={occasion.altText}
                    fill
                    sizes="(max-width: 767px) 58vw, 25vw"
                  />
                </span>
              ) : "fallbackImage" in occasion && occasion.fallbackImage ? (
                <ResponsiveImage
                  className={styles.occasionImage}
                  desktop={`${assetRoot}/${occasion.fallbackImage}-desktop.png`}
                  mobile={`${assetRoot}/${occasion.fallbackImage}-mobile.png`}
                  alt={occasion.altText}
                />
              ) : "image" in occasion ? (
                <ResponsiveImage
                  className={styles.occasionImage}
                  desktop={`${assetRoot}/${occasion.image}-desktop.png`}
                  mobile={`${assetRoot}/${occasion.image}-mobile.png`}
                  alt={`${occasion.title} flowers`}
                />
              ) : (
                <span
                  className={`${styles.occasionImage} ${styles.missingOccasionImage}`}
                  role="img"
                  aria-label={occasion.altText}
                />
              )}
              <h3>{occasion.title}</h3>
            </LocalizedClientLink>
          ))}
        </div>
      </section>

      <section
        className={styles.personal}
        aria-labelledby="home-personal-heading"
      >
        <div className={styles.personalImage} data-sg-reveal="image">
          <Image
            src={`${assetRoot}/personal-enquiry-desktop.png`}
            alt="Florist preparing an individual floral arrangement"
            fill
            sizes="50vw"
          />
        </div>
        <div className={styles.personalPanel}>
          <div className={styles.personalCopy} data-sg-reveal="content">
            <p className={styles.personalEyebrow}>Personal enquiries</p>
            <h2 id="home-personal-heading">A design made just for you.</h2>
            <p>
              Share the feeling, setting or person you have in mind. Amanda will
              shape the floral direction around your story.
            </p>
            <LocalizedClientLink
              href="/contact"
              className={styles.personalButton}
            >
              Start a conversation
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <section className={styles.gifts} aria-labelledby="home-gifts-heading">
        <SectionHeading id="home-gifts-heading">
          {giftSectionTitle || "Gifts"}
        </SectionHeading>
        <div className={styles.giftGrid} data-sg-reveal="content">
          {gifts?.length ? (
            gifts.map((product) => {
              const price = getProductPrice({ product }).cheapestPrice
              return (
                <LocalizedClientLink
                  href={`/products/${product.handle}`}
                  className={styles.giftProduct}
                  key={product.id}
                >
                  <span
                    className={`${styles.giftImage} ${styles.dynamicGiftImage}`}
                  >
                    {product.thumbnail ? (
                      <Image
                        src={resolveMediaUrl(product.thumbnail)}
                        alt={product.title}
                        fill
                        sizes="(max-width: 767px) 70vw, 33vw"
                      />
                    ) : null}
                  </span>
                  <h3>{product.title}</h3>
                  <p>{price?.calculated_price ?? "Price unavailable"}</p>
                </LocalizedClientLink>
              )
            })
          ) : (
            <>
              <LocalizedClientLink href="/store" className={styles.giftProduct}>
                <ResponsiveImage
                  className={styles.giftImage}
                  desktop={`${assetRoot}/gift-stratos-desktop.png`}
                  mobile={`${assetRoot}/gift-stratos-mobile.png`}
                  alt="Stratos vase"
                />
                <h3>Stratos Vase</h3>
                <p>£35.00</p>
              </LocalizedClientLink>
              <LocalizedClientLink href="/store" className={styles.giftProduct}>
                <GiftCardArtwork />
                <h3 className={styles.giftDesktopTitle}>E-Gift Cards</h3>
                <h3 className={styles.giftMobileTitle}>Gift Card</h3>
                <p className={styles.giftDesktopTitle}>£50.00 – £150.00</p>
                <p className={styles.giftMobileTitle}>£50.00</p>
              </LocalizedClientLink>
              <LocalizedClientLink href="/store" className={styles.giftProduct}>
                <ResponsiveImage
                  className={styles.giftImage}
                  desktop={`${assetRoot}/gift-venus-desktop.png`}
                  mobile={`${assetRoot}/gift-venus-mobile.png`}
                  alt="The Venus gift set"
                />
                <h3>The Venus Set</h3>
                <p>£295.00</p>
              </LocalizedClientLink>
            </>
          )}
        </div>
        <div className={styles.giftDots} aria-hidden="true">
          <span className={styles.activeDot} />
          <span />
          <span />
        </div>
        <LocalizedClientLink href="/store" className={styles.giftButton}>
          View all gifts
        </LocalizedClientLink>
      </section>

      <section className={styles.follow} aria-labelledby="home-follow-heading">
        <SectionHeading id="home-follow-heading">Follow us</SectionHeading>
        <div className={styles.followGrid} data-sg-reveal="content">
          {followImages.map((image) => (
            <a
              href="https://www.instagram.com/shore_and_grace/"
              className={styles.followItem}
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Shore & Grace on Instagram"
              key={image}
            >
              <ResponsiveImage
                desktop={`${assetRoot}/follow-${image}-desktop.png`}
                mobile={`${assetRoot}/follow-${image}-mobile.png`}
                alt=""
              />
            </a>
          ))}
        </div>
      </section>

      <section
        className={styles.closing}
        aria-labelledby="home-closing-heading"
        data-sg-reveal="content"
      >
        <Image
          src="/assets/about/floral-detail-desktop.png"
          width={94}
          height={94}
          alt=""
          aria-hidden="true"
        />
        <h2 id="home-closing-heading">
          What would you like the flowers to say?
        </h2>
        <p>
          Browse the collection, explore our services, or begin with a
          conversation.
        </p>
        <div className={styles.closingActions}>
          <LocalizedClientLink href="/store">
            Shop for flowers
          </LocalizedClientLink>
          <LocalizedClientLink href="/contact">
            Contact the studio
          </LocalizedClientLink>
        </div>
      </section>
    </div>
  )
}
