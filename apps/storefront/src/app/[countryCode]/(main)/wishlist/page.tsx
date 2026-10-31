import { retrieveCustomer } from "@lib/data/customer"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Wishlist",
  description: "View products saved to your wishlist.",
}

export default async function WishlistPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  await props.params
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    redirect("/account")
  }

  redirect("/account/wishlist")
}
