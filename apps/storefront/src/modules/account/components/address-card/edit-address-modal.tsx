"use client"

import { deleteCustomerAddress, updateCustomerAddress } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import MobileCheckbox from "@modules/common/components/mobile-checkbox"
import Modal from "@modules/common/components/modal"
import { Button, Heading } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import { Check, Trash } from "iconoir-react"
import { useActionState, useEffect, useState } from "react"

import AddressFormFields from "./address-form-fields"
import useMobileViewport from "./use-mobile-viewport"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  editorActive: boolean
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

const EditAddress = ({
  region,
  address,
  editorActive,
  isOpen,
  onClose,
  onOpen,
}: EditAddressProps) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const [setAsDefault, setSetAsDefault] = useState(
    Boolean(address.is_default_billing || address.is_default_shipping)
  )
  const isMobile = useMobileViewport()
  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = () => {
    setSuccessState(false)
    setSetAsDefault(Boolean(address.is_default_billing || address.is_default_shipping))
    onClose()
  }

  useEffect(() => {
    if (successState) close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) setSuccessState(true)
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  const addressTitle = address.is_default_billing
    ? "Billing address"
    : address.is_default_shipping
      ? "Delivery address"
      : address.company
        ? `${address.company} address`
        : "Saved address"
  const isDefaultAddress = address.is_default_billing || address.is_default_shipping
  const countryName = region.countries?.find(
    (country) => country.iso_2 === address.country_code?.toLowerCase()
  )?.display_name || address.country_code?.toUpperCase()
  const addressLine = [address.address_1, address.address_2, address.city, address.province, address.postal_code]
    .filter(Boolean)
    .join(", ")

  const form = (
    <form action={formAction} className="sg-address-form">
      <input type="hidden" name="addressId" value={address.id} />
      <AddressFormFields region={region} address={address} />
      {isMobile ? (
        <MobileCheckbox
          checked={setAsDefault}
          label="Set as default"
          name="set_as_default"
          onChange={(event) => setSetAsDefault(event.target.checked)}
        />
      ) : (
        <label className="sg-address-form__default">
          <input type="checkbox" name="set_as_default" defaultChecked={Boolean(isDefaultAddress)} />
          <span aria-hidden="true" />
          Set as default
        </label>
      )}
      {formState.error && <div className="text-rose-500 text-small-regular py-2">{formState.error}</div>}
      <div className="sg-address-form__actions">
        <Button type="reset" variant="transparent" onClick={close} data-testid="cancel-button">Cancel</Button>
        <SubmitButton data-testid="save-button">Save</SubmitButton>
      </div>
    </form>
  )

  if (isOpen && !isMobile) {
    return (
      <section className="sg-address-form-card" data-testid="edit-address-inline-form">
        <h2>Edit: {addressTitle}</h2>
        {form}
      </section>
    )
  }

  return (
    <>
      <article className="sg-address-card" data-testid="address-container">
        <header className="sg-address-card__header sg-address-card__desktop-header">
          <div>
            <h3>{addressTitle}</h3>
            <label className="sg-address-card__default-control">
              <input type="checkbox" checked={Boolean(isDefaultAddress)} readOnly />
              <span aria-hidden="true">{isDefaultAddress && <Check />}</span>
              Set as default
            </label>
          </div>
          <div className="sg-address-card__header-actions">
            <button
              type="button"
              disabled={editorActive}
              onClick={onOpen}
              data-testid="address-edit-button"
            >
              Edit
            </button>
            <button type="button" aria-label={`Remove ${addressTitle}`} onClick={removeAddress} data-testid="address-delete-button">
              {removing ? <Spinner /> : <Trash />}
            </button>
          </div>
        </header>
        <header className="sg-address-card__mobile-header">
          <h3>{addressTitle}</h3>
          <button type="button" disabled={editorActive} onClick={onOpen}>Edit</button>
        </header>
        {isDefaultAddress && (
          <p className="sg-address-card__mobile-default"><Check />Default address</p>
        )}
        <div className="sg-address-card__divider" />
        <p className="sg-address-card__name">{address.first_name} {address.last_name}</p>
        {address.phone && <p className="sg-address-card__contact">{address.phone}</p>}
        <p className="sg-address-card__address">{addressLine}{countryName && <> · {countryName}</>}</p>
      </article>

      {isMobile && (
        <Modal isOpen={isOpen} close={close} mobileSheet data-testid="edit-address-modal">
          <Modal.Title><Heading className="mb-2">Edit address</Heading></Modal.Title>
          <Modal.Body>{form}</Modal.Body>
        </Modal>
      )}
    </>
  )
}

export default EditAddress
