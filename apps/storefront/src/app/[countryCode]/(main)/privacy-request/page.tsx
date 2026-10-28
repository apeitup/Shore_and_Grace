import { Metadata } from "next"

import { retrieveCustomer } from "@lib/data/customer"
import { STORE_NAME } from "@lib/util/site"
import PrivacyRequestForm from "@modules/privacy-request/components/privacy-request-form"
import { PolicyPage } from "@modules/policies/templates"

export const metadata: Metadata = {
  title: "Privacy request",
  description: `Ask ${STORE_NAME} to exercise your data protection rights.`,
}

export default async function PrivacyRequestPage() {
  const customer = await retrieveCustomer().catch(() => null)
  const customerName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ")

  return (
    <PolicyPage title="Make a privacy request" eyebrow="YOUR RIGHTS">
      <p>
        Use this form if you are a customer, gift recipient or visitor and want
        to exercise a data protection right. We normally respond within one
        calendar month. Complex requests may take longer where the law permits;
        if so, we will explain why.
      </p>
      <p>
        Please give only the information we need to find the relevant records.
        Do not include payment-card details, passwords or sensitive information
        in the request.
      </p>
      <PrivacyRequestForm
        initialValues={
          customer
            ? {
                name: customerName,
                email: customer.email,
                phone: customer.phone ?? "",
              }
            : undefined
        }
      />
    </PolicyPage>
  )
}
