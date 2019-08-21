import {
  Button,
  Container,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import ReplyIcon from '@material-ui/icons/Reply'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import ClientInit from '../components/ClientInit'
import MessageBodyFc from '../components/messages/MessageBodyFc'
import { MessageListItem } from '../components/messages/MessageListItem'
import { BackButton } from '../components/widgets/BackButton'
import { Profile } from '../components/widgets/profile/Profile'
import { ApplicationState } from '../store/ApplicationState'
import { loadMessagesRequest, messageReadRequest } from '../store/messages/actions'
import { Balance } from '../store/models/account'
import { ClientCredentials, ClientProfile } from '../store/models/client'
import { DecryptedMessage } from '../store/models/messages'

interface PropsFromState {
  balance?: Balance
  credentials?: ClientCredentials
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
    buttonContainer: {
      padding: theme.spacing(1)
    },
    headerContainer: {
      padding: theme.spacing(1)
    }
  })
)

const MessagePageFC: React.FC<AllProps> = ({
  balance,
  credentials,
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
  }, [messageHash, credentials, profile])

  function messageBodies() {
    return loadedMessages.map(message => (
      <Container className={classes.bodyContainer} key={message.hash}>
        <Paper>
          <MessageListItem message={message} shaded={false} button={false} />
          <Divider />
          <MessageBodyFc body={message.body} />
          <Divider />
          <Container className={classes.buttonContainer}>
            <Grid container justify="space-between">
              <Grid item>
                <Button variant="contained" color="primary">
                  <ReplyIcon />
                  Reply
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="secondary">
                  <DeleteIcon />
                  Delete
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Paper>
      </Container>
    ))
  }

  return (
    <ClientInit>
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
      <Container className={classes.bodyContainer}>
        <BackButton />
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
