import {
  Box,
  createStyles,
  Divider,
  Link,
  makeStyles,
  TextField,
  Theme,
  Typography,
  Switch,
  FormControl,
  FormGroup,
  FormControlLabel,
  Fade
} from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import React, * as React from 'react'
import NumberFormat from 'react-number-format'
import * as Router from 'react-router-dom'
import './stripe-connect-button.css'
import { Emoji } from '../components/widgets/Emoji'

const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID || 'ca_FVZ7xsdnQsZChPyqzq4sDtwCMSoATpPz'
const BASE_URL = process.env.STRIPE_CLIENT_ID || 'https://staging.umpyre.io'

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
}

const PayoutSlider: React.FC<PayoutSliderProps> = ({ disabled }) => {
  const classes = sliderStyles()
  const [payoutAmount, setPayoutAmount] = React.useState(100)
  const [saved, setSaved] = React.useState(false)

  const handleSliderChange = (event: any, newValue: number) => {
    setSaved(true)
    setPayoutAmount(newValue)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPayoutAmount(event.target.value === '' ? '' : Number(event.target.value))
  }

  const handleBlur = () => {
    if (payoutAmount < 100) {
      setPayoutAmount(100)
    }
  }

  function sliderValue() {
    return typeof value === 'number' ? value : 100
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
        <Grid item alignContent="center">
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

export const PayoutsPage: React.FC = ({}) => {
  const classes = useStyles()
  const [autoPayoutsEnabled, setAutoPayoutsEnabled] = React.useState(false)

  return (
    <React.Fragment>
      <Typography variant="h5">Account payouts</Typography>
      <Divider />
      <Box className={classes.wordBox}>
        <Typography variant="body1">
          To enable payouts, you'll need a Stripe Connect account.
        </Typography>
      </Box>
      <Box className={classes.buttonBox}>
        <Link
          href={`https://connect.stripe.com/express/oauth/authorize?redirect_uri=${BASE_URL}/account/payouts&client_id=${STRIPE_CLIENT_ID}&state={}&&stripe_user[business_type]=individual`}
          className="stripe-connect"
        >
          <span>Connect with Stripe</span>
        </Link>
      </Box>
      <Box className={classes.wordBox}>
        <Typography variant="body1">
          <em>
            Please note that payouts are currently only available to clients in the US or Canada. If
            you're outside the US or Canada and want to withdraw credits, please contact{' '}
            <Router.Link to="/c/support">/c/support</Router.Link> or send an email to{' '}
            <Link href="mailto:support@umpyre.com">support@umpyre.com</Link>.
          </em>
        </Typography>
      </Box>
      <Box className={classes.wordBox}>
        <Typography variant="h6">Payout preferences</Typography>
      </Box>
      <Divider />
      <Box className={classes.wordBox}>
        <Typography>
          Automatic payouts are processed daily, and will be paid out as soon as your account
          balance reaches the payout threshold. The minimum payout amount is $100.
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
        <PayoutSlider disabled={!autoPayoutsEnabled} />
      </Box>
    </React.Fragment>
  )
}
