import marked from 'marked'
import DOMPurify from 'dompurify'
// import highlight from 'highlight.js'

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

  const html = marked.parse(body, {
    // highlight: code => {
    //   return highlight.highlightAuto(code).value
    // }
  })

  // Find all consecutive emojis, replace with jumbo emojis 😎
  const emojiRegex = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]+/gu
  return dompurify.sanitize(
    html.replace(emojiRegex, '<span role="img" class="jumbo-emoji">$&</span>')
  )
}
