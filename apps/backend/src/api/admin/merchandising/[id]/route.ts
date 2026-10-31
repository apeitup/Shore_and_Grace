import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { deleteMerchandisingSetWorkflow } from "../../../../workflows/delete-merchandising-set"

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  await deleteMerchandisingSetWorkflow(req.scope).run({
    input: { id: req.params.id },
  })
  res.status(200).json({ id: req.params.id, deleted: true })
}
