import { copyFile, mkdir } from 'node:fs/promises'

await mkdir(new URL('../dist/privacy/', import.meta.url), { recursive: true })
await copyFile(
  new URL('../dist/index.html', import.meta.url),
  new URL('../dist/privacy/index.html', import.meta.url),
)
