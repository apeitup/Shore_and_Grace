import { MedusaService } from "@medusajs/framework/utils"
import CustomerOccasion from "./models/customer-occasion"
import SystemOccasion from "./models/system-occasion"

class SpecialOccasionModuleService extends MedusaService({
  CustomerOccasion,
  SystemOccasion,
}) {}

export default SpecialOccasionModuleService
