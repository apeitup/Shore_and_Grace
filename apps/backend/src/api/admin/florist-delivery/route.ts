import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { FLORIST_DELIVERY_MODULE } from "../../../modules/florist-delivery"
import FloristDeliveryModuleService from "../../../modules/florist-delivery/service"
import { saveDeliveryZoneWorkflow } from "../../../workflows/save-delivery-zone"

export const PostAdminDeliveryZoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  fulfillment_type: z.enum(["delivery", "collection"]),
  postcode_patterns: z.array(z.string().trim().min(1)).default([]),
  shipping_option_id: z.string().trim().nullable().optional(),
  currency_code: z.string().trim().length(3).default("gbp"),
  fee: z.number().min(0).default(0),
  minimum_lead_days: z.number().int().min(0).max(30).default(1),
  same_day_cutoff: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  daily_capacity: z.number().int().min(1).max(10000).default(20),
  allowed_weekdays: z.array(z.number().int().min(0).max(6)).min(1),
  delivery_window: z.string().trim().max(120).nullable().optional(),
  active: z.boolean().default(true),
})

type Body = z.infer<typeof PostAdminDeliveryZoneSchema>

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: FloristDeliveryModuleService = req.scope.resolve(
    FLORIST_DELIVERY_MODULE
  )
  const [zones, blockedDates, reservations] = await Promise.all([
    service.listDeliveryZones({}, { order: { created_at: "DESC" } }),
    service.listBlockedDeliveryDates({}, { order: { date: "ASC" } }),
    service.listDeliveryReservations({}, { order: { delivery_date: "ASC" } }),
  ])
  res.json({ zones, blocked_dates: blockedDates, reservations })
}

export const POST = async (req: MedusaRequest<Body>, res: MedusaResponse) => {
  const { result } = await saveDeliveryZoneWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(req.validatedBody.id ? 200 : 201).json(result)
}
