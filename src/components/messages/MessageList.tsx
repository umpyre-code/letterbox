import {
  Container,
  createStyles,
  Divider,
  List,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { Message } from '../../store/models/messages'
import { Emoji } from '../widgets/Emoji'
import { MessageListItem } from './MessageListItem'

interface Props {
  button: boolean
  shaded: boolean
}

interface PropsFromState {
  messages: Message[]
  messageType: string
}

type AllProps = Props & PropsFromState

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

export const MessageList: React.FunctionComponent<AllProps> = ({
  button,
  messages,
  messageType,
  shaded
}) => {
  const classes = useStyles({})

  function renderInner() {
    if (messages.length > 0) {
      return (
        <List className={classes.list}>
          {messages.map((message, index) => (
            <React.Fragment key={message.hash}>
              {index > 0 && <Divider />}
              <MessageListItem message={message} shaded={shaded} button={button} />
            </React.Fragment>
          ))}
        </List>
      )
    } else {
      return (
        <Container style={{ padding: 5 }}>
          <Typography className={classes.noMessages}>
            no {messageType} messages <Emoji ariaLabel="smile">😀</Emoji>
          </Typography>
        </Container>
      )
    }
  }

  return <Paper className={classes.root}>{renderInner()}</Paper>
}
