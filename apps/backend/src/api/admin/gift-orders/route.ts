import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GIFT_ORDER_MODULE } from "../../../modules/gift-order"
import GiftOrderModuleService from "../../../modules/gift-order/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: GiftOrderModuleService = req.scope.resolve(GIFT_ORDER_MODULE)
  const filters: Record<string, string> = {}
  if (typeof req.query.cart_id === "string") {
    filters.cart_id = req.query.cart_id
  }
  if (typeof req.query.order_id === "string") {
    filters.order_id = req.query.order_id
  }
  const giftOrders = await service.listGiftOrderDetails(filters, {
    order: { created_at: "DESC" },
  })
  res.json({ gift_orders: giftOrders })
}
