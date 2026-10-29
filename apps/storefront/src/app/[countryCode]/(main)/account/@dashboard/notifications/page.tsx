import AccountPreferences from "@modules/account/components/account-preferences"
import { retrieveCustomerPreferences } from "@lib/data/customer-preferences"

export default async function NotificationsPage() {
  const preferences = await retrieveCustomerPreferences()
  return (
    <AccountPreferences
      type="notifications"
      initialPreferences={preferences}
    />
  )
}
