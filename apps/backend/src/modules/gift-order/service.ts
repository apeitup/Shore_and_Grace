import { MedusaService } from "@medusajs/framework/utils"
import GiftOrderDetails from "./models/gift-order-details"

class GiftOrderModuleService extends MedusaService({ GiftOrderDetails }) {}

export default GiftOrderModuleService
