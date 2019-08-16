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
import { MessageListItem } from '../components/messages/MessageListItem'
import { Profile } from '../components/widgets/profile/Profile'
import { db } from '../db/db'
import { ApplicationState } from '../store/ApplicationState'
import { messageReadRequest } from '../store/messages/actions'
import { Balance } from '../store/models/account'
import { ClientCredentials, ClientProfile } from '../store/models/client'
import { Message } from '../store/models/messages'

interface PropsFromState {
  balance?: Balance
  credentials?: ClientCredentials
  profile?: ClientProfile
}

interface PropsFromDispatch {
  messageRead: typeof messageReadRequest
}

interface MatchParams {
  readonly message_hash: string
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
  credentials,
  history,
  match,
  messageRead,
  profile
}) => {
  const classes = useStyles({})
  const [messages, setMessages] = React.useState<Message[]>([])

  async function fetchMessages() {
    const messageHash = match.params.message_hash
    const thisMessageBody = await db.messageBodies.get(messageHash)
    const thisMessage = await db.messageInfos.get(messageHash)
    if (thisMessageBody && thisMessage) {
      if (!thisMessage.read) {
        // mark as read
        messageRead(thisMessage.hash!)
      }
      setMessages([{ ...thisMessage, body: thisMessageBody.body }])
    }
    return Promise.resolve()
  }

  React.useEffect(() => {
    // need to wait until creds have loaded
    if (credentials) {
      fetchMessages()
    }
  }, [credentials, match.params.message_hash])

  function messageBodies() {
    return messages.map((message, index) => (
      <Container className={classes.bodyContainer} key={message.hash}>
        <Paper>
          <MessageListItem message={message} shaded={false} button={false} />
          {/* <MessageBodyFc body={message.body!} /> */}
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

const mapStateToProps = ({ accountState, clientState }: ApplicationState) => ({
  balance: accountState.balance,
  credentials: clientState.credentials,
  profile: clientState.profile
})

const mapDispatchToProps = {
  messageRead: messageReadRequest
}

const MessagePage = Router.withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MessagePageFC)
)
export default MessagePage
