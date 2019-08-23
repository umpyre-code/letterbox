import { Box, createStyles, makeStyles, Theme, Typography } from '@material-ui/core'
import * as React from 'react'
import { MessageBody } from '../../store/models/messages'
import { markdownToHtml } from '../../util/markdownToHtml'

interface MessageBodyProps {
  body: MessageBody
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    bodyBox: {
      padding: theme.spacing(1, 3, 1, 3)
    },
    messageBody: {
      '& a:link': {
        textDecoration: 'underline'
      },
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
      ].join(','),
      '& blockquote': {
        background: '#fafafa',
        borderLeft: '6px solid #eaeaea',
        padding: theme.spacing(1)
      }
    }
  })
)

const MessageBodyFc: React.FunctionComponent<MessageBodyProps> = ({ body }) => {
  const classes = useStyles({})
  return (
    <Box className={classes.bodyBox}>
      <Typography
        className={classes.messageBody}
        dangerouslySetInnerHTML={{ __html: markdownToHtml(body.markdown) }}
      />
    </Box>
  )
}

export default MessageBodyFc
