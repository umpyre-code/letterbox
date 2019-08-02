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
import { ApplicationState } from '../../store'
import { chargeRequest, clearChargeErrors } from '../../store/account/actions'
import { ChargeErrorResponse, ChargeResponse } from '../../store/models/account'
import './stripe.css'
import { ClientProfile } from '../../store/models/client'

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
  const classes = useStyles()
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

class CardSection extends Component<CardSectionProps, CardSectionState> {
  constructor(props: CardSectionProps) {
    super(props)
    this.submit = this.submit.bind(this)
    this.onCardElementChanged = this.onCardElementChanged.bind(this)
    this.buttonDisabled = this.buttonDisabled.bind(this)

    this.state = { error: undefined }
  }

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

  public onCardElementChanged(changes: any) {
    this.props.clearErrors()
    const { error } = changes
    if (error) {
      this.setState({ ...this.state, error: error.message })
    } else {
      this.setState({ ...this.state, error: undefined })
    }
  }

  public buttonDisabled(): boolean {
    return this.props.chargeAmount < 1 || this.state.error !== undefined || this.props.charging
  }

  public render() {
    return (
      <Grid container justify="center" alignItems="flex-end">
        <Grid item xs>
          <FormLabel>
            Credit or debit card
            <CardElement onChange={this.onCardElementChanged} />
          </FormLabel>
        </Grid>
        <Grid item>
          <Button
            disabled={this.buttonDisabled()}
            variant="contained"
            color="primary"
            onClick={this.submit}
            style={{ height: '40px', margin: '0px 0px 0px 6px', padding: '6px 12px' }}
          >
            <NumberFormat
              value={this.props.chargeAmount}
              thousandSeparator
              decimalScale={2}
              fixedDecimalScale={true}
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
  profile: clientState.profile!
})

export const CardSectionForm = connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  {
    pure: false
  }
)(injectStripe(CardSection))
