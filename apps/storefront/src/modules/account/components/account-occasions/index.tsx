"use client"

import {
  CustomerOccasion,
  OccasionsResponse,
  SystemOccasion,
  deleteCustomerOccasion,
  saveCustomerOccasion,
  saveSystemOccasionPreference,
} from "@lib/data/occasions"
import NativeSelect from "@modules/common/components/native-select"
import MobileCheckbox from "@modules/common/components/mobile-checkbox"
import { EditPencil, Plus, Trash, Xmark } from "iconoir-react"
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react"

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

const mobileQuery = "(max-width: 767px)"

const subscribeToMobileViewport = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(mobileQuery)
  mediaQuery.addEventListener("change", onChange)

  return () => mediaQuery.removeEventListener("change", onChange)
}

const getMobileViewport = () => window.matchMedia(mobileQuery).matches
const getServerMobileViewport = () => false
const drawerAnimationDuration = 220

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
  const [isEditorClosing, setIsEditorClosing] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFormOpen = Boolean(form)
  const isMobile = useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewport,
    getServerMobileViewport
  )

  const openEditor = (values: FormValues) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setIsEditorClosing(false)
    setForm(values)
  }

  const closeEditor = useCallback(() => {
    if (!isFormOpen || isEditorClosing || closeTimer.current) {
      return
    }

    if (!isMobile) {
      setForm(null)
      return
    }

    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : drawerAnimationDuration

    setIsEditorClosing(true)
    closeTimer.current = setTimeout(() => {
      setForm(null)
      setIsEditorClosing(false)
      closeTimer.current = null
    }, duration)
  }, [isEditorClosing, isFormOpen, isMobile])

  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isFormOpen || !isMobile) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeEditor()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [closeEditor, isFormOpen, isMobile])

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
        closeEditor()
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
          onClick={() => openEditor(emptyForm)}
        >
          <Plus />
          <span className="sg-occasion-add__desktop">Add a date</span>
          <span className="sg-occasion-add__mobile">Add a memorable date</span>
        </button>
      </header>

      {form && (
        <div
          className={`sg-occasion-editor is-open${
            isEditorClosing ? " is-closing" : ""
          }`}
        >
          <button
            type="button"
            className="sg-occasion-editor__backdrop"
            aria-label="Close memorable date form"
            onClick={closeEditor}
          />
          <section
            className="sg-occasion-editor__panel"
            role={isMobile ? "dialog" : undefined}
            aria-modal={isMobile || undefined}
            aria-labelledby={isMobile ? "sg-occasion-editor-title" : undefined}
          >
            <span className="sg-occasion-editor__handle" aria-hidden="true" />
            <header className="sg-occasion-editor__header">
              <h2 id="sg-occasion-editor-title">
                {form.id ? "Edit memorable date" : "Add a memorable date"}
              </h2>
              <button
                type="button"
                onClick={closeEditor}
                aria-label="Close memorable date form"
                autoFocus={isMobile}
              >
                <Xmark aria-hidden="true" />
              </button>
            </header>
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
                <NativeSelect
                  label="Remind me"
                  value={form.reminder_days}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      reminder_days: Number(event.target.value),
                    })
                  }
                >
                  {[0, 3, 7, 14, 21, 30].map((days) => (
                    <option key={days} value={days}>
                      {days === 0 ? "On the day" : `${days} days before`}
                    </option>
                  ))}
                </NativeSelect>
                <MobileCheckbox
                  checked={form.repeats_annually}
                  label="Repeat annually"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      repeats_annually: event.target.checked,
                    })
                  }
                />
              </div>
              <div className="sg-occasion-form__actions">
                {form.id && (
                  <button
                    type="button"
                    className="sg-occasion-form__delete"
                    aria-label="Delete date"
                    title="Delete date"
                    onClick={() => {
                      const item = personalItems.find(
                        (current) => current.id === form.id
                      )
                      if (item) {
                        remove(item)
                        closeEditor()
                      }
                    }}
                    disabled={isPending}
                  >
                    <Trash aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  className="sg-secondary-button"
                  onClick={closeEditor}
                >
                  Cancel
                </button>
                <button className="sg-brand-button" disabled={isPending}>
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {error && <p className="sg-form-message sg-form-message--error">{error}</p>}

      <div className="sg-occasion-section">
        <div className="sg-occasions__intro">
          <h2>Your saved dates</h2>
          <p className="sg-occasions__intro-desktop">
            We will only send reminders when occasion reminders are enabled in
            Notifications.
          </p>
          <p className="sg-occasions__intro-mobile">
            Turn on the occasions you want. We will send you a gentle email
            reminder.
          </p>
        </div>
        <div className="sg-preference-list sg-occasion-list">
          {personalItems.map((item) => (
            <div className="sg-preference-row" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span className="sg-occasion-details">
                  <span>{formatDate(item.occasion_date)}</span>
                  <span>Reminder {item.reminder_days} days before</span>
                  {item.repeats_annually && <span>Repeats annually</span>}
                </span>
              </div>
              <div className="sg-occasion-actions">
                <button
                  type="button"
                  onClick={() =>
                    openEditor({
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
        </div>
      </div>
      <div className="sg-occasion-section sg-occasion-section--national">
        <div className="sg-occasions__intro sg-occasions__intro--national">
          <h2>National occasions</h2>
          <p>
            Turn on the occasions you want. We will send you a gentle email
            reminder.
          </p>
        </div>
        <div className="sg-preference-list sg-occasion-list">
          {systemItems.map((item) => (
            <div className="sg-preference-row" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span className="sg-occasion-details">
                  <span>{formatDate(item.next_date)}</span>
                  <span>Reminder {item.reminder_days} days before</span>
                  <span>Repeats annually</span>
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
