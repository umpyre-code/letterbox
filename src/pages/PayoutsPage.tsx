import {
  Box,
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
import * as React from 'react'
import NumberFormat from 'react-number-format'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { Emoji } from '../components/widgets/Emoji'
import Loading from '../components/widgets/Loading'
import { ApplicationState } from '../store'
import {
  fetchConnectAccountRequest,
  postConnectOauthError,
  postConnectOauthRequest,
  postConnectOauthRequest
} from '../store/account/actions'
import { Balance, ConnectAccountInfo } from '../store/models/account'
import { ClientProfile } from '../store/models/client'
import './stripe-connect-button.css'
import qs from 'qs'

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
  disabled: boolean
  connectAccount: ConnectAccountInfo
}

const PayoutSlider: React.FC<PayoutSliderProps> = ({ disabled, connectAccount }) => {
  const classes = sliderStyles()
  const [payoutAmount, setPayoutAmount] = React.useState(
    Math.trunc(connectAccount.preferences.automatic_payout_threshold_cents / 100)
  )
  const [saved, setSaved] = React.useState(false)

  const handleSliderChange = (event: any, newValue: number) => {
    setSaved(true)
    setPayoutAmount(newValue)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let amount = Number(event.target.value)
    if (amount < 100) {
      amount = 100
    }
    setPayoutAmount(amount)
  }

  const handleBlur = () => {
    if (payoutAmount < 100) {
      setPayoutAmount(100)
    }
  }

  return (
    <React.Fragment>
      <Typography id="input-slider" gutterBottom>
        Payout threshold
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Slider
            disabled={disabled}
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
            disabled={disabled}
            label="Amount"
            inputProps={{ 'aria-label': 'payout-threshold-amount' }}
            variant="outlined"
            margin="dense"
            className={classes.textField}
            value={payoutAmount}
            onBlur={handleBlur}
            onChange={handleInputChange}
            InputProps={{
              inputComponent: numberFormatCustom as any
            }}
          />
        </Grid>
        <Grid item>
          {saved && (
            <Fade timeout={500} in>
              <Typography style={{ color: 'pink' }}>
                Settings saved <Emoji>😇</Emoji>
              </Typography>
            </Fade>
          )}
        </Grid>
      </Grid>
    </React.Fragment>
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
}

const PayoutPreferencesSection: React.FC<PayoutPreferencesSectionProps> = ({ connectAccount }) => {
  const classes = useStyles()
  const [autoPayoutsEnabled, setAutoPayoutsEnabled] = React.useState(
    connectAccount.preferences.enable_automatic_payouts
  )

  return (
    <React.Fragment>
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
        <FormControl component="fieldset">
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={autoPayoutsEnabled}
                  onChange={(event, checked) => setAutoPayoutsEnabled(checked)}
                />
              }
              label="Enable automatic payouts"
            />
          </FormGroup>
        </FormControl>
        <PayoutSlider disabled={!autoPayoutsEnabled} connectAccount={connectAccount} />
      </Box>
    </React.Fragment>
  )
}

interface ConnectButtonSectionProps {
  connectAccount: ConnectAccountInfo
}

const ConnectButtonSection: React.FC<ConnectButtonSectionProps> = ({ connectAccount }) => {
  const classes = useStyles()
  const [autoPayoutsEnabled, setAutoPayoutsEnabled] = React.useState(
    connectAccount.preferences.enable_automatic_payouts
  )

  if (connectAccount.state === 'active') {
    return (
      <React.Fragment>
        <Box className={classes.wordBox}>
          <Typography variant="body1">Your Connect account is active.</Typography>
        </Box>
        <Box className={classes.buttonBox}>
          <Link href={connectAccount.login_link_url} target="_blank" className="stripe-connect">
            <span>Stripe Connect Dashboard</span>
          </Link>
        </Box>
        <PayoutPreferencesSection connectAccount={connectAccount} />
      </React.Fragment>
    )
  } else if (connectAccount.oauth_url) {
    return (
      <React.Fragment>
        <Box className={classes.wordBox}>
          <Typography variant="body1">
            To enable payouts, you'll need a Stripe Connect account.
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
              Payouts are currently only available to clients in the US or Canada. If you're outside
              the US or Canada and want to withdraw credits, please contact{' '}
              <Router.Link to="/c/support">/c/support</Router.Link> or send an email to{' '}
              <Link href="mailto:support@umpyre.com">support@umpyre.com</Link>.
            </em>
          </Typography>
        </Box>
      </React.Fragment>
    )
  } else {
    return (
      <Box className={classes.wordBox}>
        <Typography variant="body1">Payouts can't be enabled at this time.</Typography>
      </Box>
    )
  }
}

interface PayoutsProps {
  profile?: ClientProfile
  balance?: Balance
  connectAccount?: ConnectAccountInfo
  fetchConnectAccount: typeof fetchConnectAccountRequest
  postConnectOauth: typeof postConnectOauthRequest
  searchString: string
}

export const PayoutsPageFC: React.FC<PayoutsProps> = ({
  profile,
  balance,
  connectAccount,
  fetchConnectAccount,
  postConnectOauth,
  searchString
}) => {
  const classes = useStyles()

  const oauthParams = qs.parse(searchString, { ignoreQueryPrefix: true })
  if (oauthParams && oauthParams.code && oauthParams.state) {
    postConnectOauth({
      authorization_code: oauthParams.code,
      oauth_state: oauthParams.state
    })
  }

  React.useEffect(() => {
    fetchConnectAccount()
  }, [])

  if (profile && balance && connectAccount) {
    return (
      <React.Fragment>
        <Typography variant="h5">Account payouts</Typography>
        <Divider />
        <ConnectButtonSection connectAccount={connectAccount} />
      </React.Fragment>
    )
  } else {
    return <Loading />
  }
}

const mapStateToProps = ({ clientState, accountState }: ApplicationState) => ({
  balance: accountState.balance,
  connectAccount: accountState.connectAccount,
  profile: clientState.profile
})

const mapDispatchToProps = {
  fetchConnectAccount: fetchConnectAccountRequest,
  postConnectOauth: postConnectOauthRequest
}

const PayoutsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(PayoutsPageFC)
export default PayoutsPage
