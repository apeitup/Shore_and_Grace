import AccountOccasions from "@modules/account/components/account-occasions"
import { listOccasions } from "@lib/data/occasions"

export default async function OccasionsPage() {
  const occasions = await listOccasions().catch(() => ({
    system_occasions: [],
    customer_occasions: [],
  }))
  return <AccountOccasions initialData={occasions} />
}
