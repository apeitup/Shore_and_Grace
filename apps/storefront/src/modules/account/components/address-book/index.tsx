"use client"

import React, { useState } from "react"

import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"
import { HttpTypes } from "@medusajs/types"

type AddressBookProps = {
  customer: HttpTypes.StoreCustomer
  region: HttpTypes.StoreRegion
  startAdding?: boolean
}

const AddressBook: React.FC<AddressBookProps> = ({
  customer,
  region,
  startAdding = false,
}) => {
  const { addresses } = customer
  const [activeEditor, setActiveEditor] = useState<string | null>(
    startAdding ? "add" : null
  )

  return (
    <div className="sg-address-book">
      <AddAddress
        region={region}
        count={addresses.length}
        isOpen={activeEditor === "add"}
        editorActive={activeEditor !== null}
        onOpen={() => setActiveEditor("add")}
        onClose={() => setActiveEditor(null)}
      />
      <div className="sg-address-book__grid">
        {addresses.map((address) => {
          return (
            <EditAddress
              region={region}
              address={address}
              key={address.id}
              isOpen={activeEditor === address.id}
              editorActive={activeEditor !== null}
              onOpen={() => setActiveEditor(address.id)}
              onClose={() => setActiveEditor(null)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default AddressBook
