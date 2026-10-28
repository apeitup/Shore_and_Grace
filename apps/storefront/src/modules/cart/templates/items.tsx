import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@modules/common/components/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  const currencyCode = cart?.currency_code ?? "gbp"
  const sortedItems = items
    ? [...items].sort((a, b) => {
        return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
      })
    : undefined

  return (
    <>
      <Heading className="sr-only">Cart</Heading>

      <div className="sg-cart-mobile-list">
        {sortedItems?.map((item) => (
          <Item
            key={item.id}
            item={item}
            type="mobile"
            currencyCode={currencyCode}
          />
        ))}
      </div>

      <div className="sg-cart-table">
        <Table>
          <Table.Header className="border-t-0">
            <Table.Row className="text-ui-fg-subtle txt-medium-plus">
              <Table.HeaderCell>Image</Table.HeaderCell>
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.HeaderCell>Price</Table.HeaderCell>
              <Table.HeaderCell>Quantity</Table.HeaderCell>
              <Table.HeaderCell>Total</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Remove</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedItems
              ? sortedItems.map((item) => (
                  <Item
                    key={item.id}
                    item={item}
                    currencyCode={currencyCode}
                  />
                ))
              : repeat(5).map((i) => <SkeletonLineItem key={i} />)}
          </Table.Body>
        </Table>
      </div>
    </>
  )
}

export default ItemsTemplate
