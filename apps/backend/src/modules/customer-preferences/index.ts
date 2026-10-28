import { Module } from "@medusajs/framework/utils"
import CustomerPreferencesModuleService from "./service"

export const CUSTOMER_PREFERENCES_MODULE = "customerPreferences"

export default Module(CUSTOMER_PREFERENCES_MODULE, {
  service: CustomerPreferencesModuleService,
})
