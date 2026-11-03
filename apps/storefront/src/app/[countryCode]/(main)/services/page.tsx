import { Metadata } from "next"

import { STORE_NAME } from "@lib/util/site"
import ServicesTemplate from "@modules/services/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Floral Services",
  description: `Explore funeral flowers, everlasting arrangements, fresh bouquets, floral gifts, and bespoke designs from ${STORE_NAME}.`,
}

export default function ServicesPage() {
  return <ServicesTemplate />
}
