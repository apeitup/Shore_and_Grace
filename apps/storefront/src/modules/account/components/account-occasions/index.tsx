"use client"

import {
  CustomerOccasion,
  OccasionsResponse,
  SystemOccasion,
  deleteCustomerOccasion,
  saveCustomerOccasion,
  saveSystemOccasionPreference,
} from "@lib/data/occasions"
import { EditPencil, Plus, Trash } from "iconoir-react"
import { FormEvent, useState, useTransition } from "react"

type FormValues = {
  id?: string
  name: string
  occasion_date: string
  reminder_days: number
  enabled: boolean
  repeats_annually: boolean
}

const emptyForm: FormValues = {
  name: "",
  occasion_date: "",
  reminder_days: 14,
  enabled: true,
  repeats_annually: true,
}

const formatDate = (date?: string | null) => {
  if (!date) return "Choose a date"
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00Z`))
}

export default function AccountOccasions({
  initialData,
}: {
  initialData: OccasionsResponse
}) {
  const [systemItems, setSystemItems] = useState(initialData.system_occasions)
  const [personalItems, setPersonalItems] = useState(
    initialData.customer_occasions
  )
  const [form, setForm] = useState<FormValues | null>(null)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form) return
    setError("")
    startTransition(async () => {
      try {
        const saved = await saveCustomerOccasion(form)
        setPersonalItems((items) => {
          const exists = items.some((item) => item.id === saved.id)
          return exists
            ? items.map((item) => (item.id === saved.id ? saved : item))
            : [saved, ...items]
        })
        setForm(null)
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to save this memorable date."
        )
      }
    })
  }

  const remove = (item: CustomerOccasion) => {
    setError("")
    startTransition(async () => {
      try {
        await deleteCustomerOccasion(item.id)
        setPersonalItems((items) =>
          items.filter((current) => current.id !== item.id)
        )
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to delete this memorable date."
        )
      }
    })
  }

  const toggleSystem = (item: SystemOccasion) => {
    const enabled = !item.enabled
    setSystemItems((items) =>
      items.map((current) =>
        current.id === item.id ? { ...current, enabled } : current
      )
    )
    startTransition(async () => {
      try {
        await saveSystemOccasionPreference({
          system_occasion_id: item.id,
          enabled,
          reminder_days: item.reminder_days,
        })
      } catch (caught) {
        setSystemItems((items) =>
          items.map((current) =>
            current.id === item.id
              ? { ...current, enabled: item.enabled }
              : current
          )
        )
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to update this reminder."
        )
      }
    })
  }

  return (
    <section className="sg-account-panel sg-occasions">
      <header className="sg-account-panel__header">
        <div>
          <h1>Dates & occasions</h1>
          <p>Save meaningful dates and choose when you would like a reminder.</p>
        </div>
        <button
          type="button"
          className="sg-brand-button"
          onClick={() => setForm(emptyForm)}
        >
          <Plus /> Add a date
        </button>
      </header>

      {form && (
        <form className="sg-occasion-form" onSubmit={submit}>
          <div className="sg-account-form-grid">
            <label>
              Occasion name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                autoComplete="off"
              />
            </label>
            <label>
              Date
              <input
                required
                type="date"
                value={form.occasion_date}
                onChange={(event) =>
                  setForm({ ...form, occasion_date: event.target.value })
                }
              />
            </label>
            <label>
              Remind me
              <select
                value={form.reminder_days}
                onChange={(event) =>
                  setForm({ ...form, reminder_days: Number(event.target.value) })
                }
              >
                {[0, 3, 7, 14, 21, 30].map((days) => (
                  <option key={days} value={days}>
                    {days === 0 ? "On the day" : `${days} days before`}
                  </option>
                ))}
              </select>
            </label>
            <label className="sg-occasion-form__check">
              <input
                type="checkbox"
                checked={form.repeats_annually}
                onChange={(event) =>
                  setForm({ ...form, repeats_annually: event.target.checked })
                }
              />
              Repeat annually
            </label>
          </div>
          <div className="sg-occasion-form__actions">
            <button
              type="button"
              className="sg-secondary-button"
              onClick={() => setForm(null)}
            >
              Cancel
            </button>
            <button className="sg-brand-button" disabled={isPending}>
              {isPending ? "Saving…" : "Save date"}
            </button>
          </div>
        </form>
      )}

      {error && <p className="sg-form-message sg-form-message--error">{error}</p>}

      <div className="sg-occasions__intro">
        <h2>Your saved dates</h2>
        <p>
          We will only send reminders when occasion reminders are enabled in
          Notifications.
        </p>
      </div>
      <div className="sg-preference-list">
        {personalItems.map((item) => (
          <div className="sg-preference-row" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>
                {formatDate(item.occasion_date)} · Reminder {item.reminder_days}
                {" days before"}
                {item.repeats_annually ? " · Repeats annually" : ""}
              </span>
            </div>
            <div className="sg-occasion-actions">
              <button
                type="button"
                onClick={() =>
                  setForm({
                    id: item.id,
                    name: item.name,
                    occasion_date: item.occasion_date ?? "",
                    reminder_days: item.reminder_days,
                    enabled: item.enabled,
                    repeats_annually: item.repeats_annually,
                  })
                }
              >
                <EditPencil /> <span>Edit</span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${item.name}`}
                onClick={() => remove(item)}
                disabled={isPending}
              >
                <Trash />
              </button>
            </div>
          </div>
        ))}
        {systemItems.map((item) => (
          <div className="sg-preference-row" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>
                {formatDate(item.next_date)} · Reminder {item.reminder_days} days
                before · Repeats annually
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={item.enabled}
              className="sg-switch"
              onClick={() => toggleSystem(item)}
              disabled={isPending}
            >
              <span />
            </button>
          </div>
        ))}
      </div>
      <div className="sg-occasions__note">
        <strong>A gentle reminder, never an obligation</strong>
        <span>
          Dates stay private to your account. Reminders can be paused at any
          time from Notifications.
        </span>
      </div>
    </section>
  )
}
