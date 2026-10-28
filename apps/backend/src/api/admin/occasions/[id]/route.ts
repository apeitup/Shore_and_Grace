import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { deleteSystemOccasionWorkflow } from "../../../../workflows/delete-system-occasion"
import { updateSystemOccasionWorkflow } from "../../../../workflows/update-system-occasion"

export const PostAdminOccasionUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/).optional(),
  date_type: z
    .enum(["fixed", "easter", "mothering_sunday", "fathers_day"])
    .optional(),
  month: z.number().int().min(1).max(12).nullable().optional(),
  day: z.number().int().min(1).max(31).nullable().optional(),
  default_reminder_days: z.number().int().min(0).max(365).optional(),
  enabled_by_default: z.boolean().optional(),
  active: z.boolean().optional(),
  description: z.string().trim().nullable().optional(),
  sort_order: z.number().int().optional(),
})

export type PostAdminOccasionUpdateBody = z.infer<
  typeof PostAdminOccasionUpdateSchema
>

export const POST = async (
  req: MedusaRequest<PostAdminOccasionUpdateBody>,
  res: MedusaResponse
) => {
  const { result } = await updateSystemOccasionWorkflow(req.scope).run({
    input: { id: req.params.id, ...req.validatedBody },
  })
  res.json(result)
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  await deleteSystemOccasionWorkflow(req.scope).run({ input: req.params.id })
  res.status(200).json({ id: req.params.id, deleted: true })
}
