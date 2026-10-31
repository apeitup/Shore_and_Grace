import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { NEWSLETTER_MODULE } from "../../../../modules/newsletter"
import type NewsletterModuleService from "../../../../modules/newsletter/service"
import { deleteNewsletterCampaignWorkflow } from "../../../../workflows/delete-newsletter-campaign"
import { saveNewsletterCampaignWorkflow } from "../../../../workflows/save-newsletter-campaign"
import type { PostAdminNewsletter } from "../route"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const service = req.scope.resolve<NewsletterModuleService>(
    NEWSLETTER_MODULE,
  )
  const newsletter = await service
    .retrieveNewsletterCampaign(req.params.id)
    .catch(() => null)

  if (!newsletter) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Newsletter not found",
    )
  }

  res.json({ newsletter })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostAdminNewsletter>,
  res: MedusaResponse,
) => {
  const { result } = await saveNewsletterCampaignWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      ...req.validatedBody,
    },
  })

  res.json({ newsletter: result.campaign })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  await deleteNewsletterCampaignWorkflow(req.scope).run({
    input: req.params.id,
  })

  res.status(200).json({ id: req.params.id, deleted: true })
}
