import {
  Container,
  createStyles,
  CssBaseline,
  Divider,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { Elements, StripeProvider } from 'react-stripe-elements'
import AddCreditsForm from '../components/forms/AddCreditsForm'
import Loading from '../components/widgets/Loading'
import { ApplicationState } from '../store'
import { addDraftRequest } from '../store/drafts/actions'
import { Balance, ClientProfile } from '../store/models/client'
import { loadScript } from '../util/loadScript'

const STRIPE_API_PK = process.env.STRIPE_API_PK || 'pk_test_bbhXx2DXVnIK9APra7aYZ5b300f6g4dxXR'

interface PropsFromState {
  balance?: Balance
  profile: ClientProfile
}

interface PropsFromDispatch {}

type AllProps = PropsFromState & PropsFromDispatch

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    bodyContainer: { padding: theme.spacing(5) },
    bodyContentContainer: { padding: theme.spacing(0, 0, 3, 0) },
    composeButton: {
      bottom: theme.spacing(2),
      margin: '0 auto',
      position: 'fixed',
      right: theme.spacing(2),
      zIndex: 1
    },
    draftContainer: { padding: theme.spacing(1) },
    headerContainer: { padding: theme.spacing(1) },
    messageListContainer: { padding: theme.spacing(1) }
  })
)

const AddCreditsPageFC: React.FC<AllProps> = ({ balance, profile }) => {
  const [stripe, setStripe] = React.useState(null)
  const classes = useStyles()

  function stripeLoaded() {
    setStripe(window.Stripe(STRIPE_API_PK))
  }

  React.useEffect(() => {
    loadScript('https://js.stripe.com/v3/', 'stripe-js', stripeLoaded)
  }, [])

  if (balance) {
    return (
      <React.Fragment>
        <CssBaseline />
        <Container className={classes.headerContainer}>
          <Typography variant="h2" component="h2">
            <strong>
              <Router.Link to="/">Umpyre</Router.Link>
            </strong>
          </Typography>
        </Container>
        <Divider />
        <Container className={classes.bodyContainer}>
          <Container className={classes.bodyContentContainer}>
            <Typography variant="h4">Add credits</Typography>
          </Container>
          <Container className={classes.bodyContentContainer}>
            {stripe !== null && (
              <StripeProvider stripe={stripe}>
                <Elements>
                  <AddCreditsForm balance={balance} />
                </Elements>
              </StripeProvider>
            )}
          </Container>
        </Container>
      </React.Fragment>
    )
  } else {
    return <Loading />
  }
}

const mapStateToProps = ({ clientState, accountState }: ApplicationState) => ({
  balance: accountState.balance!,
  profile: clientState.profile!
})

const mapDispatchToProps = {
  addDraft: addDraftRequest
}

const AddCreditsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(AddCreditsPageFC)
export default AddCreditsPage
