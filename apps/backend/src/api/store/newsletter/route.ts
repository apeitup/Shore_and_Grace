import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { requestNewsletterSubscriptionWorkflow } from "../../../workflows/request-newsletter-subscription"

export const PostStoreNewsletterSchema = z.object({
  email: z.string().trim().email().max(320),
})

type PostStoreNewsletterBody = z.infer<typeof PostStoreNewsletterSchema>

export const POST = async (
  req: MedusaRequest<PostStoreNewsletterBody>,
  res: MedusaResponse
) => {
  await requestNewsletterSubscriptionWorkflow(req.scope).run({
    input: {
      email: req.validatedBody.email,
      consent_source: "storefront_footer",
    },
  })

  res.status(202).json({
    newsletter: {
      status: "confirmation_required",
      message: "Check your inbox to confirm your subscription.",
    },
  })
}
