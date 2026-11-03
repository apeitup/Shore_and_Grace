import BrandButton from "@modules/brand/components/button"
import Image from "next/image"

const values = [
  {
    number: "01",
    title: "Personally chosen",
    body: "Every flower, gift and finishing detail is selected with purpose.",
  },
  {
    number: "02",
    title: "Made with care",
    body: "Each order receives the attention we would want for someone close to us.",
  },
  {
    number: "03",
    title: "Genuinely personal",
    body: "Gentle guidance and thoughtful details shaped around the person and occasion.",
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

type DetailCardProps = {
  number: string
  title: string
  body: string
}

function DetailCard({ number, title, body }: DetailCardProps) {
  return (
    <article className="sg-about-card">
      <p className="sg-about-card__number">{number}</p>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  )
}

function Flourish() {
  return (
    <Image
      className="sg-about-flourish"
      src="/assets/home/sections/section-foliage.svg"
      alt=""
      width={159}
      height={63}
      aria-hidden="true"
    />
  )
}

export default function AboutTemplate() {
  return (
    <main className="sg-about">
      <section className="sg-about-hero" aria-labelledby="about-title">
        <Image
          className="sg-about-hero__image"
          src="/assets/about/banner-desktop.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="sg-about-hero__content">
          <h1 id="about-title">
            <span>About</span>{" "}
            <span>Shore &amp; Grace</span>
          </h1>
          <p>
            <span>Thoughtful flowers for</span>{" "}
            <span>the moments that matter</span>
          </p>
        </div>
        <span className="sg-about-hero__curve" aria-hidden="true" />
      </section>

      <section className="sg-about-founder sg-about-section">
        <div className="sg-about-founder__copy">
          <p className="sg-about-eyebrow">Meet Amanda</p>
          <h2>Flowers, gifts and thoughtful details, chosen personally.</h2>
          <p>
            I’m Amanda, founder of Shore &amp; Grace. What began with a love of
            flowers and meaningful gifting has grown into an independent studio
            built around the moments people want to remember.
          </p>
          <p>
            Every bouquet, keepsake and finishing touch is considered with care.
            Whether you are celebrating something joyful, offering comfort or
            simply letting someone know they are in your thoughts, I want the
            experience to feel warm, personal and beautifully uncomplicated.
          </p>
          <BrandButton href="/contact" variant="secondary">
            Ask Amanda
          </BrandButton>
        </div>
        <div className="sg-about-founder__image sg-about-image">
          <Image
            src="/assets/about/amanda-desktop.png"
            alt="Amanda, founder of Shore & Grace, standing among colourful tulips"
            fill
            priority
            sizes="(max-width: 767px) calc(100vw - 48px), 582px"
          />
        </div>
      </section>

      <section className="sg-about-quote sg-about-centered sg-about-section--linen">
        <Flourish />
        <p className="sg-about-eyebrow">The heart of Shore &amp; Grace</p>
        <blockquote>
          <p>“It is never just the flowers. It is the feeling behind them.”</p>
          <cite>– Amanda, founder of Shore &amp; Grace</cite>
        </blockquote>
        <p className="sg-about-quote__supporting">
          Shore &amp; Grace is here to make heartfelt gestures feel effortless,
          without losing the care and individuality that make them meaningful.
        </p>
      </section>

      <section className="sg-about-values sg-about-section sg-about-centered">
        <Flourish />
        <p className="sg-about-eyebrow">Our values</p>
        <h2>Three principles shape every order we create.</h2>
        <p className="sg-about-intro">
          Whether you’re planning a meaningful gift, arranging flowers for an
          event, or have a question about an order, our team is here to help.
        </p>
        <div className="sg-about-card-grid">
          {values.map((value) => (
            <DetailCard key={value.number} {...value} />
          ))}
        </div>
      </section>

      <section className="sg-about-process sg-about-section--linen sg-about-centered">
        <Flourish />
        <p className="sg-about-eyebrow">Our approach</p>
        <h2>From first hello to final flourish</h2>
        <p className="sg-about-intro">
          A calm, considered experience at every step.
        </p>
        <div className="sg-about-card-grid">
          {process.map((step) => (
            <DetailCard key={step.number} {...step} />
          ))}
        </div>
      </section>

      <section className="sg-about-studio sg-about-section">
        <div className="sg-about-studio__image sg-about-image">
          <Image
            src="/assets/about/studio-desktop.png"
            alt="A florist carefully arranging flowers at the Shore & Grace studio"
            fill
            sizes="(max-width: 767px) calc(100vw - 48px), 582px"
          />
        </div>
        <div className="sg-about-studio__copy">
          <p className="sg-about-eyebrow">Independent &amp; personal</p>
          <h2>A small studio with time for the details.</h2>
          <p>
            As an independent studio, we can stay close to every order. We
            listen properly, choose our partners carefully and give the
            finishing details the time they deserve.
          </p>
          <p>
            As Shore &amp; Grace grows, that promise remains the same, considered
            floristry, thoughtful gifting and a genuinely warm experience.
          </p>
        </div>
      </section>

      <section className="sg-about-cta sg-about-centered">
        <p className="sg-about-eyebrow">Here when you need us</p>
        <h2>Ready to send something thoughtful?</h2>
        <p>
          Explore the collection or talk to Amanda if you would like a little
          guidance.
        </p>
        <div className="sg-about-cta__actions">
          <BrandButton href="/store" variant="tertiary">
            Shop flowers and gifts
          </BrandButton>
          <BrandButton href="/contact" variant="tertiary">
            Ask Amanda
          </BrandButton>
        </div>
      </section>

      <section className="sg-about-closing sg-about-centered">
        <Image
          src="/assets/about/floral-detail-desktop.png"
          alt="Green pom-pom flower"
          width={94}
          height={94}
        />
        <h2>
          Thoughtfully gathered.
          <br />
          Beautifully remembered.
        </h2>
      </section>
    </main>
  )
}
