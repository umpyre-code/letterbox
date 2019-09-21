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
      '& p': {
        wordWrap: 'break-word',
        hyphens: 'auto'
      },
      '& a:link': {
        textDecoration: 'underline'
      },
      fontSize: '1.1rem',
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
      '& img': {
        padding: theme.spacing(1),
        maxWidth: '100%',
        maxHeight: '100%',
        boxShadow: theme.shadows[3],
        borderRadius: '6px'
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
  if (body.markdown) {
    const html = markdownToHtml(body.markdown)
    return (
      <Box className={classes.bodyBox}>
        <Typography className={classes.messageBody} dangerouslySetInnerHTML={{ __html: html }} />
      </Box>
    )
  }
  return (
    <Box className={classes.bodyBox}>
      <Typography variant="body2">
        <em>can&apos;t load message body</em>
      </Typography>
    </Box>
  )
}

export default MessageBodyFc
