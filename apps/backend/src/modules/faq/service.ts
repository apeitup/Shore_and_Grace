import { MedusaService } from "@medusajs/framework/utils"
import FaqCategory from "./models/faq-category"
import FaqQuestion from "./models/faq-question"

class FaqModuleService extends MedusaService({
  FaqCategory,
  FaqQuestion,
}) {}

export default FaqModuleService
