import Image from "next/image"

export default function SocialAuthButtons() {
  return (
    <div className="sg-auth-social" aria-label="Social sign in options">
      <button
        className="sg-auth-social__button"
        type="button"
        disabled
        title="Google sign in is not configured yet"
      >
        <Image src="/assets/account/google.svg" alt="" width={24} height={24} />
        Continue with Google
      </button>
      <button
        className="sg-auth-social__button"
        type="button"
        disabled
        title="Apple sign in is not configured yet"
      >
        <Image src="/assets/account/apple.svg" alt="" width={24} height={24} />
        Continue with Apple
      </button>
    </div>
  )
}
