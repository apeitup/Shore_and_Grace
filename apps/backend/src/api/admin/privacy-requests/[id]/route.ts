import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { updatePrivacyRequestWorkflow } from "../../../../workflows/update-privacy-request"

export const PostAdminPrivacyRequestSchema = z
  .object({
    status: z
      .enum([
        "received",
        "identity_check",
        "in_progress",
        "completed",
        "rejected",
      ])
      .optional(),
    identity_status: z.enum(["pending", "verified", "failed"]).optional(),
    internal_notes: z.string().trim().max(5000).nullable().optional(),
  })
  .refine(
    (value) =>
      value.status !== undefined ||
      value.identity_status !== undefined ||
      value.internal_notes !== undefined,
    { message: "Provide at least one field to update." }
  )

type PostAdminPrivacyRequestBody = z.infer<
  typeof PostAdminPrivacyRequestSchema
>

export const POST = async (
  req: MedusaRequest<PostAdminPrivacyRequestBody>,
  res: MedusaResponse
) => {
  const { result } = await updatePrivacyRequestWorkflow(req.scope).run({
    input: { id: req.params.id, ...req.validatedBody },
  })
  res.json(result)
}
