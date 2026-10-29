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
  searchParams: Promise<{ add?: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const [searchParams, customer, region] = await Promise.all([
    props.searchParams,
    retrieveCustomer(),
    getRegion(countryCode),
  ])

  if (!customer || !region) {
    notFound()
  }

  return (
    <section className="sg-account-panel sg-account-addresses" data-testid="addresses-page-wrapper">
      <AddressBook
        customer={customer}
        region={region}
        startAdding={searchParams.add === "1"}
      />
    </section>
  )
}
