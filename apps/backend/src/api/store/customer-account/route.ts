import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { removeCustomerAccountWorkflow } from "@medusajs/medusa/core-flows"

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  await removeCustomerAccountWorkflow(req.scope).run({
    input: { customerId: req.auth_context.actor_id },
  })
  res.json({ deleted: true })
}
