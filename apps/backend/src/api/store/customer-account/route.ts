import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { removeCustomerAccountWithEmailWorkflow } from "../../../workflows/remove-customer-account"

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  await removeCustomerAccountWithEmailWorkflow(req.scope).run({
    input: { customerId: req.auth_context.actor_id },
  })
  res.json({ deleted: true })
}
