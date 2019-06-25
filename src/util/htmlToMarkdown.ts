import dompurify from 'dompurify'
import TurndownService from 'turndown'

const turndown = new TurndownService({ linkStyle: 'referenced' })

export function htmlToMarkdown(html: string): string {
  const sanitizedHtml = dompurify.sanitize(html)
  return turndown.turndown(sanitizedHtml)
}
