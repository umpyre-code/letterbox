import * as React from 'react'
import styled from '../../utils/styled'
import { ApplicationState } from '../../store'
import { connect } from 'react-redux'
import { MessagesState } from '../../store/messages/types'
import MessageBody from './MessageBody'
import { Paper } from '@material-ui/core'

interface PropsFromState {
  messagesState: MessagesState
}

type AllProps = PropsFromState

const MessageList: React.FunctionComponent<AllProps> = ({ messagesState }) => (
  <MessageListWrapper>
    {messagesState.messages.map((message, index) => {
      return (
        <Paper key={index}>
          {message.from}
          <br />
          <MessageBody body={message.body} />
        </Paper>
      )
    })}
  </MessageListWrapper>
)

const mapStateToProps = ({ messagesState }: ApplicationState) => ({
  messagesState: messagesState
})

export default connect(mapStateToProps)(MessageList)

const MessageListWrapper = styled('div')``
