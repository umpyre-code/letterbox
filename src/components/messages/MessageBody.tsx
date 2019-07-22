import { Box, Typography } from '@material-ui/core'
import * as React from 'react'
import { MessageBody } from '../../store/models/messages'
import { markdownToHtml } from '../../util/markdownToHtml'

interface MessageBodyProps {
  body: MessageBody
}

const MessageBody: React.FunctionComponent<MessageBodyProps> = ({ body }) => {
  return (
    <Box>
      {/* tslint:disable-next-line: react-no-dangerous-html */}
      <Typography dangerouslySetInnerHTML={{ __html: markdownToHtml(body.markdown) }} />
    </Box>
  )
}

export default MessageBody
