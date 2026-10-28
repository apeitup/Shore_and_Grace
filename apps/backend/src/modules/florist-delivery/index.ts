import { Module } from "@medusajs/framework/utils"
import FloristDeliveryModuleService from "./service"

export const FLORIST_DELIVERY_MODULE = "floristDelivery"

export default Module(FLORIST_DELIVERY_MODULE, {
  service: FloristDeliveryModuleService,
})
