import { MedusaService } from "@medusajs/framework/utils"
import CustomerPreference from "./models/customer-preference"

class CustomerPreferencesModuleService extends MedusaService({
  CustomerPreference,
}) {}

export default CustomerPreferencesModuleService
