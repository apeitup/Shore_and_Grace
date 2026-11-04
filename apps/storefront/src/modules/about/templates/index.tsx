import BrandButton from "@modules/brand/components/button"
import Image from "next/image"

import styles from "./about.module.css"

const values = [
  {
    number: "01",
    title: "Personally chosen",
    body: "Every flower, gift and finishing detail is selected with purpose.",
    image: "/assets/about/value-personally-chosen.png",
    mobileImage: "/assets/about/value-personally-chosen-mobile.png",
    alt: "Amanda selecting eucalyptus foliage for a floral arrangement",
  },
  {
    number: "02",
    title: "Made with care",
    body: "Each order receives the attention we would want for someone close to us.",
    image: "/assets/about/value-made-with-care.png",
    mobileImage: "/assets/about/value-made-with-care-mobile.png",
    alt: "Amanda carefully tying a pink hand-tied bouquet at the studio bench",
  },
  {
    number: "03",
    title: "Genuinely personal",
    body: "Gentle guidance and thoughtful details shaped around the person and occasion.",
    image: "/assets/about/value-genuinely-personal.png",
    mobileImage: "/assets/about/value-genuinely-personal-mobile.png",
    alt: "Amanda writing a personal Shore and Grace gift card beside flowers and a wrapped gift",
  },
]

const process = [
  {
    number: "01",
    title: "Tell us the moment",
    body: "Choose online or speak with us if you would like guidance for the occasion.",
  },
  {
    number: "02",
    title: "We create with care",
    body: "Your order is prepared with attention to colour, texture and personal detail.",
  },
  {
    number: "03",
    title: "Beautifully delivered",
    body: "We make sure the final gesture arrives feeling every bit as special as intended.",
  },
]

function HeroImage() {
  return (
    <picture className={styles.heroImage}>
      <source
        media="(min-width: 768px)"
        srcSet="/assets/about/hero-kraft-desktop.png"
      />
      <source
        media="(max-width: 767px)"
        srcSet="/assets/about/hero-kraft-mobile.png"
      />
      <img
        src="/assets/about/hero-kraft-mobile.png"
        alt=""
        width={1024}
        height={512}
        fetchPriority="high"
      />
    </picture>
  )
}

type ArtDirectedImageProps = {
  alt: string
  desktop: {
    height: number
    src: string
    width: number
  }
  mobile: {
    height: number
    src: string
    width: number
  }
  sizes: string
}

function ArtDirectedImage({
  alt,
  desktop,
  mobile,
  sizes,
}: ArtDirectedImageProps) {
  return (
    <picture className={styles.artDirectedImage}>
      <source media="(min-width: 768px)" srcSet={desktop.src} />
      <source media="(max-width: 767px)" srcSet={mobile.src} />
      <img
        src={mobile.src}
        alt={alt}
        width={mobile.width}
        height={mobile.height}
        sizes={sizes}
        loading="lazy"
      />
    </picture>
  )
}

function Flourish({ large = false }: { large?: boolean }) {
  return (
    <Image
      className={large ? styles.flourishLarge : styles.flourish}
      src="/assets/home/sections/section-foliage.svg"
      alt=""
      width={large ? 159 : 80}
      height={large ? 63 : 32}
      aria-hidden="true"
    />
  )
}

export default function AboutTemplate() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-title">
        <HeroImage />
        <div className={styles.heroContent}>
          <h1 id="about-title">
            <span>About</span> <span>Shore &amp; Grace</span>
          </h1>
          <p>
            Thoughtful flowers for <span>the moments that matter</span>
          </p>
        </div>
        <span className={styles.heroCurve} aria-hidden="true" />
      </section>

      <section className={styles.founder} aria-labelledby="founder-title">
        <p className={styles.eyebrow}>Meet Amanda</p>
        <h2 id="founder-title">
          Flowers, gifts and thoughtful details, chosen personally.
        </h2>
        <div className={`${styles.imageFrame} ${styles.founderImage}`}>
          <ArtDirectedImage
            alt="Amanda, founder of Shore and Grace, among colourful tulips"
            desktop={{
              src: "/assets/about/founder-desktop.png",
              width: 582,
              height: 546,
            }}
            mobile={{
              src: "/assets/about/founder-mobile.png",
              width: 342,
              height: 357,
            }}
            sizes="(max-width: 767px) calc(100vw - 48px), 582px"
          />
        </div>
        <p className={styles.founderBodyOne}>
          I’m Amanda, founder of Shore &amp; Grace. What began with a love of
          flowers and meaningful gifting has grown into an independent studio
          built around the moments people want to remember.
        </p>
        <p className={styles.founderBodyTwo}>
          Every bouquet, keepsake and finishing touch is considered with care.
          Whether you are celebrating something joyful, offering comfort or
          simply letting someone know they are in your thoughts, I want the
          experience to feel warm, personal and beautifully uncomplicated.
        </p>
        <BrandButton
          className={styles.founderButton}
          href="/contact"
          variant="secondary"
        >
          Talk to Amanda
        </BrandButton>
      </section>

      <section className={styles.quote} aria-labelledby="quote-title">
        <Flourish large />
        <p className={styles.eyebrow}>The heart of Shore &amp; Grace</p>
        <blockquote>
          <p id="quote-title">
            “It is never just the flowers.
            <br className={styles.desktopBreak} /> It is the feeling behind
            them.”
          </p>
          <cite>– Amanda, founder of Shore &amp; Grace</cite>
        </blockquote>
        <p className={styles.quoteSupporting}>
          Shore &amp; Grace is here to make heartfelt gestures feel effortless,
          without losing the care and individuality that make them meaningful.
        </p>
      </section>

      <section className={styles.values} aria-labelledby="values-title">
        <Flourish />
        <p className={styles.eyebrow}>Our values</p>
        <h2 id="values-title">Three principles shape every order we create.</h2>
        <p className={styles.intro}>
          Whatever the occasion, three simple promises guide how we choose, make
          and send every order.
        </p>
        <div className={styles.valueGrid}>
          {values.map((value, index) => (
            <article
              className={`${styles.value} ${
                index === 1 ? styles.valueOffset : ""
              }`}
              key={value.number}
            >
              <div className={styles.valueImage}>
                <ArtDirectedImage
                  alt={value.alt}
                  desktop={{
                    src: value.image,
                    width: 379,
                    height: 480,
                  }}
                  mobile={{
                    src: value.mobileImage,
                    width: 342,
                    height: 430,
                  }}
                  sizes="(max-width: 767px) calc(100vw - 48px), 379px"
                />
              </div>
              <div className={styles.valueCopy}>
                <p className={styles.number}>{value.number}</p>
                <div>
                  <h3>{value.title}</h3>
                  <p>{value.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.approach} aria-labelledby="approach-title">
        <Flourish large />
        <p className={styles.eyebrow}>Our approach</p>
        <h2 id="approach-title">From first hello to final flourish</h2>
        <p className={styles.intro}>
          A calm, considered experience at every step.
        </p>
        <div className={styles.approachTimeline} aria-hidden="true">
          <span>Start</span>
          <Image
            className={styles.approachLine}
            src="/assets/about/approach-line.svg"
            alt=""
            width={880}
            height={15}
          />
          {["first", "second", "third"].map((position) => (
            <Image
              className={`${styles.approachDot} ${styles[position]}`}
              key={position}
              src="/assets/about/approach-dot.svg"
              alt=""
              width={14}
              height={14}
            />
          ))}
          <span>Finish</span>
        </div>
        <div className={styles.stepGrid}>
          {process.map((step) => (
            <article className={styles.step} key={step.number}>
              <div className={styles.stepHeading}>
                <p className={styles.number}>{step.number}</p>
                <h3>{step.title}</h3>
              </div>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.studio} aria-labelledby="studio-title">
        <p className={styles.eyebrow}>Independent &amp; personal</p>
        <h2 id="studio-title">A small studio with time for the details.</h2>
        <div className={`${styles.imageFrame} ${styles.studioImage}`}>
          <ArtDirectedImage
            alt="Amanda arranging flowers by hand at the Shore and Grace studio workbench"
            desktop={{
              src: "/assets/about/studio-figma-desktop.png",
              width: 582,
              height: 600,
            }}
            mobile={{
              src: "/assets/about/studio-mobile.png",
              width: 342,
              height: 354,
            }}
            sizes="(max-width: 767px) calc(100vw - 48px), 582px"
          />
        </div>
        <p className={styles.studioBodyOne}>
          As an independent studio, we can stay close to every order. We listen
          properly, choose our partners carefully and give the finishing details
          the time they deserve.
        </p>
        <p className={styles.studioBodyTwo}>
          As Shore &amp; Grace grows, that promise remains the same, considered
          floristry, thoughtful gifting and a genuinely warm experience.
        </p>
      </section>

      <section className={styles.cta} aria-labelledby="cta-title">
        <p className={styles.eyebrow}>Here when you need us</p>
        <h2 id="cta-title">Ready to send something thoughtful?</h2>
        <p>
          Explore the collection or talk to Amanda if you would like a little
          guidance.
        </p>
        <div className={styles.ctaActions}>
          <BrandButton
            className={styles.ctaShop}
            href="/store"
            variant="tertiary"
          >
            Shop flowers and gifts
          </BrandButton>
          <BrandButton
            className={styles.ctaContact}
            href="/contact"
            variant="secondary"
          >
            Talk to Amanda
          </BrandButton>
        </div>
      </section>

      <section className={styles.closing} aria-label="Shore and Grace motto">
        <Image
          src="/assets/about/floral-detail-desktop.png"
          alt=""
          width={94}
          height={94}
          aria-hidden="true"
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
