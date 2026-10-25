import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  return (
    <footer className="sg-footer">
      <div className="content-container">
        <div className="sg-footer__top">
          <div className="sg-footer__brand">
            <LocalizedClientLink
              href="/"
              className="sg-wordmark sg-wordmark--footer"
            >
              <span>Shore & Grace</span>
              <small>Floral & Gift Studio</small>
            </LocalizedClientLink>
            <p>
              Flowers and gifts, chosen with feeling and made by hand on the
              Essex coast.
            </p>
          </div>
          <div className="sg-footer__links">
            <div>
              <h3>Shop</h3>
              <ul>
                <li>
                  <LocalizedClientLink href="/store">
                    Fresh flowers
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/store">
                    Faux botanicals
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/store">Gifts</LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/contact">
                    Funeral tributes
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
            <div>
              <h3>Help</h3>
              <ul>
                <li>
                  <LocalizedClientLink href="/shipping">
                    Shipping information
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/returns">
                    Return policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/terms">
                    Terms of service
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/privacy">
                    Privacy policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/contact">
                    Contact
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
            <div>
              <h3>Visit</h3>
              <ul>
                <li>Walton-on-the-Naze</li>
                <li>Essex, United Kingdom</li>
                <li>
                  <a href="mailto:info@shoreandgrace.com">
                    info@shoreandgrace.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="sg-footer__bottom">
          <p>
            © {new Date().getFullYear()} Shore & Grace. All rights reserved.
          </p>
          <p>Fresh flowers · Lasting botanicals · Thoughtful gifts</p>
        </div>
      </div>
    </footer>
  )
}
