import {
  Box,
  createStyles,
  Divider,
  List,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core'
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
    list: {
      padding: theme.spacing(0),
      width: '100%'
    },
    noMessages: {
      color: '#aaa',
      padding: theme.spacing(1),
      textAlign: 'center'
    },
    root: {
      display: 'flex',
      overflow: 'auto',
      padding: theme.spacing(0)
    }
  })
)

const MessageListFC: React.FunctionComponent<AllProps> = ({ messagesState }) => {
  const classes = useStyles()

  function renderInner() {
    if (messagesState.messages.length > 0) {
      return (
        <List className={classes.list}>
          {messagesState.messages.map((message, index) => (
            <React.Fragment>
              {index > 0 && <Divider />}
              <MessageListItem message={message} key={message.hash} />
            </React.Fragment>
          ))}
        </List>
      )
    } else {
      return <Typography className={classes.noMessages}>no messages 😀</Typography>
    }
  }

  return <Paper className={classes.root}>{renderInner()}</Paper>
}

const mapStateToProps = ({ messagesState }: ApplicationState) => ({
  messagesState
})

export const MessageList = connect(mapStateToProps)(MessageListFC)
