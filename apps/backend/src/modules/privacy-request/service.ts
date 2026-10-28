import { MedusaService } from "@medusajs/framework/utils"
import PrivacyRequest from "./models/privacy-request"

class PrivacyRequestModuleService extends MedusaService({
  PrivacyRequest,
}) {}

export default PrivacyRequestModuleService
