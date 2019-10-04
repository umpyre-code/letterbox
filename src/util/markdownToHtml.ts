import marked from 'marked'
import DOMPurify from 'dompurify'
import { toJumboEmoji } from './toJumboEmoji'

export function markdownToHtml(body: string): string {
  const dompurify = DOMPurify

  dompurify.removeAllHooks()
  dompurify.addHook('afterSanitizeAttributes', (node: Element) => {
    const element = node as HTMLAnchorElement
    if (element) {
      // set all elements owning target to target=_blank
      if ('target' in node && !element.href.startsWith('/')) {
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

  const html = marked.parse(body, {
    // highlight: code => {
    //   return highlight.highlightAuto(code).value
    // }
  })

  return dompurify.sanitize(toJumboEmoji(html))
}
