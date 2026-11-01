import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { FAQ_MODULE } from "../../../modules/faq"
import type FaqModuleService from "../../../modules/faq/service"

export const GetStoreFaqsSchema = z.object({
  category: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
})

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<FaqModuleService>(FAQ_MODULE)
  const query = req.validatedQuery as z.infer<typeof GetStoreFaqsSchema>
  const categoryFilter: Record<string, unknown> = { active: true }
  if (query.category) categoryFilter.handle = query.category
  const categories = await service.listFaqCategories(categoryFilter, {
    order: { position: "ASC", name: "ASC" },
  })
  const categoryIds = categories.map((category) => category.id)
  const questionFilter: Record<string, unknown> = {
    category_id: categoryIds,
    published: true,
  }
  if (query.featured) questionFilter.featured = query.featured === "true"
  const questions = categoryIds.length
    ? await service.listFaqQuestions(questionFilter, {
        order: { position: "ASC", created_at: "ASC" },
      })
    : []

  res.json({
    faq_categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      handle: category.handle,
      description: category.description,
      questions: questions
        .filter((question) => question.category_id === category.id)
        .map((question) => ({
          id: question.id,
          question: question.question,
          answer: question.answer,
          featured: question.featured,
        })),
    })),
  })
}
