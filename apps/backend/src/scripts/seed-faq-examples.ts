import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { FAQ_MODULE } from "../modules/faq"
import type FaqModuleService from "../modules/faq/service"
import { saveFaqCategoryWorkflow } from "../workflows/save-faq-category"
import { saveFaqQuestionWorkflow } from "../workflows/save-faq-question"

const faqContent = [
  {
    name: "Ordering",
    handle: "ordering",
    description: "Placing, changing and personalising an order.",
    position: 10,
    questions: [
      {
        question: "How do I place an order?",
        answer:
          "Choose your flowers or gift, select the available options and add it to your basket. At checkout, enter the recipient’s details, delivery information and your gift message before completing payment.",
      },
      {
        question: "Can I include a personal message?",
        answer:
          "Yes. You can add a personal gift message during checkout. We’ll include it with the order without showing the price.",
      },
      {
        question: "Can I change or cancel my order?",
        answer:
          "Please contact us as soon as possible. We may be able to change or cancel an order before preparation begins. Once flowers have been prepared or dispatched, changes may no longer be possible.",
      },
    ],
  },
  {
    name: "Delivery",
    handle: "delivery",
    description: "Delivery areas, dates and recipient availability.",
    position: 20,
    questions: [
      {
        question: "Where do you deliver?",
        answer:
          "We currently deliver within our advertised delivery area. Enter the recipient’s postcode in your basket to check availability, delivery options and any applicable charge.",
      },
      {
        question: "Can I choose a delivery date?",
        answer:
          "Yes. Available delivery dates are shown during checkout. Dates may be limited during busy periods such as Valentine’s Day, Mothering Sunday and Christmas.",
      },
      {
        question: "What happens if the recipient is not available?",
        answer:
          "Where appropriate, we may leave the order in a safe place or with a neighbour. Otherwise, we’ll follow the delivery instructions provided or contact the recipient to arrange the next step.",
      },
    ],
  },
  {
    name: "Flower care",
    handle: "flower-care",
    description: "Helping fresh flowers look their best for longer.",
    position: 30,
    questions: [
      {
        question: "How should I care for fresh flowers?",
        answer:
          "Trim the stems at an angle, place them in a clean vase with fresh water and keep them away from direct sunlight, heat and ripening fruit. Refresh the water regularly and remove fading flowers or foliage.",
      },
      {
        question: "Will my arrangement look exactly like the photograph?",
        answer:
          "Flowers are natural and seasonal, so varieties, colours and placement may vary slightly. If a particular flower is unavailable, we may substitute it with one of similar style, quality and value while preserving the overall design.",
      },
    ],
  },
  {
    name: "Faux flowers",
    handle: "faux-flowers",
    description: "Looking after lasting faux arrangements.",
    position: 40,
    questions: [
      {
        question: "How should I care for faux flowers?",
        answer:
          "Keep faux flowers away from prolonged direct sunlight and excessive moisture. Remove dust gently using a soft cloth, feather duster or a hairdryer on its coolest, lowest setting.",
      },
    ],
  },
  {
    name: "Services",
    handle: "services",
    description: "Bespoke flowers for meaningful occasions.",
    position: 50,
    questions: [
      {
        question: "Do you create flowers for weddings, funerals and events?",
        answer:
          "Yes. We offer thoughtful, bespoke floral designs for weddings, funerals, celebrations and other occasions. Please contact us with your date, requirements and budget so we can discuss the most suitable options.",
      },
    ],
  },
]

export default async function seedFaqExamples({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<FaqModuleService>(FAQ_MODULE)
  const existingCategories = await service.listFaqCategories()
  const existingQuestions = await service.listFaqQuestions()
  const categoryByHandle = new Map(
    existingCategories.map((category) => [category.handle, category]),
  )
  const existingQuestionKeys = new Set(
    existingQuestions.map(
      (question) => `${question.category_id}:${question.question}`,
    ),
  )

  let categoriesCreated = 0
  let questionsCreated = 0

  for (const categoryInput of faqContent) {
    let category = categoryByHandle.get(categoryInput.handle)

    if (!category) {
      const { result } = await saveFaqCategoryWorkflow(container).run({
        input: {
          name: categoryInput.name,
          handle: categoryInput.handle,
          description: categoryInput.description,
          position: categoryInput.position,
          active: true,
        },
      })
      category = result.category
      categoryByHandle.set(categoryInput.handle, category)
      categoriesCreated += 1
    }

    for (const [index, questionInput] of categoryInput.questions.entries()) {
      const questionKey = `${category.id}:${questionInput.question}`
      if (existingQuestionKeys.has(questionKey)) continue

      await saveFaqQuestionWorkflow(container).run({
        input: {
          category_id: category.id,
          question: questionInput.question,
          answer: questionInput.answer,
          position: (index + 1) * 10,
          published: true,
          featured: index === 0,
        },
      })
      existingQuestionKeys.add(questionKey)
      questionsCreated += 1
    }
  }

  logger.info(
    `FAQ examples ready: ${categoriesCreated} categories and ${questionsCreated} questions created.`,
  )
}
