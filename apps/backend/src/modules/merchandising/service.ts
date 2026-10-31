import { MedusaService } from "@medusajs/framework/utils"
import MerchandisingItem from "./models/merchandising-item"
import MerchandisingSet from "./models/merchandising-set"

class MerchandisingModuleService extends MedusaService({
  MerchandisingSet,
  MerchandisingItem,
}) {}

export default MerchandisingModuleService
