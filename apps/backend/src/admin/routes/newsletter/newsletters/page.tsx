import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CampaignList } from "../components/campaign-list"

const NewslettersPage = () => <CampaignList kind="newsletter" />

export const config = defineRouteConfig({
  label: "Newsletters",
  rank: 2,
})

export default NewslettersPage
