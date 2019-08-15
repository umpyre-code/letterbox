import {
  Container,
  createStyles,
  CssBaseline,
  Divider,
  Grid,
  makeStyles,
  Theme,
  Tooltip,
  Typography
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
import { ApplicationState } from '../store'
import { addDraftRequest } from '../store/drafts/actions'
import { MessagesState } from '../store/messages/types'
import { Balance } from '../store/models/account'
import { ClientProfile } from '../store/models/client'

interface PropsFromState {
  balance?: Balance
  clientLoading: boolean
  clientReady: boolean
  credentialsError?: string
  credentialsLoading: boolean
  credentialsReady: boolean
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
      bottom: theme.spacing(2),
      margin: '0 auto',
      position: 'fixed',
      right: theme.spacing(2),
      zIndex: 1
    },
    draftContainer: {
      padding: theme.spacing(1)
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
  messagesState,
  profile,
  clientLoading,
  clientReady,
  credentialsError,
  credentialsLoading,
  credentialsReady,
  reload
}) => {
  const classes = useStyles({})

  if (reload) {
    // force a page reload
    location.reload(true)
  }

  if (credentialsReady && (clientReady || credentialsError) && !profile) {
    // ready without a profile? redirect to sign up page
    return <Router.Redirect to="/signup" />
  }

  function getBody() {
    if (profile && !profile.phone_sms_verified) {
      return <PhoneVerification />
    } else {
      return (
        <React.Fragment>
          <Container className={classes.draftContainer}>
            <DraftList />
          </Container>
          <Container className={classes.messageListContainer}>
            <MessageList
              messages={messagesState.unreadMessages}
              messageType="unread"
              shaded={false}
              button={true}
            />
          </Container>
          <Container className={classes.messageListContainer}>
            <MessageList
              messages={messagesState.readMessages}
              messageType="read"
              shaded={true}
              button={true}
            />
          </Container>
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
          <Grid item xs style={{ position: 'relative' }}></Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
        </Grid>
      </Container>
      {getBody()}
    </ClientInit>
  )
}

const mapStateToProps = ({ clientState, accountState, messagesState }: ApplicationState) => ({
  balance: accountState.balance!,
  clientLoading: clientState.clientLoading,
  clientReady: clientState.clientReady,
  credentialsError: clientState.credentialsError,
  credentialsLoading: clientState.credentialsLoading,
  credentialsReady: clientState.credentialsReady,
  messagesState,
  profile: clientState.profile!,
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
