export const footerGroups = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/store" },
      { label: "Fresh Flowers", href: "/categories/fresh-flowers" },
      { label: "Faux Flowers", href: "/categories/faux-flowers" },
      { label: "Gifts", href: "/categories/gifts" },
      {
        label: "Sympathy & Remembrance",
        href: "/categories/sympathy-remembrance",
      },
      {
        label: "Shop by Occasion",
        href: "/categories/shop-by-occasion",
      },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      {
        label: "Funeral Flower Service",
        href: "/services#funeral-flowers",
      },
      {
        label: "Fresh Flower Service",
        href: "/services#fresh-flowers",
      },
      {
        label: "Faux Flower Service",
        href: "/services#faux-flowers",
      },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "My account", href: "/account" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "FAQ", href: "/faq" },
      { label: "Track an Order", href: "/account/orders" },
      { label: "Delivery Information", href: "/shipping" },
      { label: "Returns & Refunds", href: "/returns" },
    ],
  },
] as const
