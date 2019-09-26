import {
  Box,
  CircularProgress,
  createStyles,
  Divider,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
  Link,
  makeStyles,
  Switch,
  TextField,
  Theme,
  Typography
} from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import qs from 'qs'
import * as React from 'react'
import NumberFormat from 'react-number-format'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { Emoji } from '../components/widgets/Emoji'
import Loading from '../components/widgets/Loading'
import {
  fetchConnectAccountRequest,
  postConnectOauthRequest,
  postConnectPrefsRequest
} from '../store/account/actions'
import { ApplicationState } from '../store/ApplicationState'
import { Balance, ConnectAccountInfo } from '../store/models/account'
import { ClientProfile } from '../store/models/client'
import './stripe-connect-button.css'

const sliderStyles = makeStyles({
  input: {
    width: 42
  },
  slider: {
    width: 250
  },
  textField: {
    margin: 0
  }
})

interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void
  onChange: (event: { target: { value: string } }) => void
}

function numberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value
          }
        })
      }}
      thousandSeparator
      prefix="$"
    />
  )
}

interface PayoutSliderProps {
  connectAccount: ConnectAccountInfo
  updatingPrefs: boolean
  updatePrefs: typeof postConnectPrefsRequest
}

const PayoutSlider: React.FC<PayoutSliderProps> = ({
  connectAccount,
  updatingPrefs,
  updatePrefs
}) => {
  const classes = sliderStyles({})
  const [payoutAmount, setPayoutAmount] = React.useState(
    Math.trunc(connectAccount.preferences.automatic_payout_threshold_cents / 100)
  )
  const [wasChanged, setWasChanged] = React.useState(false)
  const handleSliderChange = (event: React.ChangeEvent<{}>, newValue: number | number[]) => {
    if (newValue instanceof Array) {
      setPayoutAmount(newValue[0])
    } else {
      setPayoutAmount(newValue)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let amount = Number(event.target.value)
    if (amount < 100) {
      amount = 100
    }
    updatePrefs({
      ...connectAccount.preferences,
      automatic_payout_threshold_cents: Math.trunc(amount * 100)
    })
    setWasChanged(true)
  }

  const handleBlur = () => {
    if (payoutAmount < 100) {
      setPayoutAmount(100)
    }
  }

  function showProgress() {
    if (updatingPrefs) {
      return <CircularProgress />
    }
    return (
      <Fade timeout={500} in={wasChanged}>
        <Typography style={{ color: 'pink' }}>
          Saved! <Emoji ariaLabel="angel">😇</Emoji>
        </Typography>
      </Fade>
    )
  }

  return (
    <>
      <FormControl component="fieldset">
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={connectAccount.preferences.enable_automatic_payouts}
                onChange={(event, checked) => {
                  updatePrefs({
                    ...connectAccount.preferences,
                    enable_automatic_payouts: checked
                  })
                  setWasChanged(true)
                }}
              />
            }
            label="Enable automatic payouts"
          />
        </FormGroup>
      </FormControl>
      <Typography id="input-slider" gutterBottom>
        Payout threshold
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Slider
            disabled={!connectAccount.preferences.enable_automatic_payouts}
            className={classes.slider}
            value={payoutAmount}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            min={100}
            max={1000}
          />
        </Grid>
        <Grid item>
          <TextField
            disabled={!connectAccount.preferences.enable_automatic_payouts}
            label="Amount"
            variant="outlined"
            margin="dense"
            className={classes.textField}
            value={payoutAmount}
            onBlur={handleBlur}
            onChange={handleInputChange}
            InputProps={{
              'aria-label': 'payout-threshold-amount',
              inputComponent: numberFormatCustom as any
            }}
          />
        </Grid>
        <Grid item>{showProgress()}</Grid>
      </Grid>
    </>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    buttonBox: {
      padding: theme.spacing(2)
    },
    wordBox: {
      padding: theme.spacing(2, 0, 2, 0)
    }
  })
)
interface PayoutPreferencesSectionProps {
  connectAccount: ConnectAccountInfo
  updatingPrefs: boolean
  updatePrefs: typeof postConnectPrefsRequest
}

const PayoutPreferencesSection: React.FC<PayoutPreferencesSectionProps> = ({
  connectAccount,
  updatingPrefs,
  updatePrefs
}) => {
  const classes = useStyles({})

  return (
    <>
      <Box className={classes.wordBox}>
        <Typography variant="h6">Payout preferences</Typography>
      </Box>
      <Divider />
      <Box className={classes.wordBox}>
        <Typography>
          Automatic payouts are processed daily, and are paid when your account balance reaches the
          payout threshold. The minimum payout amount is $100.
        </Typography>
      </Box>
      <Box>
        <PayoutSlider
          connectAccount={connectAccount}
          updatingPrefs={updatingPrefs}
          updatePrefs={updatePrefs}
        />
      </Box>
    </>
  )
}

interface ConnectButtonSectionProps {
  connectAccount: ConnectAccountInfo
  updatingPrefs: boolean
  updatePrefs: typeof postConnectPrefsRequest
}

const ConnectButtonSection: React.FC<ConnectButtonSectionProps> = ({
  connectAccount,
  updatingPrefs,
  updatePrefs
}) => {
  const classes = useStyles({})
  const [autoPayoutsEnabled, setAutoPayoutsEnabled] = React.useState(
    connectAccount.preferences.enable_automatic_payouts
  )

  if (connectAccount.state === 'active') {
    return (
      <>
        <Box className={classes.wordBox}>
          <Typography variant="body1">Your Stripe Connect account is active.</Typography>
        </Box>
        <Box className={classes.buttonBox}>
          <Link
            href={connectAccount.login_link_url}
            target="_blank"
            rel="noopener"
            className="stripe-connect"
          >
            <span>Stripe Connect Dashboard</span>
          </Link>
        </Box>
        <PayoutPreferencesSection
          connectAccount={connectAccount}
          updatingPrefs={updatingPrefs}
          updatePrefs={updatePrefs}
        />
      </>
    )
  }
  if (connectAccount.state === 'ineligible') {
    return (
      <>
        <Box className={classes.wordBox}>
          <Typography variant="body1">
            Your your account is not yet eligible for payouts. Check back when your account is at
            least 7 days old.
          </Typography>
        </Box>
      </>
    )
  }
  if (connectAccount.oauth_url) {
    return (
      <>
        <Box className={classes.wordBox}>
          <Typography variant="body1">
            {"To enable payouts, you'll need a Stripe Connect account."}
          </Typography>
        </Box>
        <Box className={classes.buttonBox}>
          <Link href={connectAccount.oauth_url.replace('[0]', '[]')} className="stripe-connect">
            <span>Connect with Stripe</span>
          </Link>
        </Box>
        <Box className={classes.wordBox}>
          <Typography variant="body1">
            <em>
              {
                "Payouts are currently only available to clients in the US or Canada. If you're outside the US or Canada and want to withdraw credits, please contact"
              }
              <Router.Link to="/c/support">/c/support</Router.Link>
              {'or send an email to '}
              <Link href="mailto:support@umpyre.com">support@umpyre.com</Link>.
            </em>
          </Typography>
        </Box>
      </>
    )
  }
  return (
    <Box className={classes.wordBox}>
      <Typography variant="body1">Payouts can&apos;t be enabled at this time.</Typography>
    </Box>
  )
}

interface PayoutsProps {
  profile?: ClientProfile
  balance?: Balance
  connectAccount?: ConnectAccountInfo
  fetchConnectAccount: typeof fetchConnectAccountRequest
  postConnectOauth: typeof postConnectOauthRequest
  searchString: string
  updatingPrefs: boolean
  updatePrefs: typeof postConnectPrefsRequest
}

export const PayoutsPageFC: React.FC<PayoutsProps> = ({
  profile,
  balance,
  connectAccount,
  fetchConnectAccount,
  postConnectOauth,
  searchString,
  updatingPrefs,
  updatePrefs
}) => {
  const classes = useStyles({})

  React.useEffect(() => {
    const oauthParams = qs.parse(searchString, { ignoreQueryPrefix: true })
    if (oauthParams && oauthParams.code && oauthParams.state) {
      postConnectOauth({
        authorization_code: oauthParams.code,
        oauth_state: oauthParams.state
      })
    } else {
      fetchConnectAccount()
    }
  }, [])

  if (profile && balance && connectAccount) {
    return (
      <>
        <Typography variant="h5">Account payouts</Typography>
        <Divider />
        <ConnectButtonSection
          connectAccount={connectAccount}
          updatingPrefs={updatingPrefs}
          updatePrefs={updatePrefs}
        />
      </>
    )
  }
  return <Loading />
}

const mapStateToProps = ({ clientState, accountState }: ApplicationState) => ({
  balance: accountState.balance,
  connectAccount: accountState.connectAccount,
  profile: clientState.profile,
  updatingPrefs: accountState.updatingPrefs
})

const mapDispatchToProps = {
  fetchConnectAccount: fetchConnectAccountRequest,
  postConnectOauth: postConnectOauthRequest,
  updatePrefs: postConnectPrefsRequest
}

const PayoutsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(PayoutsPageFC)
export default PayoutsPage
