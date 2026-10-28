import ShopBannerBackground from "@modules/brand/components/shop-banner-background"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type ShopPageHeroProps = {
  title: string
  mobileTitle?: string
  trail?: Array<{
    label: string
    href?: string
  }>
}

const ShopPageHero = ({ title, mobileTitle, trail = [] }: ShopPageHeroProps) => (
  <section className="sg-shop-hero" aria-labelledby="sg-shop-hero-title">
    <ShopBannerBackground />
    <div className="sg-shop-hero__inner">
      <h1 id="sg-shop-hero-title">
        <span className="sg-shop-hero__title-desktop">{title}</span>
        <span className="sg-shop-hero__title-mobile">{mobileTitle ?? title}</span>
      </h1>
      <nav aria-label="Breadcrumb" className="sg-shop-hero__breadcrumbs">
        <LocalizedClientLink href="/">Home</LocalizedClientLink>
        {trail.map((item) => (
          <span key={`${item.label}-${item.href ?? "current"}`}>
            <span aria-hidden="true">›</span>
            {item.href ? (
              <LocalizedClientLink href={item.href}>
                {item.label}
              </LocalizedClientLink>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </div>
    <div className="sg-shop-hero__curve" aria-hidden="true">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet="/assets/brand/footer-curve-mobile.svg"
        />
        <Image
          src="/assets/brand/footer-curve.svg"
          alt=""
          width={3074}
          height={56}
        />
      </picture>
    </div>
  </section>
)

export default ShopPageHero
