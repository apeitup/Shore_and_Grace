import { Module } from "@medusajs/framework/utils"
import GiftOrderModuleService from "./service"

export const GIFT_ORDER_MODULE = "giftOrder"

export default Module(GIFT_ORDER_MODULE, {
  service: GiftOrderModuleService,
})
