import { MedusaService } from "@medusajs/framework/utils"
import NewsletterCampaign from "./models/newsletter-campaign"
import NewsletterEvent from "./models/newsletter-event"
import NewsletterSubscription from "./models/newsletter-subscription"

class NewsletterModuleService extends MedusaService({
  NewsletterCampaign,
  NewsletterEvent,
  NewsletterSubscription,
}) {}

export default NewsletterModuleService
