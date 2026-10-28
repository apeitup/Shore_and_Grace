import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import NotFoundTemplate from "@modules/layout/templates/not-found"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page not found | Shore & Grace",
  description: "The page you were looking for could not be found.",
}

export default function NotFound() {
  return (
    <>
      <Nav />
      <NotFoundTemplate />
      <Footer />
    </>
  )
}
