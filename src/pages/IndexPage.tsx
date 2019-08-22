import {
  Container,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
  Link,
  CssBaseline
} from '@material-ui/core'
import Fab from '@material-ui/core/Fab'
import Edit from '@material-ui/icons/Edit'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import ClientInit from '../components/ClientInit'
import { DraftList } from '../components/drafts/DraftList'
import { MessageList } from '../components/messages/MessageList'
import PhoneVerification from '../components/widgets/PhoneVerification'
import { Profile } from '../components/widgets/profile/Profile'
import { ApplicationState } from '../store/ApplicationState'
import { addDraftRequest } from '../store/drafts/actions'
import { Draft } from '../store/drafts/types'
import { MessagesState } from '../store/messages/types'
import { Balance } from '../store/models/account'
import { ClientProfile } from '../store/models/client'
import { Logotype } from '../components/widgets/Logotype'

interface PropsFromState {
  balance?: Balance
  clientLoading: boolean
  clientReady: boolean
  credentialsReady: boolean
  drafts: Draft[]
  messagesState: MessagesState
  profile: ClientProfile
  reload: boolean
}

interface PropsFromDispatch {
  addDraft: typeof addDraftRequest
}

type AllProps = PropsFromState & PropsFromDispatch

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    composeButton: {
      bottom: theme.spacing(3),
      margin: '0 auto',
      position: 'fixed',
      right: theme.spacing(3),
      zIndex: 1
    },
    draftContainer: {
      padding: theme.spacing(1)
    },
    footerContainer: {
      padding: theme.spacing(5, 0, 0, 0)
    },
    headerContainer: {
      padding: theme.spacing(1)
    },
    messageListContainer: {
      padding: theme.spacing(1)
    }
  })
)

const IndexPageFC: React.FC<AllProps> = ({
  addDraft,
  balance,
  clientReady,
  credentialsReady,
  drafts,
  messagesState,
  profile,
  reload
}) => {
  const classes = useStyles({})

  if (reload) {
    // force a page reload
    window.location.reload(true)
  }

  if (credentialsReady && clientReady && !profile) {
    // ready without a profile? redirect to sign up page
    return <Router.Redirect to="/signup" />
  }

  function getBody() {
    if (profile && !profile.phone_sms_verified) {
      return <PhoneVerification />
    }
    return (
      <React.Fragment>
        {drafts.length > 0 && (
          <React.Fragment>
            <Container className={classes.draftContainer}>
              <Typography>Drafts</Typography>
              <DraftList />
            </Container>
            <Divider />
          </React.Fragment>
        )}
        <Container className={classes.messageListContainer}>
          <Typography>Unread</Typography>
          <MessageList
            messages={messagesState.unreadMessages}
            messageType="unread"
            shaded={false}
            button
          />
        </Container>
        {messagesState.readMessages.length > 0 && (
          <React.Fragment>
            <Container className={classes.messageListContainer}>
              <Typography>Read</Typography>
              <MessageList messages={messagesState.readMessages} messageType="read" shaded button />
            </Container>
          </React.Fragment>
        )}
        {messagesState.sentMessages.length > 0 && (
          <Container className={classes.messageListContainer}>
            <Typography>Sent</Typography>
            <MessageList messages={messagesState.sentMessages} messageType="sent" shaded button />
          </Container>
        )}
        <Tooltip title="Compose a new message">
          <Fab
            className={classes.composeButton}
            color="primary"
            aria-label="Compose"
            onClick={addDraft}
          >
            <Edit />
          </Fab>
        </Tooltip>
      </React.Fragment>
    )
  }

  return (
    <ClientInit>
      <CssBaseline />
      <Container className={classes.headerContainer}>
        <Grid container spacing={1} justify="space-between" alignItems="flex-start">
          <Grid item>
            <Router.Link to="/">
              <Logotype />
            </Router.Link>
          </Grid>
          <Grid item>
            <Profile profile={profile} balance={balance} menu />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
        </Grid>
      </Container>
      {getBody()}
      <Container className={classes.footerContainer}>
        <Grid container justify="center" alignItems="center" spacing={2}>
          <Grid item>
            <Router.Link to="/about">
              <Typography variant="subtitle1">About</Typography>
            </Router.Link>
          </Grid>
          <Grid item>
            <Divider orientation="vertical" style={{ height: 15 }} />
          </Grid>
          <Grid item>
            <Link href="https://blog.umpyre.com" variant="subtitle2" underline="none">
              <Typography variant="subtitle1">Blog</Typography>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </ClientInit>
  )
}

const mapStateToProps = ({
  draftsState,
  messagesState,
  accountState,
  clientState
}: ApplicationState) => ({
  balance: accountState.balance,
  clientLoading: clientState.clientLoading,
  clientReady: clientState.clientReady,
  credentialsReady: clientState.credentialsReady,
  drafts: draftsState.drafts,
  messagesState,
  profile: clientState.profile,
  reload: clientState.reload
})

const mapDispatchToProps = {
  addDraft: addDraftRequest
}

const IndexPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(IndexPageFC)
export default IndexPage
