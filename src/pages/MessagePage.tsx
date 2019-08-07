import {
  Container,
  createStyles,
  CssBaseline,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Theme,
  Typography,
  Button
} from '@material-ui/core'
import ArrowBack from '@material-ui/icons/ArrowBack'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import ClientInit from '../components/ClientInit'
import MessageBody from '../components/messages/MessageBody'
import { Profile } from '../components/widgets/profile/Profile'
import { db } from '../db/db'
import { ApplicationState } from '../store'
import { messageReadRequest } from '../store/messages/actions'
import { Balance } from '../store/models/account'
import { ClientCredentials, ClientProfile } from '../store/models/client'
import { Message } from '../store/models/messages'
import { MessageListItem } from '../components/messages/MessageListItem'

interface Props {}

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

interface PropsFromRouter extends Router.RouteComponentProps<MatchParams> {}

type AllProps = Props & PropsFromState & PropsFromDispatch & PropsFromRouter

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
  const classes = useStyles()
  const [messages, setMessages] = React.useState<Message[]>([])

  React.useEffect(() => {
    // need to wait until creds have loaded
    if (credentials) {
      const message_hash = match.params.message_hash
      async function fetchMessages() {
        const thisMessageBody = await db.messageBodies.get(message_hash)
        const thisMessage = await db.messageInfos.get(message_hash)
        if (thisMessageBody && thisMessage) {
          if (!thisMessage.read) {
            // mark as read
            messageRead(thisMessage.hash!)
          }
          setMessages([{ ...thisMessage, body: thisMessageBody.body }])
        }
        return Promise.resolve()
      }
      fetchMessages()
    }
  }, [credentials, match.params.message_hash])

  function messageBodies() {
    return messages.map((message, index) => (
      <Container className={classes.bodyContainer} key={index}>
        <Paper>
          <MessageListItem message={message} shaded={false} button={false} />
          <MessageBody body={message.body!} />
        </Paper>
      </Container>
    ))
  }

  return (
    <ClientInit>
      <React.Fragment>
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
            <Grid item xs style={{ position: 'relative' }}></Grid>
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
      </React.Fragment>
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
