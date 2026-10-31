import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { recordNewsletterEngagementWorkflow } from "../../../../workflows/record-newsletter-engagement"

export const GetNewsletterClickSchema = z.object({
  token: z.string().trim().min(20).max(5000),
})

type GetNewsletterClickQuery = z.infer<typeof GetNewsletterClickSchema>

export const GET = async (
  req: MedusaRequest<unknown, GetNewsletterClickQuery>,
  res: MedusaResponse,
) => {
  const { result } = await recordNewsletterEngagementWorkflow(req.scope).run({
    input: { token: req.validatedQuery.token, action: "click" },
  })

  res.redirect(302, result.destination!)
}
