import { Metadata } from "next"

import NotFoundTemplate from "@modules/layout/templates/not-found"

export const metadata: Metadata = {
  title: "Page not found | Shore & Grace",
  description: "The page you were looking for could not be found.",
}

export default function NotFound() {
  return <NotFoundTemplate />
}
