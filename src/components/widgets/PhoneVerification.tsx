import {
  Box,
  Container,
  createStyles,
  Link,
  makeStyles,
  Paper,
  TextField,
  Theme,
  Typography,
  Button
} from '@material-ui/core'
import ArrowBack from '@material-ui/icons/ArrowBack'
import Autorenew from '@material-ui/icons/Autorenew'
import * as React from 'react'
import NumberFormat from 'react-number-format'
import { connect } from 'react-redux'
import { ApplicationState } from '../../store/ApplicationState'
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
  const classes = useStyles({})
  const [verifying, setVerifying] = React.useState<boolean>(false)
  const [showResend, setShowResend] = React.useState<boolean>(true)

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const code = Number(event.target.value)
    if (code.toString().length === 6) {
      setVerifying(true)
      verifyPhone(code)
    } else {
      setVerifying(false)
    }
  }

  function getHelperText() {
    if (verifying) {
      if (phoneVerificationError) {
        return 'Invalid code'
      }
      return 'Checking code...'
    }
    return null
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
          <Typography variant="h5">Enter phone verification code:</Typography>
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
            <Button className={classes.box} onClick={resendCode}>
              <Autorenew /> Resend code
            </Button>
          </Box>
        )}
        <Box className={classes.box}>
          <Typography variant="body2">
            An SMS message was sent to your phone. If your phone number is not verified within 1
            hour, this account will be deleted. You may try signing up again with the same number
            afterward.
            <br />
            <br />
            <em>
              {' '}
              Having problems with verification? Please email{' '}
              <a href="mailto:support@umpyre.com">support@umpyre.com</a>
            </em>
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
