import AccountPreferences from "@modules/account/components/account-preferences"
import { retrieveCustomerPreferences } from "@lib/data/customer-preferences"

export default async function SettingsPage() {
  const preferences = await retrieveCustomerPreferences()
  return (
    <AccountPreferences type="settings" initialPreferences={preferences} />
  )
}
