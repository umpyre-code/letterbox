import {
  Box,
  Container,
  createStyles,
  CssBaseline,
  Divider,
  Grid,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { Profile } from '../components/widgets/profile/Profile'
import { db } from '../db/db'
import { ApplicationState } from '../store'
import { Balance } from '../store/models/account'
import { ClientProfile } from '../store/models/client'
import { Message } from '../store/models/messages'

interface Props {}

interface PropsFromState {
  balance?: Balance
  profile?: ClientProfile
}

interface PropsFromDispatch {}

interface MatchParams {
  readonly message_hash: string
}

interface PropsFromRouter extends Router.RouteComponentProps<MatchParams> {}

type AllProps = Props & PropsFromState & PropsFromDispatch & PropsFromRouter

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headerContainer: {
      padding: theme.spacing(1)
    },
    profileContainer: {
      padding: theme.spacing(1)
    }
  })
)

const MessagePageFC: React.FC<AllProps> = ({ balance, match, profile }) => {
  const classes = useStyles()
  const [messages, setMessages] = React.useState<Message[]>([])

  React.useEffect(() => {
    async function fetchMessages() {
      const message_hash = match.params.message_hash
      const thisMessageBody = await db.messageBodies.get(message_hash)
      const thisMessage = await db.messageInfos.get(message_hash)
      if (thisMessageBody && thisMessage) {
        setMessages([{ ...thisMessage, body: thisMessageBody.body }])
      }
      return Promise.resolve()
    }
    fetchMessages()
  }, [match.params.message_hash])

  return (
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
      <Box>{JSON.stringify(messages)}</Box>
    </React.Fragment>
  )
}

const mapStateToProps = ({ accountState, clientState }: ApplicationState) => ({
  balance: accountState.balance,
  profile: clientState.profile
})

const mapDispatchToProps = {}

const MessagePage = Router.withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MessagePageFC)
)
export default MessagePage
