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
  const markWidth = isFooter ? (mobile ? 124 : 122.269) : mobile ? 87 : 78
  const markHeight = isFooter ? (mobile ? 109 : 109.702) : mobile ? 56 : 50
  const mark = isFooter
    ? mobile
      ? "/assets/brand/footer-botanical-mobile.svg"
      : "/assets/brand/footer-botanical.svg"
    : mobile
      ? "/assets/brand/header-botanical-mobile.svg"
      : "/assets/brand/header-botanical.svg"
  const darkMark = mobile
    ? "/assets/brand/header-botanical-mobile-dark.svg"
    : "/assets/brand/header-botanical-dark.svg"

  return (
    <span
      className={`sg-signature sg-signature--${context} sg-signature--${tone}`}
      data-mobile={mobile || undefined}
    >
      <Image
        className="sg-signature__mark sg-theme-asset sg-theme-asset--light"
        src={mark}
        alt=""
        width={markWidth}
        height={markHeight}
        aria-hidden="true"
      />
      {!isFooter && (
        <Image
          className="sg-signature__mark sg-theme-asset sg-theme-asset--dark"
          src={darkMark}
          alt=""
          width={mobile ? 87 : 78}
          height={mobile ? 56 : 50}
          aria-hidden="true"
        />
      )}
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
