import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View your addresses",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <section className="sg-account-panel sg-account-addresses" data-testid="addresses-page-wrapper">
      <header className="sg-account-panel__header">
        <div><h1>Your Addresses</h1><p>{customer.addresses?.length || 0} items</p></div>
      </header>
      <AddressBook customer={customer} region={region} />
    </section>
  )
}
