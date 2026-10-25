import Image from "next/image"

type BrandSignatureProps = {
  context?: "header" | "footer"
  mobile?: boolean
  tone?: "light" | "dark"
}

export default function BrandSignature({
  context = "header",
  mobile = false,
  tone = "light",
}: BrandSignatureProps) {
  const isFooter = context === "footer"
  const mark = isFooter
    ? mobile
      ? "/assets/brand/footer-botanical-mobile.svg"
      : "/assets/brand/footer-botanical.svg"
    : mobile
      ? "/assets/brand/header-botanical-mobile.svg"
      : "/assets/brand/header-botanical.svg"

  return (
    <span
      className={`sg-signature sg-signature--${context} sg-signature--${tone}`}
      data-mobile={mobile || undefined}
    >
      <Image
        className="sg-signature__mark"
        src={mark}
        alt=""
        width={isFooter ? 124 : 78}
        height={isFooter ? 110 : 50}
        aria-hidden="true"
      />
      <span className="sg-signature__copy">
        <span className="sg-signature__name">Shore &amp; Grace</span>
        {isFooter && (
          <span className="sg-signature__descriptor">
            Floral &amp; Gift Studio
          </span>
        )}
      </span>
    </span>
  )
}
