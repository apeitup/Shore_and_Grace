import { defineRouteConfig } from "@medusajs/admin-sdk"
import NewsletterPage from "../page"

const SubscribersPage = () => <NewsletterPage />

export const config = defineRouteConfig({
  label: "Subscribers",
  rank: 1,
})

export default SubscribersPage
