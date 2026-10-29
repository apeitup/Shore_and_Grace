import { listProducts } from "@lib/data/products"
import { retrieveCustomer } from "@lib/data/customer"
import { listWishlist } from "@lib/data/wishlist"
import WishlistItem from "@modules/wishlist/components/wishlist-item"
import { Search, SortDown } from "iconoir-react"
import { notFound } from "next/navigation"

export default async function WishlistPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const [customer, items] = await Promise.all([
    retrieveCustomer(),
    listWishlist(),
  ])
  if (!customer) notFound()
  const productIds = items.map((item) => item.product_id)
  const products = productIds.length
    ? await listProducts({ countryCode, queryParams: { id: productIds, limit: productIds.length } }).then(({ response }) => response.products)
    : []
  const byId = new Map(products.map((product) => [product.id, product]))
  const ordered = productIds.map((id) => byId.get(id)).filter((product): product is NonNullable<typeof product> => !!product)

  return (
    <section className="sg-account-panel sg-account-wishlist">
      <header className="sg-account-panel__header">
        <div><h1>Your Wishlist</h1><p>{ordered.length} {ordered.length === 1 ? "item" : "items"}</p></div>
        <div className="sg-account-panel__tools"><button type="button"><Search /><span>Search</span></button><button type="button"><SortDown /><span>Sort</span></button></div>
      </header>
      {ordered.length ? <div className="sg-account-wishlist__list">{ordered.map((product) => <WishlistItem key={product.id} product={product} />)}</div> : <div className="sg-account-empty"><h2>Your wishlist is empty</h2><p>Save your favourite flowers and gifts to find them here.</p></div>}
    </section>
  )
}
