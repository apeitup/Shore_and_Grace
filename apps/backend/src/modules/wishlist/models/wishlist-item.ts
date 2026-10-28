import { model } from "@medusajs/framework/utils"

const WishlistItem = model.define("wishlist_item", {
  id: model.id().primaryKey(),
  customer_id: model.text().index("IDX_WISHLIST_ITEM_CUSTOMER_ID"),
  product_id: model.text().index("IDX_WISHLIST_ITEM_PRODUCT_ID"),
}).indexes([
  {
    name: "IDX_WISHLIST_ITEM_CUSTOMER_PRODUCT_UNIQUE",
    on: ["customer_id", "product_id"],
    unique: true,
    where: { deleted_at: null },
  },
])

export default WishlistItem
