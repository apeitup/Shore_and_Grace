import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const GetAdminPrivacyRequestsSchema = createFindParams()

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: privacyRequests,
    metadata: { count, take, skip } = { count: 0, take: 20, skip: 0 },
  } = await query.graph({
    entity: "privacy_request",
    ...req.queryConfig,
  })

  res.json({
    privacy_requests: privacyRequests,
    count,
    limit: take,
    offset: skip,
  })
}
