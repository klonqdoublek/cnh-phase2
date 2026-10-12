import { useEffect, useState } from 'react'
import { Button } from '@/bbl/button'
import { Icon } from '@/bbl/icon'
import { OutlineButton } from '@/bbl/outline-button'
import { ConfirmDialog } from '@/patterns/confirm-dialog'

export const PREVIEW_COPY = {
  preview: 'Preview',
  eyebrow: 'Document Preview',
  download: 'Download',
  ok: 'OK',
}

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** CMS's `highlightJson` (`lib/preview-content.ts`): keys on Text/Highlight,
 *  every value on Text/Primary. The text is escaped before it is marked up. */
function highlightJson(json: string): string {
  return escapeHtml(json).replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d+)?)/g,
    (match) => {
      if (match.startsWith('"') && match.endsWith(':')) {
        const key = match.replace(/\s*:$/, '')
        return `<span class="text-[var(--color-text-highlight-default)]">${key}</span>${match.slice(key.length)}`
      }
      return `<span class="text-[var(--color-text-primary-default)]">${match}</span>`
    },
  )
}

/** Each JSON line pretty-printed and highlighted; a file that is not JSON
 *  lines reads as plain text. */
function previewHtml(text: string): string {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  try {
    return lines.map((line) => highlightJson(JSON.stringify(JSON.parse(line), null, 2))).join('\n\n')
  } catch {
    return escapeHtml(text)
  }
}

function download(file: File) {
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  anchor.click()
  URL.revokeObjectURL(url)
}

/**
 * Document Preview, taken from the CMS prototype's `AssetPreviewModal`
 * (`~/kkdevmode/CMS/src/components/asset/AssetPreviewModal.tsx`, board
 * `66:17371`): webds `confirm-dialog` (`sectioned`), 1200 wide.
 *
 *   title    "Document Preview" (Body S, Text/Tertiary) over the file name
 *   content  a 600-tall pane on Surface/Secondary, p 24, scrolling — the
 *            file's own text, JSON keys on Text/Highlight
 *   actions  Outline **Download** with its download mark, then **OK**
 *
 * CMS's "Reference ID" line is left out: CNH files carry none. Unlike CMS,
 * the pane shows the picked file's real content, not mock copy.
 */
export function FilePreviewDialog({ file, onClose }: { file: File | null; onClose: () => void }) {
  const [html, setHtml] = useState('')
  useEffect(() => {
    if (!file) return
    let live = true
    file.text().then((text) => live && setHtml(previewHtml(text)))
    return () => {
      live = false
      setHtml('')
    }
  }, [file])

  if (!file) return null
  return (
    <ConfirmDialog
      open
      anatomy="sectioned"
      layer="fixed"
      width={1200}
      title={
        // ConfirmDialog wraps `title` in an <h2>, so phrasing content only.
        <span className="flex flex-col gap-[var(--space-1)]">
          <span className="type-body-s text-[var(--color-text-tertiary-default)]">{PREVIEW_COPY.eyebrow}</span>
          <span className="min-w-px break-all">{file.name}</span>
        </span>
      }
      onDismiss={onClose}
      actions={
        <>
          <OutlineButton onClick={() => download(file)}>
            {PREVIEW_COPY.download}
            <Icon slug="download" size={16} color="var(--color-icon-highlight-default)" />
          </OutlineButton>
          <Button onClick={onClose}>{PREVIEW_COPY.ok}</Button>
        </>
      }
    >
      {/* 600 — the board's content pane; no token. */}
      <span className="block h-[600px]">
        <span className="block h-full overflow-auto bg-[var(--color-surface-secondary-default)] p-[var(--space-6)]">
          <pre
            className="whitespace-pre-wrap break-all font-[inherit] type-body-m text-[var(--color-text-primary-default)]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </span>
      </span>
    </ConfirmDialog>
  )
}
