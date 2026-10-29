import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { z } from "@medusajs/framework/zod";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const GetAdminContactEnquiriesSchema = createFindParams().extend({
  q: z.string().trim().max(160).optional(),
  status: z.enum(["new", "in_progress", "resolved", "spam"]).optional(),
});

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const search = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const filters: Record<string, unknown> = {};

  if (status) {
    filters.status = status;
  }
  if (search) {
    filters.$or = [
      { reference: { $ilike: `%${search}%` } },
      { name: { $ilike: `%${search}%` } },
      { email: { $ilike: `%${search}%` } },
      { order_reference: { $ilike: `%${search}%` } },
    ];
  }

  const {
    data: contactEnquiries,
    metadata: { count, take, skip } = { count: 0, take: 20, skip: 0 },
  } = await query.graph({
    entity: "contact_enquiry",
    ...req.queryConfig,
    filters,
  });

  res.json({
    contact_enquiries: contactEnquiries,
    count,
    limit: take,
    offset: skip,
  });
};
