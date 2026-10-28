import { MedusaService } from "@medusajs/framework/utils"
import BlockedDeliveryDate from "./models/blocked-delivery-date"
import DeliveryReservation from "./models/delivery-reservation"
import DeliveryZone from "./models/delivery-zone"

class FloristDeliveryModuleService extends MedusaService({
  DeliveryZone,
  BlockedDeliveryDate,
  DeliveryReservation,
}) {}

export default FloristDeliveryModuleService
