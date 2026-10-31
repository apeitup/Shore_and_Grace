import { Module } from "@medusajs/framework/utils"
import MerchandisingModuleService from "./service"

export const MERCHANDISING_MODULE = "merchandising"

export default Module(MERCHANDISING_MODULE, {
  service: MerchandisingModuleService,
})
