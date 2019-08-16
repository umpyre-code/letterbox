import {
  Button,
  Container,
  createStyles,
  CssBaseline,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core'
import ArrowBack from '@material-ui/icons/ArrowBack'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import ClientInit from '../components/ClientInit'
import MessageBodyFc from '../components/messages/MessageBodyFc'
import { MessageListItem } from '../components/messages/MessageListItem'
import { Profile } from '../components/widgets/profile/Profile'
import { ApplicationState } from '../store/ApplicationState'
import { loadMessagesRequest, messageReadRequest } from '../store/messages/actions'
import { Balance } from '../store/models/account'
import { ClientProfile } from '../store/models/client'
import { DecryptedMessage } from '../store/models/messages'

interface PropsFromState {
  balance?: Balance
  profile?: ClientProfile
  loadedMessages: DecryptedMessage[]
}

interface PropsFromDispatch {
  messageRead: typeof messageReadRequest
  loadMessages: typeof loadMessagesRequest
}

interface MatchParams {
  readonly messageHash: string
}

type AllProps = PropsFromState & PropsFromDispatch & Router.RouteComponentProps<MatchParams>

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    bodyContainer: {
      padding: theme.spacing(1)
    },
    headerContainer: {
      padding: theme.spacing(1)
    }
  })
)

const MessagePageFC: React.FC<AllProps> = ({
  balance,
  history,
  match,
  loadedMessages,
  loadMessages,
  messageRead,
  profile
}) => {
  const classes = useStyles({})
  const { messageHash } = match.params

  React.useEffect(() => {
    loadMessages(messageHash)
    messageRead(messageHash)
  }, [messageHash])

  function messageBodies() {
    return loadedMessages.map(message => (
      <Container className={classes.bodyContainer} key={message.hash}>
        <Paper>
          <MessageListItem message={message} shaded={false} button={false} />
          <Divider />
          <MessageBodyFc body={message.body} />
        </Paper>
      </Container>
    ))
  }

  return (
    <ClientInit>
      <CssBaseline />
      <Container className={classes.headerContainer}>
        <Grid container spacing={1} justify="space-between">
          <Grid item xs={7}>
            <Typography variant="h2" component="h2">
              <strong>
                <Router.Link to="/">Umpyre</Router.Link>
              </strong>
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Profile profile={profile} balance={balance} menu />
          </Grid>
          <Grid item xs style={{ position: 'relative' }} />
          <Grid item xs={12}>
            <Divider />
          </Grid>
        </Grid>
      </Container>
      <Container>
        <Button
          onClick={() => {
            if (history.length > 0) {
              history.goBack()
            } else {
              history.push('/')
            }
          }}
        >
          <ArrowBack /> Back
        </Button>
        {messageBodies()}
      </Container>
    </ClientInit>
  )
}

const mapStateToProps = ({ accountState, clientState, messagesState }: ApplicationState) => ({
  balance: accountState.balance,
  credentials: clientState.credentials,
  profile: clientState.profile,
  loadedMessages: messagesState.loadedMessages
})

const mapDispatchToProps = {
  messageRead: messageReadRequest,
  loadMessages: loadMessagesRequest
}

const MessagePage = Router.withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MessagePageFC)
)
export default MessagePage
