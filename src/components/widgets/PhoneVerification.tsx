import {
  Box,
  Container,
  createStyles,
  Link,
  makeStyles,
  Paper,
  TextField,
  Theme,
  Typography
} from '@material-ui/core'
import ArrowBack from '@material-ui/icons/ArrowBack'
import Autorenew from '@material-ui/icons/Autorenew'
import * as React from 'react'
import NumberFormat from 'react-number-format'
import { connect } from 'react-redux'
import { ApplicationState } from '../../store'
import { API } from '../../store/api'
import { verifyPhoneRequest } from '../../store/client/actions'
import { ClientCredentials } from '../../store/models/client'

interface PropsFromState {
  phoneVerifying: boolean
  phoneVerificationError?: string
  credentials: ClientCredentials
}

interface PropsFromDispatch {
  verifyPhone: typeof verifyPhoneRequest
}

type AllProps = PropsFromState & PropsFromDispatch

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      display: 'inline-flex',
      padding: theme.spacing(1),
      verticalAlign: 'middle'
    },
    container: { padding: theme.spacing(5) },
    paper: { padding: theme.spacing(2) },
    textField: { width: 150 }
  })
)

interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void
  onChange: (event: { target: { value: string } }) => void
}

function numberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props

  return (
    <NumberFormat
      {...other}
      allowNegative={false}
      decimalScale={0}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value
          }
        })
      }}
      thousandSeparator
      mask="_"
      format="###-###"
    />
  )
}

export const PhoneVerificationFC: React.FC<AllProps> = ({
  credentials,
  verifyPhone,
  phoneVerificationError
}) => {
  const classes = useStyles()
  const [flashError, setFlashError] = React.useState<boolean>(false)
  const [showResend, setShowResend] = React.useState<boolean>(true)

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const code = Number(event.target.value)
    if (code.toString().length === 6) {
      setFlashError(true)
      verifyPhone(code)
    } else {
      setFlashError(false)
    }
  }

  function getHelperText() {
    if (phoneVerificationError && flashError) {
      return 'Invalid code'
    } else {
      return null
    }
  }

  function resendCode() {
    const api = new API(credentials)
    api.sendVerificationCode()
    setShowResend(false)
    setTimeout(() => setShowResend(true), 5000)
  }

  return (
    <Container className={classes.container}>
      <Paper className={classes.paper}>
        <Box className={classes.box}>
          <Typography variant="h5">Please verify your phone number:</Typography>
        </Box>
        <Box className={classes.box}>
          <TextField
            label="Verification code"
            variant="outlined"
            helperText={getHelperText()}
            className={classes.textField}
            InputProps={{
              inputComponent: numberFormatCustom as any
            }}
            onChange={handleOnChange}
          />
        </Box>
        {showResend && (
          <Box className={classes.box}>
            <Link className={classes.box} onClick={resendCode}>
              <Autorenew /> Resend code
            </Link>
          </Box>
        )}
        <Box className={classes.box}>
          <Typography variant="body2">
            You cannot send messages until your phone number is verified. If your phone number is
            not verified within 24 hours, this account will be deleted. You may try signing up again
            with the same number afterward.
          </Typography>
        </Box>
        <Box className={classes.box}>
          <Link className={classes.box} href="/signup">
            <ArrowBack /> Go back to the signup form
          </Link>
        </Box>
      </Paper>
    </Container>
  )
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  credentials: clientState.credentials,
  phoneVerificationError: clientState.phoneVerificationError,
  phoneVerifying: clientState.phoneVerifying
})

const mapDispatchToProps = {
  verifyPhone: verifyPhoneRequest
}

const PhoneVerification = connect(
  mapStateToProps,
  mapDispatchToProps
)(PhoneVerificationFC)

export default PhoneVerification