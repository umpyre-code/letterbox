import { Container, createStyles, makeStyles, Theme, Typography } from '@material-ui/core'
import qs from 'qs'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { Elements, StripeProvider } from 'react-stripe-elements'
import ClientInit from '../components/ClientInit'
import AddCreditsForm from '../components/forms/AddCreditsForm'
import { DefaultLayout } from '../components/layout/DefaultLayout'
import Loading from '../components/widgets/Loading'
import { ApplicationState } from '../store/ApplicationState'
import { addDraftRequest } from '../store/drafts/actions'
import { Balance } from '../store/models/account'
import { ClientProfile } from '../store/models/client'
import { loadScript } from '../util/loadScript'

const STRIPE_API_PK = process.env.STRIPE_API_PK || 'invalid key'

interface PropsFromState {
  balance?: Balance
  profile?: ClientProfile
}

type AllProps = PropsFromState & Router.RouteComponentProps<{}>

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    bodyContainer: { padding: theme.spacing(1) },
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

const AddCreditsPageFC: React.FC<AllProps> = ({ balance, location, profile }) => {
  const [stripe, setStripe] = React.useState(null)
  const classes = useStyles({})

  const searchParams = qs.parse(location.search, { ignoreQueryPrefix: true })
  const amountCents = Number(searchParams.amountCents)

  function stripeLoaded(): void {
    setStripe((window as any).Stripe(STRIPE_API_PK))
  }

  React.useEffect(() => {
    loadScript('https://js.stripe.com/v3/', 'stripe-js', stripeLoaded)
  }, [])

  React.useEffect(
    () => () => {
      delete (window as any).Stripe
      const stripeIframes = [
        document.querySelectorAll('[name^=__privateStripeMetricsController]'),
        document.querySelectorAll('[name^=__privateStripeController]')
      ]

      stripeIframes.forEach(iframes =>
        iframes.forEach(iframe => {
          iframe.parentNode.removeChild(iframe)
        })
      )

      delete (window as any).Stripe
    },
    []
  )

  if (balance) {
    return (
      <ClientInit>
        <DefaultLayout profile={profile} balance={balance}>
          <Container className={classes.bodyContainer}>
            <Container className={classes.bodyContentContainer}>
              <Typography variant="h4">Add credits</Typography>
            </Container>
            <Container className={classes.bodyContentContainer}>
              {stripe !== null && (
                <StripeProvider stripe={stripe}>
                  <Elements>
                    <AddCreditsForm balance={balance} amountCents={amountCents} />
                  </Elements>
                </StripeProvider>
              )}
            </Container>
          </Container>
        </DefaultLayout>
      </ClientInit>
    )
  }
  return (
    <ClientInit>
      <Loading centerOnPage />
    </ClientInit>
  )
}

const mapStateToProps = ({ clientState, accountState }: ApplicationState) => ({
  balance: accountState.balance,
  profile: clientState.profile
})

const mapDispatchToProps = {
  addDraft: addDraftRequest
}

const AddCreditsPage = Router.withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AddCreditsPageFC)
)
export default AddCreditsPage
