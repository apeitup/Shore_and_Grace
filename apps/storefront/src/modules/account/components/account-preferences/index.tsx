"use client"

import {
  CustomerPreferences,
  deleteCustomerAccount,
  downloadCustomerData,
  saveCustomerPreferences,
} from "@lib/data/customer-preferences"
import { COOKIE_CONSENT_EVENT } from "@modules/layout/components/cookie-consent"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

type Preference = {
  id: string
  title: string
  description: string
  enabled: boolean
  locked?: boolean
}
type Group = { title: string; description: string; items: Preference[] }

const notifications: Group[] = [
  {
    title: "Order and delivery",
    description: "Essential updates about purchases and deliveries.",
    items: [
      {
        id: "receipts",
        title: "Order confirmations and receipts",
        description:
          "Essential account emails about purchases and payments — always on.",
        enabled: true,
        locked: true,
      },
      {
        id: "delivery",
        title: "Delivery updates",
        description: "Know when an order is prepared, dispatched and delivered.",
        enabled: true,
      },
      {
        id: "reminders",
        title: "Gift and occasion reminders",
        description:
          "Receive reminders for dates and occasions you choose to save.",
        enabled: true,
      },
    ],
  },
  {
    title: "News and inspiration",
    description: "Optional emails from the Shore & Grace studio.",
    items: [
      {
        id: "collections",
        title: "New collections and seasonal flowers",
        description:
          "Be first to see seasonal arrangements and limited releases.",
        enabled: false,
      },
      {
        id: "offers",
        title: "Offers and early access",
        description:
          "Receive occasional offers and early access to selected launches.",
        enabled: true,
      },
      {
        id: "stories",
        title: "Florist stories and flower care",
        description: "Get thoughtful inspiration and practical care advice.",
        enabled: false,
      },
    ],
  },
]

const settings: Group[] = [
  {
    title: "Shopping preferences",
    description: "Make future visits and gifting a little easier.",
    items: [
      {
        id: "recommendations",
        title: "Personalised recommendations",
        description:
          "Use your browsing and purchase history to suggest suitable flowers and gifts.",
        enabled: false,
      },
      {
        id: "delivery-preferences",
        title: "Remember delivery preferences",
        description:
          "Keep your usual delivery instructions ready for future orders.",
        enabled: false,
      },
      {
        id: "recently-viewed",
        title: "Recently viewed flowers",
        description:
          "Keep a short history of products you viewed on this device.",
        enabled: false,
      },
    ],
  },
]

function Switch({
  enabled,
  onChange,
  disabled,
  label,
}: {
  enabled: boolean
  onChange: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={enabled}
      disabled={disabled}
      className="sg-switch"
      onClick={onChange}
    >
      <span />
    </button>
  )
}

export default function AccountPreferences({
  type,
  initialPreferences,
}: {
  type: "notifications" | "settings"
  initialPreferences?: CustomerPreferences
}) {
  const groups = type === "notifications" ? notifications : settings
  const storageKey = `sg-account-${type}`
  const defaults = useMemo(
    () =>
      Object.fromEntries(
        groups.flatMap((group) =>
          group.items.map((item) => [item.id, item.enabled])
        )
      ),
    [groups]
  )
  const [values, setValues] = useState<Record<string, boolean>>(() => ({
    ...defaults,
    ...(type === "settings" && initialPreferences
      ? {
          recommendations: initialPreferences.personalised_recommendations,
          "delivery-preferences":
            initialPreferences.remember_delivery_preferences,
        }
      : {}),
  }))
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const { countryCode = "gb" } = useParams<{ countryCode?: string }>()
  const router = useRouter()

  useEffect(() => {
    let timer: number | undefined
    try {
      if (type === "notifications") {
        const stored = window.localStorage.getItem(storageKey)
        if (stored) {
          timer = window.setTimeout(
            () =>
              setValues((current) => ({ ...current, ...JSON.parse(stored) })),
            0
          )
        }
      } else {
        const recentlyViewed =
          window.localStorage.getItem("sg-recently-viewed-enabled") === "true"
        timer = window.setTimeout(
          () =>
            setValues((current) => ({
              ...current,
              "recently-viewed": recentlyViewed,
            })),
          0
        )
      }
    } catch {}
    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [storageKey, type])

  const toggle = async (id: string) => {
    const previous = values[id]
    const nextValue = !previous
    setMessage(null)
    setValues((current) => ({ ...current, [id]: nextValue }))

    try {
      if (type === "notifications") {
        const next = { ...values, [id]: nextValue }
        window.localStorage.setItem(storageKey, JSON.stringify(next))
        return
      }
      if (id === "recently-viewed") {
        window.localStorage.setItem(
          "sg-recently-viewed-enabled",
          String(nextValue)
        )
        if (!nextValue) {
          window.localStorage.removeItem("sg-recently-viewed-products")
        }
        setMessage({
          type: "success",
          text: nextValue
            ? "Recently viewed products are now saved on this device."
            : "Recently viewed products have been cleared from this device.",
        })
        return
      }

      setBusy(id)
      await saveCustomerPreferences(
        id === "recommendations"
          ? { personalised_recommendations: nextValue }
          : { remember_delivery_preferences: nextValue }
      )
      setMessage({ type: "success", text: "Your preference has been saved." })
    } catch (error) {
      setValues((current) => ({ ...current, [id]: previous }))
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't save that preference. Please try again.",
      })
    } finally {
      setBusy(null)
    }
  }

  const downloadData = async () => {
    setBusy("download")
    setMessage(null)
    try {
      const data = await downloadCustomerData()
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        })
      )
      const link = document.createElement("a")
      link.href = url
      link.download = `shore-and-grace-account-${new Date()
        .toISOString()
        .slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setMessage({ type: "success", text: "Your account data was downloaded." })
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't prepare your account data.",
      })
    } finally {
      setBusy(null)
    }
  }

  const confirmDelete = async () => {
    if (deleteConfirmation !== "DELETE") return
    setBusy("delete")
    setMessage(null)
    try {
      await deleteCustomerAccount()
      router.push(`/${countryCode}?account-deleted=true`)
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't delete your account. Please try again.",
      })
      setBusy(null)
      setDeleteOpen(false)
    }
  }

  return (
    <section className="sg-account-panel sg-account-preferences">
      <header className="sg-account-panel__header">
        <div>
          <h1>{type === "notifications" ? "Notifications" : "Settings"}</h1>
          <p>
            {type === "notifications"
              ? "Choose which updates you receive and how."
              : "Manage shopping preferences, privacy and account controls."}
          </p>
        </div>
      </header>
      {groups.map((group) => (
        <div className="sg-preference-group" key={group.title}>
          <h2>{group.title}</h2>
          <p>{group.description}</p>
          <div className="sg-preference-list">
            {group.items.map((item) => (
              <div className="sg-preference-row" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>
                <Switch
                  enabled={values[item.id]}
                  onChange={() => toggle(item.id)}
                  disabled={item.locked || busy === item.id}
                  label={item.title}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      {message && (
        <p
          className={`sg-form-message sg-form-message--${message.type}`}
          role="status"
        >
          {message.text}
        </p>
      )}
      {type === "notifications" ? (
        <p className="sg-account-preferences__note">
          You can unsubscribe from marketing emails at any time. Essential order
          messages will still be sent.
        </p>
      ) : (
        <>
          <div className="sg-preference-group">
            <h2>Privacy and data</h2>
            <p>Review how your information is used and request a copy.</p>
            <div className="sg-preference-list">
              <div className="sg-preference-row">
                <div>
                  <strong>Cookie preferences</strong>
                  <span>Choose which optional cookies Shore &amp; Grace may use.</span>
                </div>
                <button
                  type="button"
                  className="sg-secondary-button"
                  onClick={() =>
                    window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))
                  }
                >
                  Manage
                </button>
              </div>
              <div className="sg-preference-row">
                <div>
                  <strong>Download account data</strong>
                  <span>Request a copy of your account and order information.</span>
                </div>
                <button
                  type="button"
                  className="sg-secondary-button"
                  disabled={busy === "download"}
                  onClick={downloadData}
                >
                  {busy === "download" ? "Preparing…" : "Download"}
                </button>
              </div>
            </div>
          </div>
          <div className="sg-preference-group">
            <h2>Account closure</h2>
            <p>Closing your Shore and Grace account.</p>
            <div className="sg-preference-row sg-preference-row--danger">
              <div>
                <strong>Delete account</strong>
                <span>
                  Permanently remove your account details and saved preferences.
                  Order records required by law will be retained.
                </span>
              </div>
              <button
                type="button"
                className="sg-danger-button"
                onClick={() => setDeleteOpen(true)}
              >
                Delete account
              </button>
            </div>
          </div>
        </>
      )}

      {deleteOpen && (
        <div className="sg-account-confirm-mask" role="presentation">
          <section
            className="sg-account-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
          >
            <h2 id="delete-account-title">Delete your account?</h2>
            <p>
              This removes your profile, addresses, wishlist, memorable dates and
              preferences. Order records that must be retained will remain.
            </p>
            <label>
              <span>Type DELETE to confirm</span>
              <input
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                autoComplete="off"
              />
            </label>
            <div>
              <button
                type="button"
                className="sg-secondary-button"
                onClick={() => setDeleteOpen(false)}
                disabled={busy === "delete"}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sg-danger-button"
                onClick={confirmDelete}
                disabled={deleteConfirmation !== "DELETE" || busy === "delete"}
              >
                {busy === "delete" ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
