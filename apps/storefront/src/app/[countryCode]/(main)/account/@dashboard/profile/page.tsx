import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import AccountDetailsForm from "@modules/account/components/account-details-form"

export const metadata: Metadata = {
  title: "Account details",
  description: "Manage your personal information.",
}

export default async function Profile() {
  const customer = await retrieveCustomer()
  if (!customer) notFound()

  return <AccountDetailsForm customer={customer} />
}
