import { Metadata } from "next"

import { STORE_NAME } from "@lib/util/site"
import AboutTemplate from "@modules/about/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "About Shore & Grace",
  description: `Meet the founder of ${STORE_NAME} and discover the care behind every flower, gift, and thoughtful detail.`,
}

export default function AboutPage() {
  return <AboutTemplate />
}
