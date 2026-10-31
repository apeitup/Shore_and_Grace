import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { sendNewsletterCampaignWorkflow } from "../../../../../workflows/send-newsletter-campaign"

export const PostAdminNewsletterSendSchema = z.object({
  test_email: z.email().optional(),
})

export type PostAdminNewsletterSend = z.infer<
  typeof PostAdminNewsletterSendSchema
>

export const POST = async (
  req: AuthenticatedMedusaRequest<PostAdminNewsletterSend>,
  res: MedusaResponse,
) => {
  const { result } = await sendNewsletterCampaignWorkflow(req.scope).run({
    input: {
      campaign_id: req.params.id,
      test_email: req.validatedBody.test_email,
    },
  })

  res.json({ result })
}
