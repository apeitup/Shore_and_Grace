import {
  ArrowUturnLeft,
  ComputerDesktop,
  LaptopMobile,
} from "@medusajs/icons"
import {
  Button,
  Container,
  FocusModal,
  Heading,
  IconButton,
  Input,
  Label,
  StatusBadge,
  Text,
  toast,
  Tooltip,
  usePrompt,
} from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { sdk } from "../../../lib/sdk"
import { BlockLibrary } from "./block-library"
import { BlockSettings } from "./block-settings"
import { EmailPreview } from "./email-preview"
import type {
  NewsletterBlock,
  NewsletterBlockType,
  NewsletterDraft,
} from "./types"

const createBlock = (type: NewsletterBlockType): NewsletterBlock => {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const defaults: Record<NewsletterBlockType, Omit<NewsletterBlock, "id" | "type">> = {
    hero: {
      eyebrow: "The Christmas collection",
      title: "A little seasonal magic",
      body: "Thoughtful flowers and gifts, chosen to make Christmas feel beautifully personal.",
      buttonLabel: "Shop the collection",
      buttonLink: "/store",
      alignment: "center",
    },
    text: {
      title: "A thoughtful note",
      body: "Add your message here.",
      alignment: "left",
    },
    image: { title: "Image", imageAlt: "", alignment: "center" },
    product: { title: "Featured product", products: [], alignment: "center" },
    "product-grid": { title: "Gifts chosen with care", products: [], alignment: "center" },
    occasion: {
      eyebrow: "A date to remember",
      title: "Make their day feel special",
      body: "A thoughtful arrangement can say everything.",
      buttonLabel: "Shop the occasion",
      buttonLink: "/store",
      alignment: "center",
    },
    button: {
      title: "Shop now",
      buttonLabel: "Shop now",
      buttonLink: "/store",
      alignment: "center",
    },
    divider: { title: "Divider", dividerStyle: "solid", alignment: "center" },
    signature: {
      title: "Signature",
      signatureStyle: "formal",
      signatureGreeting: "Warmest regards,",
      signatureName: "Amanda",
      signatureStudio: "Shore & Grace",
      alignment: "left",
    },
    spacer: {
      title: "Spacer",
      spacerSize: "medium",
      alignment: "center",
    },
    heading: {
      eyebrow: "",
      title: "A heading with purpose",
      alignment: "center",
    },
    columns: {
      title: "Two columns",
      leftTitle: "Thoughtfully chosen",
      leftBody: "Add the first column message here.",
      rightTitle: "Beautifully delivered",
      rightBody: "Add the second column message here.",
      alignment: "left",
    },
    collection: {
      eyebrow: "Discover",
      title: "A collection for every occasion",
      body: "Introduce the collection and why it is special.",
      buttonLabel: "Explore the collection",
      buttonLink: "/store",
      alignment: "center",
    },
    promotion: {
      eyebrow: "A little something",
      title: "A thoughtful offer",
      body: "Share the details of this promotion.",
      promotionCode: "",
      buttonLabel: "Shop now",
      buttonLink: "/store",
      alignment: "center",
    },
    contact: {
      title: "We are here to help",
      contactEmail: "contact@shoreandgrace.com",
      contactPhone: "07754 870498",
      contactHours: "Monday–Saturday, 9am–5pm",
      alignment: "center",
    },
    testimonial: {
      title: "Kind words",
      testimonialQuote: "Add a customer quote here.",
      testimonialAuthor: "Customer name",
      testimonialRating: 5,
      alignment: "center",
    },
    "delivery-notice": {
      eyebrow: "Delivery update",
      title: "Order in time for the occasion",
      body: "Explain the delivery deadline or service update.",
      deliveryDeadline: "",
      alignment: "center",
    },
    "personalised-greeting": {
      eyebrow: "A note for you",
      title: "Hello {{ first_name }},",
      body: "Add a warm introduction to the newsletter.",
      greetingToken: "{{ first_name }}",
      greetingFallback: "there",
      alignment: "left",
    },
    "content-card": {
      eyebrow: "From the studio",
      title: "A story worth sharing",
      body: "Use this card for an article, service or seasonal story.",
      imageAlt: "",
      buttonLabel: "Read more",
      buttonLink: "/",
      alignment: "left",
    },
  }

  return { id, type, ...defaults[type] }
}

const initialBlocks: NewsletterBlock[] = [
  createBlock("hero"),
  createBlock("product-grid"),
  createBlock("signature"),
]

const NewsletterBuilderPage = () => {
  const [searchParams] = useSearchParams()
  const requestedCampaignId = searchParams.get("id") || undefined
  const requestedTemplateId = searchParams.get("template") || undefined
  const requestedKind = searchParams.get("kind") === "template"
    ? "template"
    : "newsletter"
  const [blocks, setBlocks] = useState(initialBlocks)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    initialBlocks[0].id,
  )
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop")
  const [history, setHistory] = useState<NewsletterBlock[][]>([])
  const [future, setFuture] = useState<NewsletterBlock[][]>([])
  const [campaignId, setCampaignId] = useState<string | undefined>()
  const [name, setName] = useState(
    requestedKind === "template" ? "Untitled template" : "Untitled newsletter",
  )
  const [subject, setSubject] = useState("")
  const [preheader, setPreheader] = useState("")
  const [campaignKind, setCampaignKind] = useState<"newsletter" | "template">(
    requestedKind,
  )
  const [campaignStatus, setCampaignStatus] = useState("draft")
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [testOpen, setTestOpen] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduledAt, setScheduledAt] = useState("")
  const prompt = usePrompt()

  useEffect(() => {
    const sourceId = requestedCampaignId || requestedTemplateId

    if (sourceId) {
      sdk.client.fetch<{
        newsletter: {
          id: string
          name: string
          subject?: string | null
          preheader?: string | null
          kind: "newsletter" | "template"
          status: string
          content?: { blocks?: NewsletterBlock[] }
        }
      }>(`/admin/newsletters/${sourceId}`).then(({ newsletter }) => {
        const nextBlocks = Array.isArray(newsletter.content?.blocks)
          ? newsletter.content.blocks
          : initialBlocks

        setCampaignId(requestedTemplateId ? undefined : newsletter.id)
        setName(requestedTemplateId ? `${newsletter.name} newsletter` : newsletter.name)
        setSubject(newsletter.subject || "")
        setPreheader(newsletter.preheader || "")
        setCampaignKind(requestedTemplateId ? "newsletter" : newsletter.kind)
        setCampaignStatus(requestedTemplateId ? "draft" : newsletter.status)
        setBlocks(nextBlocks)
        setSelectedBlockId(nextBlocks[0]?.id || null)
      }).catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load newsletter")
      })
      return
    }

    const savedDraft = window.localStorage.getItem("shore-grace-newsletter-draft")

    if (!savedDraft) {
      return
    }

    try {
      const parsed = JSON.parse(savedDraft) as NewsletterDraft
      if (Array.isArray(parsed.blocks) && parsed.blocks.length) {
        setBlocks(parsed.blocks)
        setSelectedBlockId(parsed.selectedBlockId || parsed.blocks[0].id)
        setCampaignId(parsed.campaignId)
        setName(parsed.name || "Untitled newsletter")
        setSubject(parsed.subject || "")
        setPreheader(parsed.preheader || "")
        setCampaignKind(parsed.kind || requestedKind)
      }
    } catch {
      window.localStorage.removeItem("shore-grace-newsletter-draft")
    }
  }, [requestedCampaignId, requestedKind, requestedTemplateId])

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId),
    [blocks, selectedBlockId],
  )

  const commitBlocks = (nextBlocks: NewsletterBlock[]) => {
    setHistory((current) => [...current.slice(-19), blocks])
    setFuture([])
    setBlocks(nextBlocks)
  }

  const addBlock = (type: NewsletterBlockType) => {
    const block = createBlock(type)
    commitBlocks([...blocks, block])
    setSelectedBlockId(block.id)
  }

  const addBlockAt = (type: NewsletterBlockType, index: number) => {
    const block = createBlock(type)
    const nextBlocks = [...blocks]

    nextBlocks.splice(index, 0, block)
    commitBlocks(nextBlocks)
    setSelectedBlockId(block.id)
  }

  const reorderBlock = (id: string, targetIndex: number) => {
    const sourceIndex = blocks.findIndex((block) => block.id === id)

    if (sourceIndex < 0) {
      return
    }

    const nextBlocks = [...blocks]
    const [moved] = nextBlocks.splice(sourceIndex, 1)
    const adjustedIndex = sourceIndex < targetIndex
      ? targetIndex - 1
      : targetIndex

    nextBlocks.splice(adjustedIndex, 0, moved)
    commitBlocks(nextBlocks)
    setSelectedBlockId(id)
  }

  const updateBlock = (nextBlock: NewsletterBlock) => {
    commitBlocks(
      blocks.map((block) => (block.id === nextBlock.id ? nextBlock : block)),
    )
  }

  const moveBlock = (id: string, direction: -1 | 1) => {
    const index = blocks.findIndex((block) => block.id === id)
    const nextIndex = index + direction

    if (index < 0 || nextIndex < 0 || nextIndex >= blocks.length) {
      return
    }

    const nextBlocks = [...blocks]
    const [moved] = nextBlocks.splice(index, 1)
    nextBlocks.splice(nextIndex, 0, moved)
    commitBlocks(nextBlocks)
  }

  const duplicateBlock = (id: string) => {
    const index = blocks.findIndex((block) => block.id === id)

    if (index < 0) {
      return
    }

    const copy = {
      ...blocks[index],
      id: `${blocks[index].type}-${Date.now()}-copy`,
    }
    const nextBlocks = [...blocks]
    nextBlocks.splice(index + 1, 0, copy)
    commitBlocks(nextBlocks)
    setSelectedBlockId(copy.id)
  }

  const deleteBlock = (id: string) => {
    const nextBlocks = blocks.filter((block) => block.id !== id)
    commitBlocks(nextBlocks)
    setSelectedBlockId(nextBlocks[0]?.id || null)
  }

  const undo = () => {
    const previous = history.at(-1)

    if (!previous) {
      return
    }

    setFuture((current) => [blocks, ...current])
    setBlocks(previous)
    setHistory((current) => current.slice(0, -1))
    setSelectedBlockId(previous[0]?.id || null)
  }

  const redo = () => {
    const next = future[0]

    if (!next) {
      return
    }

    setHistory((current) => [...current, blocks])
    setBlocks(next)
    setFuture((current) => current.slice(1))
    setSelectedBlockId(next[0]?.id || null)
  }

  const persistCampaign = async ({ validate = true, notify = true } = {}) => {
    if (!name.trim()) {
      setDetailsOpen(true)
      toast.error("Add a campaign name")
      return
    }

    if (validate) {
      if (campaignKind === "newsletter" && !subject.trim()) {
        setDetailsOpen(true)
        toast.error("Add an email subject")
        return
      }

      const invalidBlock = blocks.find((block) => {
        if (
          [
            "hero",
            "button",
            "occasion",
            "collection",
            "promotion",
            "content-card",
          ].includes(block.type)
        ) {
          return Boolean(block.buttonLabel?.trim()) !== Boolean(block.buttonLink?.trim())
        }

        if (["image", "collection", "content-card"].includes(block.type)) {
          return block.imageUrl ? !block.imageAlt?.trim() : block.type === "image"
        }

        if (block.type === "product") {
          return !block.products?.length
        }

        if (block.type === "product-grid") {
          return !block.products?.length
        }

        return false
      })

      if (invalidBlock) {
        setSelectedBlockId(invalidBlock.id)
        toast.error(`Complete the ${invalidBlock.type.replace("-", " ")} block before saving`)
        return
      }
    }

    setIsSaving(true)

    try {
      const payload = {
        name: name.trim(),
        subject: subject.trim() || null,
        preheader: preheader.trim() || null,
        status: "draft" as const,
        kind: campaignKind,
        season: null,
        content: { blocks },
      }
      const response = await sdk.client.fetch<{
        newsletter: { id: string }
      }>(campaignId ? `/admin/newsletters/${campaignId}` : "/admin/newsletters", {
        method: "POST",
        body: payload,
      })
      const nextCampaignId = response.newsletter.id
      const draft: NewsletterDraft = {
        name: name.trim(),
        subject: subject.trim(),
        preheader: preheader.trim(),
        kind: campaignKind,
        campaignId: nextCampaignId,
        blocks,
        selectedBlockId,
      }

      setCampaignId(nextCampaignId)
      window.localStorage.setItem(
        "shore-grace-newsletter-draft",
        JSON.stringify(draft),
      )
      if (notify) {
        toast.success(campaignKind === "template" ? "Template saved" : "Newsletter saved")
      }
      return nextCampaignId
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save newsletter",
      )
    } finally {
      setIsSaving(false)
    }
  }

  const sendTest = async () => {
    if (!testEmail.trim()) {
      toast.error("Enter the email address to receive the test")
      return
    }

    const id = await persistCampaign({ validate: true, notify: false })
    if (!id) {
      return
    }

    setIsSending(true)
    try {
      await sdk.client.fetch(`/admin/newsletters/${id}/send`, {
        method: "POST",
        body: { test_email: testEmail.trim() },
      })
      setTestOpen(false)
      toast.success(`Test sent to ${testEmail.trim()}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send test")
    } finally {
      setIsSending(false)
    }
  }

  const sendNow = async () => {
    const id = await persistCampaign({ validate: true, notify: false })
    if (!id) {
      return
    }

    const confirmed = await prompt({
      title: "Send this newsletter now?",
      description: "It will be sent to every currently subscribed address. This cannot be recalled.",
      confirmText: "Send newsletter",
      cancelText: "Cancel",
    })

    if (!confirmed) {
      return
    }

    setIsSending(true)
    try {
      const response = await sdk.client.fetch<{
        result: { sent: number; failed: number }
      }>(`/admin/newsletters/${id}/send`, { method: "POST", body: {} })
      setCampaignStatus("sent")
      toast.success(`Newsletter sent to ${response.result.sent} subscribers`)
      if (response.result.failed) {
        toast.warning(`${response.result.failed} messages failed to send`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send newsletter")
    } finally {
      setIsSending(false)
    }
  }

  const scheduleCampaign = async () => {
    const date = new Date(scheduledAt)
    if (!scheduledAt || Number.isNaN(date.getTime()) || date <= new Date()) {
      toast.error("Choose a future date and time")
      return
    }

    const id = await persistCampaign({ validate: true, notify: false })
    if (!id) {
      return
    }

    setIsSaving(true)
    try {
      await sdk.client.fetch(`/admin/newsletters/${id}`, {
        method: "POST",
        body: {
          name: name.trim(),
          subject: subject.trim(),
          preheader: preheader.trim() || null,
          status: "scheduled",
          kind: "newsletter",
          season: null,
          content: { blocks },
          scheduled_at: date.toISOString(),
        },
      })
      setCampaignStatus("scheduled")
      setScheduleOpen(false)
      toast.success(`Newsletter scheduled for ${date.toLocaleString("en-GB")}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to schedule newsletter")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container className="flex h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] min-h-0 flex-col overflow-hidden p-0">
      <header className="flex items-center justify-between border-b border-ui-border-base px-6 py-4">
        <div className="flex items-center gap-3">
          <div>
            <Heading>Newsletter Builder</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {name}
            </Text>
          </div>
          <StatusBadge color={campaignStatus === "sent" ? "green" : "grey"}>
            {campaignKind === "template"
              ? "Template"
              : campaignStatus.charAt(0).toUpperCase() + campaignStatus.slice(1)}
          </StatusBadge>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="small" variant="secondary">
            <Link to="/newsletter/templates">Choose template</Link>
          </Button>
          <Button size="small" variant="secondary" onClick={() => setDetailsOpen(true)}>
            Campaign details
          </Button>
          <div className="flex items-center rounded-md border border-ui-border-base bg-ui-bg-base">
            <Tooltip content="Undo">
              <IconButton
                size="small"
                variant="transparent"
                disabled={!history.length}
                onClick={undo}
              >
                <ArrowUturnLeft />
              </IconButton>
            </Tooltip>
            <Tooltip content="Redo">
              <IconButton
                size="small"
                variant="transparent"
                disabled={!future.length}
                onClick={redo}
              >
                <ArrowUturnLeft className="-scale-x-100" />
              </IconButton>
            </Tooltip>
          </div>
          <Button
            size="small"
            variant="secondary"
            isLoading={isSaving}
            disabled={isSaving}
            onClick={() => persistCampaign({ validate: false })}
          >
            Save draft
          </Button>
          <Button
            size="small"
            isLoading={isSaving}
            disabled={isSaving}
            onClick={() => persistCampaign()}
          >
            Save
          </Button>
          {campaignKind === "newsletter" && campaignStatus !== "sent" && (
            <>
              <Button
                size="small"
                variant="secondary"
                disabled={isSaving || isSending}
                onClick={() => setScheduleOpen(true)}
              >
                Schedule
              </Button>
              <Button
                size="small"
                isLoading={isSending}
                disabled={isSaving || isSending}
                onClick={sendNow}
              >
                Send now
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <BlockLibrary onAddBlock={addBlock} />

        <main className="min-w-0 flex-1 overflow-auto bg-ui-bg-subtle">
          <div className="sticky top-0 z-20 flex items-center justify-between bg-ui-bg-subtle/95 px-6 py-3 backdrop-blur">
            <div className="flex items-center rounded-md border border-ui-border-base bg-ui-bg-base p-1">
              <Tooltip content="Desktop preview">
                <IconButton
                  size="small"
                  variant={preview === "desktop" ? "primary" : "transparent"}
                  onClick={() => setPreview("desktop")}
                >
                  <ComputerDesktop />
                </IconButton>
              </Tooltip>
              <Tooltip content="Mobile preview">
                <IconButton
                  size="small"
                  variant={preview === "mobile" ? "primary" : "transparent"}
                  onClick={() => setPreview("mobile")}
                >
                  <LaptopMobile />
                </IconButton>
              </Tooltip>
            </div>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setTestOpen(true)}
            >
              Send test
            </Button>
          </div>
          <div className="min-w-[680px] px-10 py-8">
            <EmailPreview
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              preview={preview}
              onSelectBlock={setSelectedBlockId}
              onMoveBlock={moveBlock}
              onDuplicateBlock={duplicateBlock}
              onDeleteBlock={deleteBlock}
              onDropBlock={addBlockAt}
              onReorderBlock={reorderBlock}
            />
          </div>
        </main>

        <BlockSettings block={selectedBlock} onChange={updateBlock} />
      </div>

      <FocusModal open={detailsOpen} onOpenChange={setDetailsOpen}>
        <FocusModal.Content>
          <FocusModal.Header>
            <div>
              <FocusModal.Title>Campaign details</FocusModal.Title>
              <FocusModal.Description>
                Set the internal name and inbox copy for this newsletter.
              </FocusModal.Description>
            </div>
          </FocusModal.Header>
          <FocusModal.Body className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-8">
            <div className="flex flex-col gap-2">
              <Label htmlFor="campaign-name">Name</Label>
              <Input id="campaign-name" value={name} onChange={(event) => setName(event.target.value)} />
              <Text size="xsmall" className="text-ui-fg-subtle">Only visible in Medusa Admin.</Text>
            </div>
            {campaignKind === "newsletter" && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="campaign-subject">Subject</Label>
                  <Input id="campaign-subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="campaign-preheader">Preheader</Label>
                  <Input id="campaign-preheader" value={preheader} onChange={(event) => setPreheader(event.target.value)} />
                  <Text size="xsmall" className="text-ui-fg-subtle">Shown after the subject by supported email clients.</Text>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDetailsOpen(false)}>Cancel</Button>
              <Button onClick={() => setDetailsOpen(false)}>Done</Button>
            </div>
          </FocusModal.Body>
        </FocusModal.Content>
      </FocusModal>

      <FocusModal open={testOpen} onOpenChange={setTestOpen}>
        <FocusModal.Content>
          <FocusModal.Header>
            <div>
              <FocusModal.Title>Send a test email</FocusModal.Title>
              <FocusModal.Description>
                The test uses the current saved content and is not sent to subscribers.
              </FocusModal.Description>
            </div>
          </FocusModal.Header>
          <FocusModal.Body className="mx-auto flex w-full max-w-xl flex-col gap-6 p-8">
            <div className="flex flex-col gap-2">
              <Label htmlFor="test-email">Email address</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(event) => setTestEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setTestOpen(false)}>Cancel</Button>
              <Button isLoading={isSending} onClick={sendTest}>Send test</Button>
            </div>
          </FocusModal.Body>
        </FocusModal.Content>
      </FocusModal>

      <FocusModal open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <FocusModal.Content>
          <FocusModal.Header>
            <div>
              <FocusModal.Title>Schedule newsletter</FocusModal.Title>
              <FocusModal.Description>
                Times use the timezone configured on this device.
              </FocusModal.Description>
            </div>
          </FocusModal.Header>
          <FocusModal.Body className="mx-auto flex w-full max-w-xl flex-col gap-6 p-8">
            <div className="flex flex-col gap-2">
              <Label htmlFor="scheduled-at">Send date and time</Label>
              <Input
                id="scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setScheduleOpen(false)}>Cancel</Button>
              <Button isLoading={isSaving} onClick={scheduleCampaign}>Schedule</Button>
            </div>
          </FocusModal.Body>
        </FocusModal.Content>
      </FocusModal>
    </Container>
  )
}

export default NewsletterBuilderPage
