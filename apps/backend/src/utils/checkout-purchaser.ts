import type { CustomerUpdatableFields } from "@medusajs/framework/types"

type CheckoutPurchaserData = Record<string, unknown> | undefined

type CheckoutCustomer = {
  has_account?: boolean | null
}

const trimmedString = (value: unknown) =>
  typeof value === "string" ? value.trim() : ""

export const getGuestPurchaserUpdate = (
  customer: CheckoutCustomer | null | undefined,
  additionalData: CheckoutPurchaserData
): CustomerUpdatableFields | null => {
  if (!customer || customer.has_account || !additionalData) {
    return null
  }

  const firstName = trimmedString(additionalData.purchaser_first_name)
  const lastName = trimmedString(additionalData.purchaser_last_name)
  const phone = trimmedString(additionalData.purchaser_phone)

  if (!firstName && !lastName && !phone) {
    return null
  }

  return {
    ...(firstName ? { first_name: firstName } : {}),
    ...(lastName ? { last_name: lastName } : {}),
    ...(phone ? { phone } : {}),
  }
}
