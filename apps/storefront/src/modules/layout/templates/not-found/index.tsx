import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function NotFoundTemplate() {
  return (
    <section className="sg-not-found" aria-labelledby="not-found-title">
      <div className="sg-not-found__art">
        <h1 id="not-found-title" className="sg-not-found__title">
          <span>ERROR</span>{" "}
          <span>404</span>
        </h1>
        <p className="sg-not-found__subtitle">Page not found</p>

        <Image
          className="sg-not-found__scene"
          src="/assets/404/error-scene.png"
          alt="A worried sunflower reaching towards a red 404 emergency button"
          width={1602}
          height={1024}
          priority
        />

        <Image
          className="sg-not-found__home-copy"
          src="/assets/404/go-home-text.svg"
          alt=""
          width={243}
          height={42}
          aria-hidden="true"
        />
        <Image
          className="sg-not-found__home-arrow"
          src="/assets/404/go-home-arrow.svg"
          alt=""
          width={34}
          height={155}
          aria-hidden="true"
        />

        <LocalizedClientLink
          className="sg-not-found__home-link"
          href="/"
          aria-label="Return to the Shore & Grace homepage"
        >
          <span className="sg-not-found__home-label">Go to home page</span>
        </LocalizedClientLink>
      </div>
    </section>
  )
}
