import marked from 'marked'
import DOMPurify from 'dompurify'
import highlight from 'highlight.js'

export function markdownToHtml(body: string): string {
  const dompurify = DOMPurify

  dompurify.removeAllHooks()
  dompurify.addHook('afterSanitizeAttributes', (node: Element) => {
    const element = node as HTMLElement
    if (element) {
      // set all elements owning target to target=_blank
      if ('target' in node) {
        element.setAttribute('target', '_blank')
        // prevent https://www.owasp.org/index.php/Reverse_Tabnabbing
        element.setAttribute('rel', 'noopener noreferrer')
      }
      // set non-HTML/MathML links to xlink:show=new
      if (
        !element.hasAttribute('target') &&
        (element.hasAttribute('xlink:href') || element.hasAttribute('href'))
      ) {
        element.setAttribute('xlink:show', 'new')
      }
    }
  })

  return dompurify.sanitize(
    marked.parse(body, {
      highlight: code => {
        return highlight.highlightAuto(code).value
      }
    })
  )
}
