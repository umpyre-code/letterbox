import * as React from 'react'
import { ApplicationState } from '../../store'
import { connect } from 'react-redux'
import { MessagesState } from '../../store/messages/types'
import MessageBody from './MessageBody'
import { Box, Paper } from '@material-ui/core'

interface PropsFromState {
  messagesState: MessagesState
}

type AllProps = PropsFromState

const MessageList: React.FunctionComponent<AllProps> = ({ messagesState }) => (
  <Box>
    {messagesState.messages.map((message, index) => {
      return (
        <Paper key={index}>
          {message.from}
          <br />
          <MessageBody body={message.body} />
        </Paper>
      )
    })}
  </Box>
)

const mapStateToProps = ({ messagesState }: ApplicationState) => ({
  messagesState: messagesState
})

export default connect(mapStateToProps)(MessageList)
