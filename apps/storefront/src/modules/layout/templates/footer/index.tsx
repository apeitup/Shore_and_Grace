import BrandButton from "@modules/brand/components/button"
import BrandSignature from "@modules/brand/components/brand-signature"
import BrandTextInput from "@modules/brand/components/text-input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CookieSettingsButton from "@modules/layout/components/cookie-settings-button"
import Image from "next/image"

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
  {
    label: "Etsy",
    href: "https://shoreandgrace.etsy.com/",
    icon: "etsy",
  },
]

export default function Footer() {
  return (
    <footer className="sg-footer">
      <div className="sg-footer__curve" aria-hidden="true">
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

      <div className="content-container sg-footer__content">
        <div className="sg-footer__studio">
          <span className="sg-footer__signature-desktop">
            <BrandSignature context="footer" tone="dark" />
          </span>
          <span className="sg-footer__signature-mobile">
            <BrandSignature context="footer" tone="dark" mobile />
          </span>
          <div className="sg-footer__socials" aria-label="Social media">
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

        <nav className="sg-footer__service" aria-label="Customer service">
          <h2>Customer Service</h2>
          <ul>
            <li>
              <LocalizedClientLink href="/account">
                My account
              </LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink href="/contact">FAQ</LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink href="/account/orders">
                Check Order Status
              </LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink href="/contact">
                Contact Us
              </LocalizedClientLink>
            </li>
          </ul>
        </nav>

        <div className="sg-footer__newsletter">
          <h2>Sign Up To Our Newsletter</h2>
          <p>
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>
          <form>
            <BrandTextInput
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
            />
            <BrandButton type="submit" tone="ink">
              Subscribe
            </BrandButton>
          </form>
        </div>
      </div>

      <div className="sg-footer__strap">
        <div className="content-container">
          <p>
            © {new Date().getFullYear()} Shore &amp; Grace. All rights reserved.
          </p>
          <div>
            <LocalizedClientLink href="/privacy">
              Privacy Policy
            </LocalizedClientLink>
            <LocalizedClientLink href="/cookies">
              Cookie Policy
            </LocalizedClientLink>
            <CookieSettingsButton className="sg-footer__cookie-settings" />
          </div>
        </div>
      </div>
    </footer>
  )
}
