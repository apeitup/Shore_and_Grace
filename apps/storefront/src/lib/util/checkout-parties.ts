import type { HttpTypes } from "@medusajs/types"

const formString = (formData: Pick<FormData, "get">, key: string) => {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

export const buildCheckoutPartyData = (
  formData: Pick<FormData, "get">
): Pick<
  HttpTypes.StoreUpdateCart,
  "shipping_address" | "billing_address" | "email"
> & {
  additional_data: {
    purchaser_first_name: string
    purchaser_last_name: string
    purchaser_phone: string
  }
} => {
  const shippingAddress = {
    first_name: formString(formData, "shipping_address.first_name"),
    last_name: formString(formData, "shipping_address.last_name"),
    address_1: formString(formData, "shipping_address.address_1"),
    address_2: formString(formData, "shipping_address.address_2"),
    company: formString(formData, "shipping_address.company"),
    postal_code: formString(formData, "shipping_address.postal_code"),
    city: formString(formData, "shipping_address.city"),
    country_code: formString(formData, "shipping_address.country_code"),
    province: formString(formData, "shipping_address.province"),
    phone: formString(formData, "shipping_address.phone"),
  }
  const isForPurchaser = formData.get("same_as_billing") === "on"

  return {
    shipping_address: shippingAddress,
    billing_address: isForPurchaser
      ? shippingAddress
      : {
          first_name: formString(formData, "purchaser_first_name"),
          last_name: formString(formData, "purchaser_last_name"),
          address_1: shippingAddress.address_1,
          address_2: shippingAddress.address_2,
          company: "",
          postal_code: shippingAddress.postal_code,
          city: shippingAddress.city,
          country_code: shippingAddress.country_code,
          province: shippingAddress.province,
          phone: formString(formData, "purchaser_phone"),
        },
    email: formString(formData, "email"),
    additional_data: {
      purchaser_first_name: formString(formData, "purchaser_first_name"),
      purchaser_last_name: formString(formData, "purchaser_last_name"),
      purchaser_phone: formString(formData, "purchaser_phone"),
    },
  }
}

type OrderParties = Pick<
  HttpTypes.StoreOrder,
  "billing_address" | "shipping_address" | "customer"
>

export const getOrderPurchaserFirstName = (order: OrderParties) => {
  const customerName = order.customer?.first_name?.trim()
  const billingName = order.billing_address?.first_name?.trim()

  return customerName || billingName || null
}
