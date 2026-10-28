import { Module } from "@medusajs/framework/utils"
import SpecialOccasionModuleService from "./service"

export const SPECIAL_OCCASION_MODULE = "specialOccasion"

export default Module(SPECIAL_OCCASION_MODULE, {
  service: SpecialOccasionModuleService,
})
