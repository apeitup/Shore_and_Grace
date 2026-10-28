type SaleBannerProps = {
  variant?: "card" | "gallery"
}

const SaleBanner = ({ variant = "card" }: SaleBannerProps) => {
  return (
    <span
      className={`sg-sale-banner sg-sale-banner--${variant}`}
      aria-label="Sale"
    >
      <span aria-hidden="true">Sale!</span>
    </span>
  )
}

export default SaleBanner
