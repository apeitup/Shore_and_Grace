import {
  ArrowLeftMini,
  MagnifyingGlassMini,
  PlusMini,
  Spinner,
} from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Kbd,
  Text,
  clx,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import defaultTemplatePreview from "../../../assets/newsletter-template-default.png"
import { sdk } from "../../../lib/sdk"

type Template = {
  id: string
  name: string
  kind: "template"
  content: Record<string, unknown>
}

type TemplateResponse = {
  newsletters: Template[]
  count: number
}

type TemplateCardProps = {
  label: string
  onSelect: () => void
  isLoading?: boolean
}

const TemplateCard = ({
  label,
  onSelect,
  isLoading = false,
}: TemplateCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={isLoading}
    className={clx(
      "group relative flex h-[350px] w-[236px] shrink-0 flex-col justify-end overflow-hidden rounded-xl bg-ui-bg-base text-left outline-none transition-shadow",
      "shadow-borders-strong hover:shadow-borders-interactive-with-focus focus-visible:shadow-borders-interactive-with-focus",
      isLoading && "shadow-borders-interactive-with-focus",
    )}
    aria-label={`Open ${label} template`}
  >
    <img
      src={defaultTemplatePreview}
      alt=""
      className={clx(
        "absolute inset-0 size-full rounded-xl object-contain transition-opacity",
        isLoading && "opacity-20",
      )}
    />
    {isLoading ? (
      <span className="absolute inset-0 flex items-center justify-center">
        <Spinner className="size-9 text-ui-fg-muted" />
      </span>
    ) : (
      <span className="relative m-2.5 flex min-h-[52px] items-center justify-center overflow-hidden rounded-[10px] bg-ui-bg-base px-2.5 py-2 shadow-borders-base">
        <span className="w-full truncate text-center font-mono text-xs font-medium leading-[1.1] text-ui-fg-subtle">
          {label}
        </span>
      </span>
    )}
  </button>
)

export const TemplateGallery = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const searchRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState("")
  const [openingId, setOpeningId] = useState<string | null>(null)
  const fromBuilder = searchParams.get("from") === "builder"

  const { data, isError } = useQuery<TemplateResponse>({
    queryKey: ["newsletter-templates", "gallery"],
    queryFn: () => sdk.client.fetch("/admin/newsletters", {
      query: {
        kind: "template",
        limit: 100,
        offset: 0,
      },
    }),
  })

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }

    window.addEventListener("keydown", focusSearch)
    return () => window.removeEventListener("keydown", focusSearch)
  }, [])

  const defaultTemplate = data?.newsletters.find(
    (template) => template.name.trim().toLowerCase() === "shore & grace default",
  )

  const visibleTemplates = useMemo(() => {
    const query = search.trim().toLowerCase()
    const customTemplates = (data?.newsletters || []).filter(
      (template) => template.id !== defaultTemplate?.id,
    )
    const templates = [
      {
        id: defaultTemplate?.id || "default",
        name: "Shore & Grace Default",
        persisted: Boolean(defaultTemplate),
      },
      ...customTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        persisted: true,
      })),
    ]

    if (!query) {
      return templates
    }

    return templates.filter((template) =>
      template.name.toLowerCase().includes(query),
    )
  }, [data?.newsletters, defaultTemplate])

  const openTemplate = (template: {
    id: string
    persisted: boolean
  }) => {
    setOpeningId(template.id)

    if (fromBuilder) {
      navigate(
        template.persisted
          ? `/newsletter/builder?template=${template.id}&kind=newsletter`
          : "/newsletter/builder?kind=newsletter&preset=default",
      )
      return
    }

    navigate(
      template.persisted
        ? `/newsletter/builder?id=${template.id}`
        : "/newsletter/builder?kind=template&preset=default",
    )
  }

  return (
    <Container className="min-h-[calc(100dvh-80px)] overflow-hidden p-0">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border-base px-6 py-4">
        <div>
          <Heading level="h1">Newsletter templates</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Manage custom newsletter templates
          </Text>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="relative w-[280px] max-w-full">
            <MagnifyingGlassMini className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2 text-ui-fg-muted" />
            <Input
              ref={searchRef}
              type="search"
              aria-label="Search newsletter templates"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 w-full pl-8 pr-12"
            />
            <Kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              ⌘K
            </Kbd>
          </div>
          {fromBuilder && (
            <Button size="small" variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeftMini />
              Back
            </Button>
          )}
          <Button asChild size="small">
            <Link to="/newsletter/builder?kind=template">
              <PlusMini />
              Create template
            </Link>
          </Button>
        </div>
      </header>

      <div className="p-5">
        {visibleTemplates.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,236px)] gap-5">
            {visibleTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                label={template.name}
                isLoading={openingId === template.id}
                onSelect={() => openTemplate(template)}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 items-center justify-center">
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              No templates match your search.
            </Text>
          </div>
        )}
        {isError && (
          <Text size="small" className="mt-4 text-ui-fg-error">
            Custom templates could not be loaded. The default template is still available.
          </Text>
        )}
      </div>
    </Container>
  )
}
