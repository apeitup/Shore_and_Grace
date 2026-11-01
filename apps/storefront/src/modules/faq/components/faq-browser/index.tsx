"use client"

import type { StoreFaqCategory } from "@lib/data/faqs"
import { MinusCircle, PlusCircle } from "iconoir-react"
import { useMemo, useState } from "react"

type FaqBrowserProps = {
  categories: StoreFaqCategory[]
}

const FaqBrowser = ({ categories }: FaqBrowserProps) => {
  const availableCategories = useMemo(
    () => categories.filter((category) => category.questions.length),
    [categories]
  )
  const [selected, setSelected] = useState("all")
  const [openQuestions, setOpenQuestions] = useState<
    Record<string, string | null>
  >({})
  const visibleCategories =
    selected === "all"
      ? availableCategories
      : availableCategories.filter((category) => category.handle === selected)

  if (!availableCategories.length) {
    return (
      <div className="sg-faq-page__empty">
        <h2>We’re preparing our helpful answers</h2>
        <p>
          Please contact us if there is anything we can help you with in the
          meantime.
        </p>
      </div>
    )
  }

  return (
    <div className="sg-faq-browser">
      <div className="sg-faq-browser__filters" aria-label="FAQ categories">
        <button
          type="button"
          className="sg-faq-browser__filter"
          data-selected={selected === "all"}
          aria-pressed={selected === "all"}
          onClick={() => setSelected("all")}
        >
          All questions
        </button>
        {availableCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="sg-faq-browser__filter"
            data-selected={selected === category.handle}
            aria-pressed={selected === category.handle}
            onClick={() => setSelected(category.handle)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="sg-faq-browser__categories">
        {visibleCategories.map((category) => (
          <section key={category.id} className="sg-faq-category">
            <header className="sg-faq-category__header">
              <h2>{category.name}</h2>
              {category.description && <p>{category.description}</p>}
            </header>
            <div className="sg-faq-category__questions">
              {category.questions.map((item) => {
                const isOpen = openQuestions[category.id] === item.id
                const triggerId = `faq-trigger-${item.id}`
                const contentId = `faq-content-${item.id}`

                return (
                  <div key={item.id} className="sg-faq-question">
                    <h3 className="sg-faq-question__header">
                      <button
                        id={triggerId}
                        type="button"
                        className="sg-faq-question__trigger"
                        data-state={isOpen ? "open" : "closed"}
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                        onClick={() =>
                          setOpenQuestions((current) => ({
                            ...current,
                            [category.id]: isOpen ? null : item.id,
                          }))
                        }
                      >
                        <span className="sg-faq-question__prompt">
                          {item.question}
                        </span>
                        <span
                          className="sg-faq-question__icon"
                          aria-hidden="true"
                        >
                          <PlusCircle className="sg-faq-question__plus" />
                          <MinusCircle className="sg-faq-question__minus" />
                        </span>
                      </button>
                    </h3>
                    <div
                      id={contentId}
                      className="sg-faq-question__content"
                      data-state={isOpen ? "open" : "closed"}
                      role="region"
                      aria-labelledby={triggerId}
                      hidden={!isOpen}
                    >
                      <div className="sg-faq-question__answer">
                        {item.answer.split(/\n{2,}/).map((paragraph, index) => (
                          <p key={`${item.id}-${index}`}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default FaqBrowser
