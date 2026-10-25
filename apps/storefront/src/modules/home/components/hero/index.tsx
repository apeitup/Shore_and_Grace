import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="sg-hero">
      <div className="sg-hero__art" aria-hidden="true">
        <div className="sg-hero__sun" />
        <div className="sg-hero__stem sg-hero__stem--one">
          <i />
          <i />
        </div>
        <div className="sg-hero__stem sg-hero__stem--two">
          <i />
          <i />
        </div>
        <div className="sg-hero__bloom">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="content-container sg-hero__inner">
        <div className="sg-hero__copy">
          <p className="sg-kicker">Floral & gift studio · Essex coast</p>
          <h1>Flowers for life&apos;s quietest and brightest moments.</h1>
          <p className="sg-hero__intro">
            Fresh flowers, lasting botanicals and thoughtful gifts—arranged with
            care and made to mean something.
          </p>
          <div className="sg-hero__actions">
            <LocalizedClientLink
              href="/store"
              className="sg-button sg-button--primary"
            >
              Shop the collection
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/contact"
              className="sg-button sg-button--quiet"
            >
              Bespoke enquiries
            </LocalizedClientLink>
          </div>
        </div>
      </div>
      <p className="sg-hero__note">Created slowly · Given wholeheartedly</p>
    </section>
  )
}

export default Hero
