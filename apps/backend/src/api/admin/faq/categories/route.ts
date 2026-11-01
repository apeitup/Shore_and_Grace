import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { FAQ_MODULE } from "../../../../modules/faq"
import type FaqModuleService from "../../../../modules/faq/service"
import { saveFaqCategoryWorkflow } from "../../../../workflows/save-faq-category"

export const PostAdminFaqCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  handle: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).nullable().optional(),
  position: z.number().int().min(0).max(10000).optional(),
  active: z.boolean().optional(),
})

export type PostAdminFaqCategory = z.infer<
  typeof PostAdminFaqCategorySchema
>

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const service = req.scope.resolve<FaqModuleService>(FAQ_MODULE)
  const categories = await service.listFaqCategories({}, {
    order: { position: "ASC", name: "ASC" },
  })
  const questions = await service.listFaqQuestions({}, { select: ["category_id"] })
  const counts = questions.reduce<Record<string, number>>((result, question) => {
    result[question.category_id] = (result[question.category_id] || 0) + 1
    return result
  }, {})

  res.json({
    faq_categories: categories.map((category) => ({
      ...category,
      question_count: counts[category.id] || 0,
    })),
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostAdminFaqCategory>,
  res: MedusaResponse,
) => {
  const { result } = await saveFaqCategoryWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json({ faq_category: result.category })
}
