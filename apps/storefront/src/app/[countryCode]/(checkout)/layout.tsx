import ShopPageHero from "@modules/brand/components/shop-page-hero"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="sg-checkout-page">
      <Nav />
      <ShopPageHero
        title="Checkout"
        trail={[
          { label: "Shop", href: "/store" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />
      <main className="relative" data-testid="checkout-container">
        {children}
      </main>
      <Footer />
    </div>
  )
}
