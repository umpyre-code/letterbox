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
import { Elements, StripeProvider } from 'react-stripe-elements'
import AddCreditsForm from '../components/AddCreditsForm'
import { DraftList } from '../components/drafts/DraftList'
import { MessageList } from '../components/messages/MessageList'
import { Profile } from '../components/widgets/profile/Profile'
import { ApplicationState } from '../store'
import { addDraftRequest } from '../store/drafts/actions'
import { Balance, ClientProfile } from '../store/models/client'

interface PropsFromState {
  balance?: Balance
  profile: ClientProfile
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

const IndexPageFC: React.FC<AllProps> = ({ balance, profile, addDraft }) => {
  const classes = useStyles()

  return (
    <React.Fragment>
      <CssBaseline />
      <Container className={classes.headerContainer}>
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
      <Container className={classes.draftContainer}>
        <DraftList />
      </Container>
      <Container className={classes.messageListContainer}>
        <MessageList />
      </Container>
      {/* <Container>
        <StripeProvider apiKey="pk_test_bbhXx2DXVnIK9APra7aYZ5b300f6g4dxXR">
          <div className="example">
            <h1>React Stripe Elements Example</h1>
            <Elements>
              <AddCreditsForm />
            </Elements>
          </div>
        </StripeProvider>
      </Container> */}
    </React.Fragment>
  )
}

const mapStateToProps = ({ clientState, accountState }: ApplicationState) => ({
  balance: accountState.balance!,
  profile: clientState.profile!
})

const mapDispatchToProps = {
  addDraft: addDraftRequest
}

const IndexPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(IndexPageFC)
export default IndexPage
