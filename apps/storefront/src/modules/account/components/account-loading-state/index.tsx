const AccountLoadingState = () => {
  return (
    <section
      className="sg-account-panel sg-account-loading"
      aria-busy="true"
      aria-label="Loading account page"
    >
      <div className="sg-account-loading__header">
        <span className="sg-account-loading__line sg-account-loading__line--title" />
        <span className="sg-account-loading__line sg-account-loading__line--summary" />
      </div>
      <div className="sg-account-loading__body" aria-hidden="true">
        <span className="sg-account-loading__card" />
        <span className="sg-account-loading__card" />
        <span className="sg-account-loading__card" />
      </div>
      <span className="sr-only">Loading your account information</span>
    </section>
  )
}

export default AccountLoadingState
