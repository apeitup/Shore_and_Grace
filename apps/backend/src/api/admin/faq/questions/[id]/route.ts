import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { PostAdminFaqQuestion } from "../route"
import { deleteFaqQuestionWorkflow } from "../../../../../workflows/delete-faq-question"
import { saveFaqQuestionWorkflow } from "../../../../../workflows/save-faq-question"

export const POST = async (
  req: AuthenticatedMedusaRequest<PostAdminFaqQuestion>,
  res: MedusaResponse,
) => {
  const { result } = await saveFaqQuestionWorkflow(req.scope).run({
    input: { ...req.validatedBody, id: req.params.id },
  })
  res.json({ faq_question: result.question })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  await deleteFaqQuestionWorkflow(req.scope).run({
    input: { id: req.params.id },
  })
  res.json({ id: req.params.id, deleted: true })
}
