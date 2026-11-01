"use server"

import { sdk } from "@lib/config"

export type StoreFaqQuestion = {
  id: string
  question: string
  answer: string
  featured: boolean
}

export type StoreFaqCategory = {
  id: string
  name: string
  handle: string
  description?: string | null
  questions: StoreFaqQuestion[]
}

export const listFaqs = async (query?: {
  category?: string
  featured?: "true" | "false"
}) =>
  sdk.client.fetch<{ faq_categories: StoreFaqCategory[] }>("/store/faqs", {
    method: "GET",
    query,
    next: { revalidate: 60 },
  })
