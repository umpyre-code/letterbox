import * as React from 'react'
import * as marked from 'marked'
import { Box } from '@material-ui/core'

interface MessageBodyProps {
  body: string
}

function markdownToHtml(body: string): string {
  marked.setOptions({
    highlight: function(code) {
      return require('highlight.js').highlightAuto(code).value
    },
    sanitize: true,
    sanitizer: function(html) {
      return require('dompurify').sanitize(html)
    }
  })
  return marked.parse(body)
}

const MessageBody: React.FunctionComponent<MessageBodyProps> = ({ body }) => (
  <Box dangerouslySetInnerHTML={{ __html: markdownToHtml(body) }} />
)

export default MessageBody
