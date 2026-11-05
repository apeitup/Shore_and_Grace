import BrandSignature from "@modules/brand/components/brand-signature"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NewsletterSignup from "@modules/layout/components/newsletter-signup"
import Image from "next/image"

import { footerGroups } from "./footer-links"
import FooterNavigation from "./footer-navigation"
import styles from "./footer.module.css"

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61594766006657",
    icon: "facebook",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/shore_and_grace",
    icon: "instagram",
  },
  {
    label: "Pinterest",
    href: "https://pin.it/3d5EAgITz",
    icon: "pinterest",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@shoreandgrace",
    icon: "youtube",
  },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.curve} aria-hidden="true">
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

      <div className={`content-container ${styles.content}`}>
        <div className={styles.studio}>
          <span className={styles.desktopSignature}>
            <BrandSignature context="footer" tone="dark" />
          </span>
          <span className={styles.mobileSignature}>
            <BrandSignature context="footer" tone="dark" mobile />
          </span>
          <div className={styles.socials} aria-label="Social media">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
              >
                <picture>
                  <source
                    media="(max-width: 767px)"
                    srcSet={`/assets/icons/${icon}-mobile.svg`}
                  />
                  <Image
                    src={`/assets/icons/${icon}.svg`}
                    alt=""
                    width={20}
                    height={20}
                  />
                </picture>
              </a>
            ))}
          </div>
        </div>

        <nav className={styles.desktopNavigation} aria-label="Footer navigation">
          {footerGroups.map((group) => (
            <section key={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink href={link.href}>
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <FooterNavigation />

        <div className={styles.newsletter}>
          <h2>Sign Up To Our Newsletter</h2>
          <p>
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>
          <NewsletterSignup />
        </div>
      </div>

      <div className={styles.strap}>
        <div className={`content-container ${styles.strapInner}`}>
          <p>
            © {new Date().getFullYear()} Shore &amp; Grace. All rights reserved.
          </p>
          <div className={styles.policies}>
            <LocalizedClientLink href="/terms">
              Terms &amp; Conditions
            </LocalizedClientLink>
            <LocalizedClientLink href="/privacy">
              Privacy Policy
            </LocalizedClientLink>
            <LocalizedClientLink href="/cookies">
              Cookie Policy
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
