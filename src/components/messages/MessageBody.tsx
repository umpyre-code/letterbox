import { Box } from '@material-ui/core'
import * as React from 'react'
import { markdownToHtml } from '../../util/markdownToHtml'

interface MessageBodyProps {
  body: string
}

const MessageBody: React.FunctionComponent<MessageBodyProps> = ({ body }) => (
  // tslint:disable-next-line: react-no-dangerous-html
  <Box dangerouslySetInnerHTML={{ __html: markdownToHtml(body) }} />
)

export default MessageBody
