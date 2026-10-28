import { getGuestPurchaserUpdate } from "../checkout-purchaser"

describe("getGuestPurchaserUpdate", () => {
  it("maps purchaser details onto a guest customer", () => {
    expect(
      getGuestPurchaserUpdate(
        { has_account: false },
        {
          purchaser_first_name: " Troy ",
          purchaser_last_name: " Halliday ",
          purchaser_phone: " 07000000001 ",
        }
      )
    ).toEqual({
      first_name: "Troy",
      last_name: "Halliday",
      phone: "07000000001",
    })
  })

  it("does not overwrite a registered customer's account identity", () => {
    expect(
      getGuestPurchaserUpdate(
        { has_account: true },
        {
          purchaser_first_name: "Different",
          purchaser_last_name: "Name",
        }
      )
    ).toBeNull()
  })

  it("ignores recipient-only cart updates", () => {
    expect(
      getGuestPurchaserUpdate(
        { has_account: false },
        {
          recipient_first_name: "Amanda",
        }
      )
    ).toBeNull()
  })
})
