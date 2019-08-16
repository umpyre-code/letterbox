import marked from 'marked'
import dompurify from 'dompurify'
import highlight from 'highlight.js'

export function markdownToHtml(body: string): string {
  marked.setOptions({
    highlight: code => {
      return highlight.highlightAuto(code).value
    },
    sanitize: true,
    sanitizer: html => {
      return dompurify.sanitize(html)
    }
  })
  return marked.parse(body)
}
