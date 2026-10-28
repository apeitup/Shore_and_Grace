import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { updateReviewWorkflow } from "../../../../workflows/update-review"

export const PostAdminUpdateReviewsStatusSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(["pending", "approved", "rejected"]),
})

export async function POST(
  req: MedusaRequest<z.infer<typeof PostAdminUpdateReviewsStatusSchema>>,
  res: MedusaResponse
) {
  const { ids, status } = req.validatedBody
  const { result } = await updateReviewWorkflow(req.scope).run({
    input: ids.map((id) => ({ id, status })),
  })

  res.json(result)
}
