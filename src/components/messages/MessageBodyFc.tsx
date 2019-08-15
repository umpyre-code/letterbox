import { Box, createStyles, makeStyles, Theme, Typography } from '@material-ui/core'
import * as React from 'react'
import { MessageBody } from '../../store/models/messages'
import { markdownToHtml } from '../../util/markdownToHtml'

interface MessageBodyProps {
  body: MessageBody
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    messageBody: {
      fontFamily: [
        'Aleo',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"'
      ].join(',')
    }
  })
)

const MessageBodyFc: React.FunctionComponent<MessageBodyProps> = ({ body }) => {
  const classes = useStyles({})
  return (
    <Box>
      {/* tslint:disable-next-line: react-no-dangerous-html */}
      <Typography
        className={classes.messageBody}
        dangerouslySetInnerHTML={{ __html: markdownToHtml(body.markdown) }}
      />
    </Box>
  )
}

export default MessageBodyFc
