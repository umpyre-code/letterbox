import {
  Button,
  createStyles,
  FormLabel,
  Grid,
  LinearProgress,
  makeStyles,
  SnackbarContent,
  Theme
} from '@material-ui/core'
import { red } from '@material-ui/core/colors'
import ErrorIcon from '@material-ui/icons/Error'
import React, { Component } from 'react'
import NumberFormat from 'react-number-format'
import { connect } from 'react-redux'
import { CardElement, injectStripe } from 'react-stripe-elements'
import { ApplicationState } from '../../store/ApplicationState'
import { chargeRequest, clearChargeErrors } from '../../store/account/actions'
import { ChargeErrorResponse, ChargeResponse } from '../../store/models/account'
import { ClientProfile } from '../../store/models/client'
import './stripe.css'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    errorIcon: {
      margin: theme.spacing(0, 1, 0, 0)
    },
    snackbar: {
      backgroundColor: red[700],
      margin: theme.spacing(2, 0, 0, 0)
    },
    snackbarMessage: {
      alignItems: 'center',
      display: 'flex'
    }
  })
)

interface WarningProps {
  message: string
}

const Warning: React.FC<WarningProps> = ({ message }) => {
  const classes = useStyles({})
  return (
    <SnackbarContent
      className={classes.snackbar}
      message={
        <span className={classes.snackbarMessage}>
          <ErrorIcon className={classes.errorIcon} />
          {message}
        </span>
      }
    />
  )
}

interface CardSectionProps {
  chargeAmount: number
  stripe?: any
  submitChargeRequest: typeof chargeRequest
  chargeResponse: ChargeResponse
  chargeErrorResponse: ChargeErrorResponse
  charging: boolean
  clearErrors: typeof clearChargeErrors
  profile: ClientProfile
}

interface CardSectionState {
  error?: string
}

// Stripe makes it really hard to remove their JS after it's no longer in use.
// Their code injects iframes into the dom, and sets timers to re-inject those
// iframes if they are removed. It also collects metrics and could
// (theoretically) be malicious. Below we have to a) clear all timers in the
// window and b) repeatedly remove the iframes because they may get re-injected
// at any time.
//
// Stripe should do the right thing and make it easy to remove their
// telemetry/tracking stuff. Better yet, they should not _ever_ be injecting
// their own telemetry/tracking/metrics into their customer's pages.
//
// See https://github.com/stripe/react-stripe-elements/issues/99 for more.

class CardSection extends Component<CardSectionProps, CardSectionState> {
  constructor(props: CardSectionProps) {
    super(props)
    this.submit = this.submit.bind(this)
    this.onCardElementChanged = this.onCardElementChanged.bind(this)
    this.buttonDisabled = this.buttonDisabled.bind(this)

    this.state = {
      error: undefined
    }
  }

  /* eslint-disable no-underscore-dangle */
  public componentWillUnmount(): void {
    // Clear all timers
    let id = window.setTimeout(() => {}, 0)
    while (id) {
      id -= 1
      window.clearTimeout(id)
    }

    // Stop all listeners, remove iframes
    this.props.stripe._controller._frames.__privateStripeFrame5._iframe.remove()
    this.props.stripe._controller._frames.__privateStripeFrame5._removeAllListeners()
    this.props.stripe._controller._controllerFrame._removeAllListeners()
    this.props.stripe._controller._controllerFrame._iframe.remove()

    const stripeIframes = [
      document.querySelectorAll('[name^=__privateStripeMetricsController]'),
      document.querySelectorAll('[name^=__privateStripeController]')
    ]

    stripeIframes.forEach(iframes =>
      iframes.forEach(iframe => {
        iframe.parentNode.removeChild(iframe)
      })
    )

    this.removeStripeControllerFrame()

    document.querySelector('#stripe-js').remove()
  }

  public onCardElementChanged(changes: any) {
    this.props.clearErrors()
    const { error } = changes
    if (error) {
      this.setState({ error: error.message })
    } else {
      this.setState({ error: undefined })
    }
  }

  public getStripeControllerFrameNode(): HTMLIFrameElement | undefined {
    const frameId =
      this.props.stripe && this.props.stripe._controller && this.props.stripe._controller._id
    if (!frameId) {
      return undefined
    }
    // Note: Using `document` isn't full-proof as it may not work if <Provider>
    // is rendered within an iFrame. This can be improved.
    return document.querySelector(`[name='${frameId}']`)
  }

  public removeStripeControllerFrame(): void {
    const frameNode = this.getStripeControllerFrameNode()
    // Note: Does not work, unless Stripe is [ready]. Will need to hook into
    // ready callback (somehow)
    if (frameNode && frameNode.parentNode) {
      frameNode.parentNode.removeChild(frameNode)
    }
  }

  /* eslint-enable no-underscore-dangle */

  public async submit() {
    const { token } = (await this.props.stripe.createToken({
      name: this.props.profile.full_name
    })) as stripe.TokenResponse
    if (token) {
      const charge = {
        amount_cents: Math.trunc(this.props.chargeAmount * 100),
        token
      }
      this.props.submitChargeRequest(charge)
    }
  }

  public buttonDisabled(): boolean {
    return this.props.chargeAmount < 1 || this.state.error !== undefined || this.props.charging
  }

  public render() {
    return (
      <Grid container alignItems="flex-end" spacing={2}>
        <Grid item xs={12} sm>
          <FormLabel>
            Credit or debit card
            <CardElement onChange={this.onCardElementChanged} />
          </FormLabel>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            disabled={this.buttonDisabled()}
            variant="contained"
            color="primary"
            onClick={this.submit}
            style={{ height: '40px', margin: '0px 0px 0px 6px' }}
          >
            <NumberFormat
              value={this.props.chargeAmount}
              thousandSeparator
              decimalScale={2}
              fixedDecimalScale
              prefix="Charge $"
              displayType="text"
            />
          </Button>
        </Grid>
        {this.state.error && (
          <Grid item xs={12}>
            <Warning message={this.state.error} />
          </Grid>
        )}
        {this.props.chargeErrorResponse &&
          this.props.chargeErrorResponse.result === 'failure' &&
          this.props.chargeErrorResponse.api_response.message && (
            <Grid item xs={12}>
              <Warning message={this.props.chargeErrorResponse.api_response.message} />
            </Grid>
          )}
        {this.props.charging && (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        )}
      </Grid>
    )
  }
}

const mapDispatchToProps = {
  clearErrors: clearChargeErrors,
  submitChargeRequest: chargeRequest
}

const mapStateToProps = ({ clientState, accountState }: ApplicationState) => ({
  chargeErrorResponse: accountState.chargeErrorResponse,
  chargeResponse: accountState.chargeResponse,
  charging: accountState.charging,
  profile: clientState.profile
})

export const CardSectionForm = connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  {
    pure: false
  }
)(injectStripe(CardSection))
