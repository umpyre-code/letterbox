import marked from 'marked'

export function markdownToHtml(body: string): string {
  marked.setOptions({
    highlight: code => {
      return require('highlight.js').highlightAuto(code).value
    },
    sanitize: true,
    sanitizer: html => {
      return require('dompurify').sanitize(html)
    }
  })
  return marked.parse(body)
}
