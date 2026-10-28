"use client"

import ShopPageHero from "@modules/brand/components/shop-page-hero"
import { useState } from "react"

import Login from "../components/login"
import Register from "../components/register"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN)
  const isSignIn = currentView === LOGIN_VIEW.SIGN_IN

  return (
    <main className="sg-account-auth">
      <ShopPageHero
        title="My Account"
        trail={[
          { label: "Account", href: "/account" },
          { label: isSignIn ? "Sign in" : "Sign up" },
        ]}
      />
      <div className="sg-account-auth__content">
        {isSignIn ? (
          <Login setCurrentView={setCurrentView} />
        ) : (
          <Register setCurrentView={setCurrentView} />
        )}
      </div>
    </main>
  )
}

export default LoginTemplate
