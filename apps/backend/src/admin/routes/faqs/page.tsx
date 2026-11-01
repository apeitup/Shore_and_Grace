import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  PencilSquare,
  Plus,
  QuestionMarkCircle,
  Trash,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  FocusModal,
  Heading,
  IconButton,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FormEvent, useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"

type FaqCategory = {
  id: string
  name: string
  handle: string
  description?: string | null
  position: number
  active: boolean
  question_count: number
}

type FaqQuestion = {
  id: string
  category_id: string
  question: string
  answer: string
  position: number
  published: boolean
  featured: boolean
}

type CategoryDraft = Omit<FaqCategory, "id" | "question_count"> & {
  id?: string
}

type QuestionDraft = Omit<FaqQuestion, "id"> & { id?: string }

const emptyCategory: CategoryDraft = {
  name: "",
  handle: "",
  description: "",
  position: 0,
  active: true,
}

const emptyQuestion: QuestionDraft = {
  category_id: "",
  question: "",
  answer: "",
  position: 0,
  published: false,
  featured: false,
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const FaqsPage = () => {
  const queryClient = useQueryClient()
  const prompt = usePrompt()
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null)
  const [questionDraft, setQuestionDraft] = useState<QuestionDraft | null>(null)
  const [handleEdited, setHandleEdited] = useState(false)

  const categoriesQuery = useQuery<{ faq_categories: FaqCategory[] }>({
    queryKey: ["faq-categories"],
    queryFn: () => sdk.client.fetch("/admin/faq/categories"),
  })
  const questionsQuery = useQuery<{ faq_questions: FaqQuestion[] }>({
    queryKey: ["faq-questions"],
    queryFn: () => sdk.client.fetch("/admin/faq/questions"),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["faq-categories"] })
    queryClient.invalidateQueries({ queryKey: ["faq-questions"] })
  }

  const saveCategory = useMutation({
    mutationFn: (draft: CategoryDraft) =>
      sdk.client.fetch(
        draft.id
          ? `/admin/faq/categories/${draft.id}`
          : "/admin/faq/categories",
        { method: "POST", body: draft },
      ),
    onSuccess: () => {
      invalidate()
      setCategoryDraft(null)
      toast.success("FAQ category saved")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to save the FAQ category"),
  })
  const saveQuestion = useMutation({
    mutationFn: (draft: QuestionDraft) =>
      sdk.client.fetch(
        draft.id
          ? `/admin/faq/questions/${draft.id}`
          : "/admin/faq/questions",
        { method: "POST", body: draft },
      ),
    onSuccess: () => {
      invalidate()
      setQuestionDraft(null)
      toast.success("FAQ answer saved")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to save the FAQ answer"),
  })
  const deleteCategory = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/faq/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate()
      toast.success("FAQ category deleted")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to delete the FAQ category"),
  })
  const deleteQuestion = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/faq/questions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate()
      toast.success("FAQ answer deleted")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to delete the FAQ answer"),
  })

  const categories = categoriesQuery.data?.faq_categories || []
  const questions = questionsQuery.data?.faq_questions || []
  const questionsByCategory = useMemo(
    () =>
      questions.reduce<Record<string, FaqQuestion[]>>((result, question) => {
        result[question.category_id] ||= []
        result[question.category_id].push(question)
        return result
      }, {}),
    [questions],
  )

  const beginQuestion = (question?: FaqQuestion, categoryId?: string) => {
    setQuestionDraft(
      question
        ? { ...question }
        : { ...emptyQuestion, category_id: categoryId || categories[0]?.id || "" },
    )
  }

  const confirmDeleteCategory = async (category: FaqCategory) => {
    const confirmed = await prompt({
      title: `Delete ${category.name}?`,
      description: category.question_count
        ? "This category still contains questions. Move or delete them first."
        : "This category will no longer be available to organise FAQs.",
      confirmText: "Delete",
      cancelText: "Cancel",
    })
    if (confirmed) deleteCategory.mutate(category.id)
  }

  const confirmDeleteQuestion = async (question: FaqQuestion) => {
    const confirmed = await prompt({
      title: "Delete this question?",
      description: "The question and answer will be permanently removed.",
      confirmText: "Delete",
      cancelText: "Cancel",
    })
    if (confirmed) deleteQuestion.mutate(question.id)
  }

  const submitCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!categoryDraft) return
    saveCategory.mutate({
      ...categoryDraft,
      name: categoryDraft.name.trim(),
      handle: categoryDraft.handle || slugify(categoryDraft.name),
      description: categoryDraft.description?.trim() || null,
    })
  }

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!questionDraft) return
    saveQuestion.mutate({
      ...questionDraft,
      question: questionDraft.question.trim(),
      answer: questionDraft.answer.trim(),
    })
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
          <div>
            <Heading>Frequently asked questions</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Organise helpful answers for customers by category.
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                setHandleEdited(false)
                setCategoryDraft({ ...emptyCategory })
              }}
            >
              <Plus /> Category
            </Button>
            <Button
              size="small"
              onClick={() => beginQuestion()}
              disabled={!categories.length}
            >
              <Plus /> Question
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {(categoriesQuery.isLoading || questionsQuery.isLoading) && (
            <Text size="small" className="text-ui-fg-subtle">
              Loading FAQs…
            </Text>
          )}
          {!categoriesQuery.isLoading && !categories.length && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Heading level="h2">Start with a category</Heading>
              <Text size="small" className="text-ui-fg-subtle mt-1">
                For example: Ordering, Delivery, Flower care or Weddings and
                events.
              </Text>
              <Button
                size="small"
                className="mt-4"
                onClick={() => setCategoryDraft({ ...emptyCategory })}
              >
                <Plus /> Add category
              </Button>
            </div>
          )}
          {categories.map((category) => (
            <section key={category.id} className="rounded-lg border">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Text size="small" weight="plus">
                      {category.name}
                    </Text>
                    <Badge size="2xsmall" color={category.active ? "green" : "grey"}>
                      {category.active ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  <Text size="small" className="text-ui-fg-subtle">
                    {category.description || `${category.question_count} questions`}
                  </Text>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => beginQuestion(undefined, category.id)}
                  >
                    <Plus /> Question
                  </Button>
                  <IconButton
                    size="small"
                    variant="transparent"
                    onClick={() => {
                      setHandleEdited(true)
                      setCategoryDraft({ ...category })
                    }}
                    aria-label={`Edit ${category.name}`}
                  >
                    <PencilSquare />
                  </IconButton>
                  <IconButton
                    size="small"
                    variant="transparent"
                    onClick={() => confirmDeleteCategory(category)}
                    aria-label={`Delete ${category.name}`}
                  >
                    <Trash />
                  </IconButton>
                </div>
              </div>
              <div className="divide-y">
                {(questionsByCategory[category.id] || []).map((question) => (
                  <div
                    key={question.id}
                    className="flex items-start justify-between gap-4 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Text size="small" weight="plus">
                          {question.question}
                        </Text>
                        <Badge
                          size="2xsmall"
                          color={question.published ? "green" : "grey"}
                        >
                          {question.published ? "Published" : "Draft"}
                        </Badge>
                        {question.featured && (
                          <Badge size="2xsmall" color="blue">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <Text
                        size="small"
                        className="text-ui-fg-subtle mt-1 line-clamp-2"
                      >
                        {question.answer}
                      </Text>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <IconButton
                        size="small"
                        variant="transparent"
                        onClick={() => beginQuestion(question)}
                        aria-label={`Edit ${question.question}`}
                      >
                        <PencilSquare />
                      </IconButton>
                      <IconButton
                        size="small"
                        variant="transparent"
                        onClick={() => confirmDeleteQuestion(question)}
                        aria-label={`Delete ${question.question}`}
                      >
                        <Trash />
                      </IconButton>
                    </div>
                  </div>
                ))}
                {!questionsByCategory[category.id]?.length && (
                  <Text size="small" className="text-ui-fg-subtle px-4 py-4">
                    No questions in this category yet.
                  </Text>
                )}
              </div>
            </section>
          ))}
        </div>
      </Container>

      <FocusModal
        open={Boolean(categoryDraft)}
        onOpenChange={(open) => !open && setCategoryDraft(null)}
      >
        <FocusModal.Content>
          <form className="flex h-full flex-col" onSubmit={submitCategory}>
            <FocusModal.Header>
              <div className="mr-auto">
                <FocusModal.Title>
                  {categoryDraft?.id ? "Edit category" : "Add category"}
                </FocusModal.Title>
                <FocusModal.Description>
                  Categories help customers quickly find relevant answers.
                </FocusModal.Description>
              </div>
              <div className="flex items-center gap-2">
                <FocusModal.Close asChild>
                  <Button size="small" variant="secondary">Cancel</Button>
                </FocusModal.Close>
                <Button size="small" type="submit" isLoading={saveCategory.isPending}>
                  Save
                </Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="overflow-auto">
              <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-8">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="faq-category-name">Name</Label>
                  <Input
                    id="faq-category-name"
                    value={categoryDraft?.name || ""}
                    onChange={(event) => {
                      const name = event.target.value
                      setCategoryDraft((draft) =>
                        draft
                          ? {
                              ...draft,
                              name,
                              handle: handleEdited ? draft.handle : slugify(name),
                            }
                          : draft,
                      )
                    }}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="faq-category-handle">Handle</Label>
                  <Input
                    id="faq-category-handle"
                    value={categoryDraft?.handle || ""}
                    onChange={(event) => {
                      setHandleEdited(true)
                      setCategoryDraft((draft) =>
                        draft
                          ? { ...draft, handle: slugify(event.target.value) }
                          : draft,
                      )
                    }}
                    required
                  />
                  <Text size="small" className="text-ui-fg-subtle">
                    Used in storefront filters and links.
                  </Text>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="faq-category-description">Description</Label>
                  <Textarea
                    id="faq-category-description"
                    value={categoryDraft?.description || ""}
                    onChange={(event) =>
                      setCategoryDraft((draft) =>
                        draft ? { ...draft, description: event.target.value } : draft,
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="faq-category-position">Display order</Label>
                  <Input
                    id="faq-category-position"
                    type="number"
                    min="0"
                    value={categoryDraft?.position ?? 0}
                    onChange={(event) =>
                      setCategoryDraft((draft) =>
                        draft ? { ...draft, position: Number(event.target.value) } : draft,
                      )
                    }
                  />
                </div>
                <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div>
                    <Text size="small" weight="plus">Visible category</Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      Hidden categories and their questions stay off the storefront.
                    </Text>
                  </div>
                  <Switch
                    checked={categoryDraft?.active ?? true}
                    onCheckedChange={(active) =>
                      setCategoryDraft((draft) => draft ? { ...draft, active } : draft)
                    }
                  />
                </label>
              </div>
            </FocusModal.Body>
          </form>
        </FocusModal.Content>
      </FocusModal>

      <FocusModal
        open={Boolean(questionDraft)}
        onOpenChange={(open) => !open && setQuestionDraft(null)}
      >
        <FocusModal.Content>
          <form className="flex h-full flex-col" onSubmit={submitQuestion}>
            <FocusModal.Header>
              <div className="mr-auto">
                <FocusModal.Title>
                  {questionDraft?.id ? "Edit question" : "Add question"}
                </FocusModal.Title>
                <FocusModal.Description>
                  Write a clear, customer-friendly answer.
                </FocusModal.Description>
              </div>
              <div className="flex items-center gap-2">
                <FocusModal.Close asChild>
                  <Button size="small" variant="secondary">Cancel</Button>
                </FocusModal.Close>
                <Button size="small" type="submit" isLoading={saveQuestion.isPending}>
                  Save
                </Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="overflow-auto">
              <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-8">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="faq-question-category">Category</Label>
                  <Select
                    value={questionDraft?.category_id || ""}
                    onValueChange={(category_id) =>
                      setQuestionDraft((draft) => draft ? { ...draft, category_id } : draft)
                    }
                  >
                    <Select.Trigger id="faq-question-category">
                      <Select.Value placeholder="Choose a category" />
                    </Select.Trigger>
                    <Select.Content>
                      {categories.map((category) => (
                        <Select.Item key={category.id} value={category.id}>
                          {category.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="faq-question">Question</Label>
                  <Input
                    id="faq-question"
                    value={questionDraft?.question || ""}
                    onChange={(event) =>
                      setQuestionDraft((draft) => draft ? { ...draft, question: event.target.value } : draft)
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="faq-answer">Answer</Label>
                  <Textarea
                    id="faq-answer"
                    rows={10}
                    value={questionDraft?.answer || ""}
                    onChange={(event) =>
                      setQuestionDraft((draft) => draft ? { ...draft, answer: event.target.value } : draft)
                    }
                    required
                  />
                  <Text size="small" className="text-ui-fg-subtle">
                    Plain text is displayed safely and preserves paragraphs.
                  </Text>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="faq-question-position">Display order</Label>
                  <Input
                    id="faq-question-position"
                    type="number"
                    min="0"
                    value={questionDraft?.position ?? 0}
                    onChange={(event) =>
                      setQuestionDraft((draft) => draft ? { ...draft, position: Number(event.target.value) } : draft)
                    }
                  />
                </div>
                <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div>
                    <Text size="small" weight="plus">Published</Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      Only published answers appear on the storefront.
                    </Text>
                  </div>
                  <Switch
                    checked={questionDraft?.published ?? false}
                    onCheckedChange={(published) =>
                      setQuestionDraft((draft) => draft ? { ...draft, published } : draft)
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div>
                    <Text size="small" weight="plus">Featured</Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      Mark useful answers for future homepage or support highlights.
                    </Text>
                  </div>
                  <Switch
                    checked={questionDraft?.featured ?? false}
                    onCheckedChange={(featured) =>
                      setQuestionDraft((draft) => draft ? { ...draft, featured } : draft)
                    }
                  />
                </label>
              </div>
            </FocusModal.Body>
          </form>
        </FocusModal.Content>
      </FocusModal>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "FAQs",
  icon: QuestionMarkCircle,
})

export default FaqsPage
