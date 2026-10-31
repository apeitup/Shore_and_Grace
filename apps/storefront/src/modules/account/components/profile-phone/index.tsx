"use client"

import React, { useActionState } from "react"

import Input from "@modules/common/components/input"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const updateCustomerPhone = async (
    _currentState: Record<string, unknown>,
    formData: FormData
  ) => {
    const customer = {
      phone: formData.get("phone") as string,
    }

    try {
      await updateCustomer(customer)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const saveCustomerPhone = async (
    currentState: { error: string | null; success: boolean },
    formData: FormData
  ) => {
    const result = await updateCustomerPhone(currentState, formData)
    setSuccessState(result.success)
    return result
  }

  const [state, formAction] = useActionState(saveCustomerPhone, {
    error: null as string | null,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="Phone"
        currentInfo={`${customer.phone}`}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error || undefined}
        clearState={clearState}
        data-testid="account-phone-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label="Phone"
            name="phone"
            type="phone"
            autoComplete="phone"
            required
            defaultValue={customer.phone ?? ""}
            data-testid="phone-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileEmail
