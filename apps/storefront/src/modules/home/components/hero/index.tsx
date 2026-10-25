import BrandButton from "@modules/brand/components/button"

const Hero = () => {
  return (
    <section className="sg-hero">
      <div className="content-container sg-hero__inner">
        <div className="sg-hero__copy">
          <h1>Flowers for life&apos;s most meaningful moments</h1>
          <span className="sg-hero__divider" aria-hidden="true" />
          <p className="sg-hero__intro">
            Thoughtfully gathered.
            <br />
            Beautifully remembered
          </p>
          <BrandButton href="/store">Shop now</BrandButton>
        </div>
      </div>
    </section>
  )
}

export default Hero
