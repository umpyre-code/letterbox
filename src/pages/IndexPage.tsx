import {
  Container,
  createStyles,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core'
import Fab from '@material-ui/core/Fab'
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep'
import Edit from '@material-ui/icons/Edit'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import ClientInit from '../components/ClientInit'
import { DraftList } from '../components/drafts/DraftList'
import { DefaultLayout } from '../components/layout/DefaultLayout'
import { MessageList } from '../components/messages/MessageList'
import PhoneVerification from '../components/widgets/PhoneVerification'
import { ApplicationState } from '../store/ApplicationState'
import { addDraftRequest } from '../store/drafts/actions'
import { deleteSweepRequest } from '../store/messages/actions'
import { Draft } from '../store/drafts/types'
import { MessagesState } from '../store/messages/types'
import { Balance } from '../store/models/account'
import { ClientProfile } from '../store/models/client'
import { updateFavicon } from '../util/favicon'

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
  deleteSweep: typeof deleteSweepRequest
}

type AllProps = PropsFromState & PropsFromDispatch

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    composeButton: {
      bottom: theme.spacing(4),
      margin: '0 auto',
      position: 'fixed',
      right: theme.spacing(4),
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
    },
    deleteSweepButton: {
      float: 'right',
      height: 36,
      margin: 0,
      width: 36,
      padding: theme.spacing(1)
    }
  })
)

interface DeleteSweepProps {
  deleteSweep: typeof deleteSweepRequest
}

const DeleteSweep: React.FC<DeleteSweepProps> = ({ deleteSweep }) => {
  const classes = useStyles({})

  return (
    <Tooltip title="Delete remaining unread messages">
      <IconButton
        className={classes.deleteSweepButton}
        aria-label="delete sweep"
        onClick={event => {
          event.stopPropagation()
          deleteSweep()
        }}
      >
        <DeleteSweepIcon />
      </IconButton>
    </Tooltip>
  )
}

const IndexPageFC: React.FC<AllProps> = ({
  addDraft,
  balance,
  clientReady,
  credentialsReady,
  deleteSweep,
  drafts,
  messagesState,
  profile,
  reload
}) => {
  const classes = useStyles({})

  React.useEffect(() => {
    // Update favicon
    updateFavicon(messagesState.unreadMessages.length)
  }, [messagesState.unreadMessages.length])

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
      <>
        {drafts.length > 0 && (
          <>
            <Container className={classes.draftContainer}>
              <Typography>Drafts</Typography>
              <DraftList />
            </Container>
            <Divider />
          </>
        )}
        <Container className={classes.messageListContainer}>
          <Grid container justify="space-between" alignItems="flex-end">
            <Grid item>
              <Typography>Unread</Typography>
            </Grid>
            <Grid item xs>
              <DeleteSweep deleteSweep={deleteSweep} />
            </Grid>
          </Grid>
          <MessageList
            messages={messagesState.unreadMessages}
            messageType="unread"
            shaded={false}
            button
          />
        </Container>
        {messagesState.readMessages.length > 0 && (
          <>
            <Container className={classes.messageListContainer}>
              <Typography>Read</Typography>
              <MessageList messages={messagesState.readMessages} messageType="read" shaded button />
            </Container>
          </>
        )}
        <Tooltip title="Compose a new message">
          <Fab
            className={classes.composeButton}
            color="primary"
            aria-label="Compose"
            onClick={() => addDraft()}
          >
            <Edit />
          </Fab>
        </Tooltip>
      </>
    )
  }

  return (
    <ClientInit>
      <DefaultLayout balance={balance} profile={profile}>
        {getBody()}
      </DefaultLayout>
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
  addDraft: addDraftRequest,
  deleteSweep: deleteSweepRequest
}

const IndexPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(IndexPageFC)
export default IndexPage
