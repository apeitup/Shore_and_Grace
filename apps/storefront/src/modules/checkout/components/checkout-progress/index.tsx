"use client"

import { useSearchParams } from "next/navigation"

const steps = [
  { key: "address", label: "Details" },
  { key: "delivery", label: "Delivery" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
]

const CheckoutProgress = () => {
  const searchParams = useSearchParams()
  const currentStep = searchParams.get("step") || "address"
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === currentStep)
  )

  return (
    <div className="sg-checkout-progress" aria-label="Checkout progress">
      <p>
        Step {activeIndex + 1} of {steps.length} · {steps[activeIndex].label}
      </p>
      <ol>
        {steps.map((step, index) => (
          <li
            key={step.key}
            className={index < activeIndex ? "is-complete" : index === activeIndex ? "is-active" : ""}
            aria-current={index === activeIndex ? "step" : undefined}
          >
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default CheckoutProgress
