import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { PostAdminFaqCategory } from "../route"
import { deleteFaqCategoryWorkflow } from "../../../../../workflows/delete-faq-category"
import { saveFaqCategoryWorkflow } from "../../../../../workflows/save-faq-category"

export const POST = async (
  req: AuthenticatedMedusaRequest<PostAdminFaqCategory>,
  res: MedusaResponse,
) => {
  const { result } = await saveFaqCategoryWorkflow(req.scope).run({
    input: { ...req.validatedBody, id: req.params.id },
  })
  res.json({ faq_category: result.category })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  await deleteFaqCategoryWorkflow(req.scope).run({
    input: { id: req.params.id },
  })
  res.json({ id: req.params.id, deleted: true })
}
