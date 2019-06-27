import { Box, Typography } from '@material-ui/core'
import * as React from 'react'
import { markdownToHtml } from '../../util/markdownToHtml'

interface MessageBodyProps {
  body: string
}

const MessageBody: React.FunctionComponent<MessageBodyProps> = ({ body }) => (
  <Box>
    {/* tslint:disable-next-line: react-no-dangerous-html */}
    <Typography dangerouslySetInnerHTML={{ __html: markdownToHtml(body) }} />
  </Box>
)

export default MessageBody
