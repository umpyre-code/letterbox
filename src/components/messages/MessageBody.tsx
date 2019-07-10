import { Box, Typography } from '@material-ui/core'
import * as React from 'react'
import { markdownToHtml } from '../../util/markdownToHtml'

export interface MessageBodyModel {
  markdown: string
}

interface MessageBodyProps {
  body: string
}

const MessageBody: React.FunctionComponent<MessageBodyProps> = ({ body }) => {
  const messageBody: MessageBodyModel = JSON.parse(body)
  return (
    <Box>
      {/* tslint:disable-next-line: react-no-dangerous-html */}
      <Typography dangerouslySetInnerHTML={{ __html: markdownToHtml(messageBody.markdown) }} />
    </Box>
  )
}

export default MessageBody
