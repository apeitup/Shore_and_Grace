import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { FAQ_MODULE } from "../../../../modules/faq"
import type FaqModuleService from "../../../../modules/faq/service"
import { saveFaqQuestionWorkflow } from "../../../../workflows/save-faq-question"

export const GetAdminFaqQuestionsSchema = z.object({
  category_id: z.string().optional(),
  published: z.enum(["true", "false"]).optional(),
})

export const PostAdminFaqQuestionSchema = z.object({
  id: z.string().optional(),
  category_id: z.string().min(1),
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(10000),
  position: z.number().int().min(0).max(10000).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
})

export type PostAdminFaqQuestion = z.infer<
  typeof PostAdminFaqQuestionSchema
>

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const service = req.scope.resolve<FaqModuleService>(FAQ_MODULE)
  const query = req.validatedQuery as z.infer<
    typeof GetAdminFaqQuestionsSchema
  >
  const filter: Record<string, unknown> = {}
  if (query.category_id) filter.category_id = query.category_id
  if (query.published) filter.published = query.published === "true"
  const questions = await service.listFaqQuestions(filter, {
    order: { position: "ASC", created_at: "ASC" },
  })

  res.json({ faq_questions: questions })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostAdminFaqQuestion>,
  res: MedusaResponse,
) => {
  const { result } = await saveFaqQuestionWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json({ faq_question: result.question })
}
