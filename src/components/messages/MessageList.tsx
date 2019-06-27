import * as React from 'react'
import { ApplicationState } from '../../store'
import { connect } from 'react-redux'
import { MessagesState } from '../../store/messages/types'
import MessageBody from './MessageBody'
import { Box, Paper, makeStyles, Theme, createStyles, Typography } from '@material-ui/core'

interface PropsFromState {
  messagesState: MessagesState
}

type AllProps = PropsFromState

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1, 1)
    }
  })
)

const MessageList: React.FunctionComponent<AllProps> = ({ messagesState }) => {
  const classes = useStyles()

  return (
    <Box>
      {messagesState.messages.map((message, index) => {
        return (
          <Paper key={index}>
            <Typography variant="h2" component="h2">
              {message.from}
            </Typography>
            <br />
            <MessageBody body={message.body} />
          </Paper>
        )
      })}
    </Box>
  )
}

const mapStateToProps = ({ messagesState }: ApplicationState) => ({
  messagesState: messagesState
})

export default connect(mapStateToProps)(MessageList)
