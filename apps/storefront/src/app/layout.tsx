import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "@fontsource/cormorant-garamond/latin-400.css"
import "@fontsource/cormorant-garamond/latin-500.css"
import "@fontsource/cormorant-garamond/latin-600.css"
import "@fontsource/montserrat/latin-400.css"
import "@fontsource/montserrat/latin-500.css"
import "@fontsource/montserrat/latin-600.css"
import "@fontsource/montserrat/latin-700.css"
import "@fontsource/montserrat/latin-900.css"
import "styles/globals.css"
import PostHogConsent from "@modules/analytics/components/posthog-consent"
import CookieConsentModal from "@modules/layout/components/cookie-consent"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" data-mode="light">
      <head>
        <link rel="ucp" href="/.well-known/ucp" />
      </head>
      <body suppressHydrationWarning className="bg-white text-sg-ink">
        <main className="relative sg-site-shell">{props.children}</main>
        <CookieConsentModal />
        <PostHogConsent />
      </body>
    </html>
  )
}
