type BrandMarkProps = {
  className?: string
}

export const BrandMark = ({ className }: BrandMarkProps) => (
  <svg
    className={className}
    viewBox="0 0 88 58"
    fill="none"
    aria-hidden="true"
  >
    <g stroke="currentColor" strokeWidth="1.2" opacity="0.55">
      <path d="M4 55C18 33 35 19 55 14c10-3 20-3 29-2" />
      <path d="M19 38c9-5 18-6 28-9" />
      <path d="M28 25c10 1 18-5 28-2 4 1 7 3 10 4" />
      <path d="M38 21c5-7 14-11 23-18" />
      <path d="M25 33c2-9 1-17 9-27" />
      <path d="M25 34c7-7 15-7 23-5-8 6-15 8-23 5Z" />
      <path d="M38 22c8-4 17-3 25 4-9 2-18 1-25-4Z" />
      <path d="M60 14c8-5 17-5 25-1-8 5-17 5-25 1Z" />
      <path d="M34 7c-2 8-4 14-9 18-2-7 1-14 9-18Z" />
    </g>
  </svg>
)
