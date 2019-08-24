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
        background: '#f9f9f9',
        margin: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        borderLeft: '2px solid rgb(212, 212, 212)',
        boxShadow:
          '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 1px 0px rgba(0, 0, 0, 0.04), 0px 2px 1px -1px rgba(0, 0, 0, 0.02)'
      },
      '& pre': {
        background: '#f9f9f9',
        margin: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        borderLeft: '2px solid rgb(212, 212, 212)',
        boxShadow:
          '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 1px 0px rgba(0, 0, 0, 0.04), 0px 2px 1px -1px rgba(0, 0, 0, 0.02)'
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
