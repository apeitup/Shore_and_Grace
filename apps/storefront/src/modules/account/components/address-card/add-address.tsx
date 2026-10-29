"use client"

import { addCustomerAddress } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import MobileCheckbox from "@modules/common/components/mobile-checkbox"
import Modal from "@modules/common/components/modal"
import { Button, Heading } from "@modules/common/components/ui"
import { useActionState, useEffect, useState } from "react"

import AddressFormFields from "./address-form-fields"
import useMobileViewport from "./use-mobile-viewport"

type AddAddressProps = {
  region: HttpTypes.StoreRegion
  count: number
  editorActive: boolean
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

const AddAddress = ({
  region,
  count,
  editorActive,
  isOpen,
  onClose,
  onOpen,
}: AddAddressProps) => {
  const [successState, setSuccessState] = useState(false)
  const [setAsDefaultBilling, setSetAsDefaultBilling] = useState(false)
  const [setAsDefaultShipping, setSetAsDefaultShipping] = useState(false)
  const isMobile = useMobileViewport()
  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = () => {
    setSuccessState(false)
    setSetAsDefaultBilling(false)
    setSetAsDefaultShipping(false)
    onClose()
  }

  useEffect(() => {
    if (successState) close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) setSuccessState(true)
  }, [formState])

  const form = (
    <form action={formAction} className="sg-address-form">
      <AddressFormFields region={region} />
      <div className="sg-address-form__defaults">
        <MobileCheckbox
          checked={setAsDefaultBilling}
          label="Use as default billing address"
          name="set_as_default_billing"
          onChange={(event) => setSetAsDefaultBilling(event.target.checked)}
        />
        <MobileCheckbox
          checked={setAsDefaultShipping}
          label="Use as default delivery address"
          name="set_as_default_shipping"
          onChange={(event) => setSetAsDefaultShipping(event.target.checked)}
        />
      </div>
      {formState.error && (
        <div className="text-rose-500 text-small-regular py-2" data-testid="address-error">
          {formState.error}
        </div>
      )}
      <div className="sg-address-form__actions">
        <Button type="reset" variant="transparent" onClick={close} data-testid="cancel-button">
          Cancel
        </Button>
        <SubmitButton data-testid="save-button">Save</SubmitButton>
      </div>
    </form>
  )

  return (
    <>
      <header className="sg-account-panel__header sg-address-book__header">
        <div>
          <h1>Your addresses</h1>
          <p>{count} {count === 1 ? "address" : "addresses"}</p>
        </div>
        <Button
          type="button"
          className="sg-address-book__desktop-add"
          disabled={editorActive}
          onClick={onOpen}
        >
          Add
        </Button>
      </header>

      <Button
        type="button"
        variant="secondary"
        size="large"
        className="sg-address-card sg-address-card--add"
        disabled={editorActive}
        onClick={onOpen}
        data-testid="add-address-button"
      >
        Add new address
      </Button>

      {isOpen && !isMobile && (
        <section className="sg-address-form-card" data-testid="add-address-inline-form">
          <h2>Add new address</h2>
          {form}
        </section>
      )}

      {isMobile && (
        <Modal isOpen={isOpen} close={close} mobileSheet data-testid="add-address-modal">
          <Modal.Title><Heading className="mb-2">Add address</Heading></Modal.Title>
          <Modal.Body>{form}</Modal.Body>
        </Modal>
      )}
    </>
  )
}

export default AddAddress
