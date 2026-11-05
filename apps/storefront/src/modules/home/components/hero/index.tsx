import BrandButton from "@modules/brand/components/button"

import styles from "./hero.module.css"

const Hero = () => {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <picture className={styles.media} data-sg-reveal="hero-media">
        <source
          media="(max-width: 767px)"
          srcSet="/assets/home/hero-mobile.png"
        />
        <img src="/assets/home/hero-desktop.png" alt="" fetchPriority="high" />
      </picture>
      <div className={styles.wash} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy} data-sg-reveal="hero-copy">
          <h1 id="home-hero-title">
            Flowers for life&apos;s most meaningful moments
          </h1>
          <span className={styles.divider} aria-hidden="true" />
          <p>
            Thoughtfully gathered.
            <br />
            Beautifully remembered
          </p>
          <BrandButton href="/store" className={styles.button}>
            Shop now
          </BrandButton>
        </div>
      </div>
    </section>
  )
}

export default Hero
