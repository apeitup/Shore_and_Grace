import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "@fontsource/cormorant-garamond/latin-400.css"
import "@fontsource/cormorant-garamond/latin-500.css"
import "@fontsource/cormorant-garamond/latin-600.css"
import "@fontsource/montserrat/latin-400.css"
import "@fontsource/montserrat/latin-500.css"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" data-mode="light">
      <head>
        <link rel="ucp" href="/.well-known/ucp" />
      </head>
      <body className="bg-sg-linen text-sg-ink">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
