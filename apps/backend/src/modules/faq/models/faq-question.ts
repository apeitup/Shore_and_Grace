import { model } from "@medusajs/framework/utils"

const FaqQuestion = model
  .define("faq_question", {
    id: model.id().primaryKey(),
    category_id: model.text().index("IDX_FAQ_QUESTION_CATEGORY_ID"),
    question: model.text(),
    answer: model.text(),
    position: model.number().default(0),
    published: model.boolean().default(false),
    featured: model.boolean().default(false),
  })
  .indexes([
    {
      name: "IDX_FAQ_QUESTION_CATEGORY_POSITION",
      on: ["category_id", "position"],
      where: { deleted_at: null },
    },
  ])

export default FaqQuestion
