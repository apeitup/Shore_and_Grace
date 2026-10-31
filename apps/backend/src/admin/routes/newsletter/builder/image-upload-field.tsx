import { Image } from "@medusajs/icons"
import { Button, Label, Text, toast } from "@medusajs/ui"
import { useRef, useState } from "react"
import { sdk } from "../../../lib/sdk"

type ImageUploadFieldProps = {
  label?: string
  value?: string
  onChange: (url: string) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

export const ImageUploadField = ({
  label = "Image",
  value,
  onChange,
}: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const upload = async (file?: File) => {
    if (!file) {
      return
    }

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      toast.error("Choose a PNG, JPG or WebP image")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("The image must be smaller than 5 MB")
      return
    }

    setIsUploading(true)
    try {
      const response = await sdk.admin.upload.create({ files: [file] })
      const uploadedUrl = response.files[0]?.url

      if (!uploadedUrl) {
        throw new Error("The upload did not return an image URL")
      }

      onChange(uploadedUrl)
      toast.success("Image uploaded")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The image could not be uploaded",
      )
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => void upload(event.target.files?.[0])}
      />
      {value ? (
        <div className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle">
          <img src={value} alt="Selected email artwork" className="h-40 w-full object-cover" />
          <div className="flex items-center justify-end gap-2 p-3">
            <Button
              size="small"
              variant="secondary"
              isLoading={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button size="small" variant="transparent" onClick={() => onChange("")}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-ui-border-strong bg-ui-bg-subtle px-4 py-8 text-ui-fg-subtle transition hover:bg-ui-bg-subtle-hover disabled:cursor-wait disabled:opacity-60"
        >
          <Image className="mb-2 size-5" />
          <Text size="small" weight="plus">
            {isUploading ? "Uploading image…" : "Browse for an image"}
          </Text>
          <Text size="xsmall" className="mt-1 text-ui-fg-muted">
            PNG, JPG or WebP, up to 5 MB
          </Text>
        </button>
      )}
    </div>
  )
}
