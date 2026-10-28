import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { SPECIAL_OCCASION_MODULE } from "../../../modules/special-occasion"
import SpecialOccasionModuleService from "../../../modules/special-occasion/service"
import { createSystemOccasionWorkflow } from "../../../workflows/create-system-occasion"

export const PostAdminOccasionSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/),
  date_type: z.enum([
    "fixed",
    "easter",
    "mothering_sunday",
    "fathers_day",
  ]),
  month: z.number().int().min(1).max(12).nullable().optional(),
  day: z.number().int().min(1).max(31).nullable().optional(),
  default_reminder_days: z.number().int().min(0).max(365).default(14),
  enabled_by_default: z.boolean().default(false),
  active: z.boolean().default(true),
  description: z.string().trim().nullable().optional(),
  sort_order: z.number().int().default(0),
})

export type PostAdminOccasionBody = z.infer<typeof PostAdminOccasionSchema>

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: SpecialOccasionModuleService = req.scope.resolve(
    SPECIAL_OCCASION_MODULE
  )
  const occasions = await service.listSystemOccasions(
    {},
    { order: { sort_order: "ASC", name: "ASC" } }
  )
  res.json({ occasions })
}

export const POST = async (
  req: MedusaRequest<PostAdminOccasionBody>,
  res: MedusaResponse
) => {
  const { result } = await createSystemOccasionWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json(result)
}
