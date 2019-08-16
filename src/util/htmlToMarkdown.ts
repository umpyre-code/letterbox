import dompurify from 'dompurify'
import turndown from 'turndown'

// eslint-disable-next-line new-cap
const td = new turndown({ linkStyle: 'referenced' })

export function htmlToMarkdown(html: string): string {
  const sanitizedHtml = dompurify.sanitize(html)
  return td.turndown(sanitizedHtml)
}
