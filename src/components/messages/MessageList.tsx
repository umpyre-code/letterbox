import { createStyles, List, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import { ApplicationState } from '../../store'
import { MessagesState } from '../../store/messages/types'
import { MessageListItem } from './MessageListItem'

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

const MessageListFC: React.FunctionComponent<AllProps> = ({ messagesState }) => {
  const classes = useStyles()

  return (
    <List>
      {messagesState.messages.map(message => (
        <MessageListItem message={message} key={message.hash} />
      ))}
    </List>
  )
}

const mapStateToProps = ({ messagesState }: ApplicationState) => ({
  messagesState
})

export const MessageList = connect(mapStateToProps)(MessageListFC)
