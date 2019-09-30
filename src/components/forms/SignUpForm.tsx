import {
  FormControl,
  FormGroup,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  SnackbarContent,
  Theme,
  Tooltip,
  Typography,
  withStyles
} from '@material-ui/core'
import Button from '@material-ui/core/Button'
import MuiTextField from '@material-ui/core/TextField'
import HelpIcon from '@material-ui/icons/Help'
import { Field, Form, Formik } from 'formik'
import { fieldToTextField, Select, TextField, TextFieldProps } from 'formik-material-ui'
import { AsYouType } from 'libphonenumber-js'
import qs from 'qs'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import * as Yup from 'yup'
import zxcvbn from 'zxcvbn'
import { ApplicationState } from '../../store/ApplicationState'
import { loadCredentialsRequest, submitNewClientRequest } from '../../store/client/actions'
import { ClientState } from '../../store/client/types'
import { Emoji } from '../widgets/Emoji'
import { CountryCodes } from './CountryCodes'
import { API } from '../../store/api'

interface PhoneNumber {
  country_code?: string
  national_number?: string
}

interface Values {
  full_name: string
  email: string
  password: string
  phone_number: PhoneNumber
}

interface PropsFromState {
  client: ClientState
}

interface PropsFromDispatch {
  submitNewClientRequest: typeof submitNewClientRequest
  loadCredentials: typeof loadCredentialsRequest
}

const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    maxWidth: 400,
    background: 'rgba(0, 0, 0, 0.9)'
  }
}))(Tooltip)

export const PhoneNumberToolTip = () => (
  <HtmlTooltip
    enterDelay={150}
    title={
      <>
        <Typography variant="h5">Why do you need my phone number?</Typography>
        <br />
        <Typography>
          We want to build a platform with real humans only. We don&apos;t want bots, marketers, or
          scammers filling your inbox with junk.
        </Typography>
        <br />
        <Typography>
          Phone numbers provide the best way to make sure every account is a real person, while also
          reaching a large audience.
        </Typography>
        <br />
        <Typography>
          We&apos;ll never use your phone number for marketing purposes, and we never expose it to
          3rd parties. We don&apos;t harvest your phone number or contact lists, and it&apos;s never
          exposed through our API.
        </Typography>
      </>
    }
  >
    <HelpIcon />
  </HtmlTooltip>
)

const PhoneNumberTextField = (props: TextFieldProps) => (
  <MuiTextField
    {...fieldToTextField(props)}
    onChange={event => {
      const { value } = event.target
      if (value) {
        const formattedNumber = new AsYouType(props.form.values.phone_number.country_code).input(
          value
        )
        props.form.setFieldValue(props.field.name, formattedNumber)
      } else {
        props.form.setFieldValue(props.field.name, '')
      }
    }}
  />
)

type AllProps = PropsFromDispatch & PropsFromState & Router.RouteComponentProps<{}>

function testPassword(value: string): boolean {
  return zxcvbn(value).score > 2
}

function passwordHelp(value: string): string {
  return zxcvbn(value).feedback.warning
}

const SignupFormSchema = Yup.object().shape({
  email: Yup.string()
    .email("That doesn't look right")
    .required('We need a way to occasionally reach you'),
  full_name: Yup.string()
    .max(100, 'Keep it under 100 characters')
    .required('How shall we address you?'),
  password: Yup.string()
    .required('Make it unique')
    .test('is a strong password', value => passwordHelp(value.value), value => testPassword(value)),
  phone_number: Yup.object().shape({
    country_code: Yup.string().required('Country code is required'),
    national_number: Yup.string().required("We need to know you're not a robot")
  })
})

class SignUp extends React.Component<AllProps> {
  public componentDidMount() {
    // Load credentials first, just to make sure we don't unintentionally wipe
    // out local state. Creating a new client will reset the local DB.
    this.props.loadCredentials()
  }

  private handleFormRender = ({ submitForm, isSubmitting, isValid }) => (
    <Form>
      <Grid container direction="column" spacing={2}>
        <Grid item xs={12} style={{ width: '100%' }}>
          <FormControl fullWidth>
            <Field name="email" type="email" label="Email" component={TextField} fullWidth />
          </FormControl>
        </Grid>
        <Grid item xs={12} style={{ width: '100%' }}>
          <FormControl fullWidth>
            <Field
              type="password"
              label="Password"
              name="password"
              component={TextField}
              fullWidth
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} style={{ width: '100%' }}>
          <FormControl fullWidth>
            <Field type="text" label="Your Name" name="full_name" component={TextField} fullWidth />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormGroup row>
              <Grid container>
                <Grid item>
                  <InputLabel htmlFor="phone_number.country_code">Country Code</InputLabel>
                  <Field
                    name="phone_number.country_code"
                    label="Country Code"
                    component={Select}
                    fullWidth
                  >
                    {CountryCodes.map(value => {
                      return (
                        <MenuItem key={value.code} value={value.code}>
                          {value.text}
                        </MenuItem>
                      )
                    })}
                  </Field>
                </Grid>
                <Grid item container xs style={{ width: '100%' }}>
                  <Grid item xs>
                    <Field
                      type="text"
                      name="phone_number.national_number"
                      label="Phone Number"
                      component={PhoneNumberTextField}
                      fullWidth
                    />
                  </Grid>
                  <Grid item style={{ alignSelf: 'flex-end' }}>
                    <PhoneNumberToolTip />
                  </Grid>
                </Grid>
              </Grid>
            </FormGroup>
          </FormControl>
        </Grid>
        {this.props.client.signUpFormErrors && (
          <Grid item xs={12} style={{ width: '100%' }}>
            <SnackbarContent
              message={
                <Typography variant="h6">
                  <Emoji ariaLabel="error">😳</Emoji>&nbsp;
                  {this.props.client.signUpFormErrors}
                </Typography>
              }
            />
          </Grid>
        )}
        {isSubmitting && (
          <Grid item>
            <LinearProgress />
          </Grid>
        )}
        <Grid item xs={12} style={{ width: '100%' }}>
          <Button
            variant="contained"
            color="primary"
            disabled={isSubmitting || !isValid}
            onClick={submitForm}
            fullWidth
          >
            Sign Up 👍
          </Button>
        </Grid>
        <Grid item xs={12} style={{ width: '100%' }}>
          <Button
            variant="contained"
            color="secondary"
            disabled={isSubmitting}
            onClick={() => {
              this.props.history.push('/signin')
            }}
            fullWidth
          >
            I already have an account
          </Button>
        </Grid>
      </Grid>
    </Form>
  )

  public render() {
    if (
      this.props.client &&
      this.props.client.clientReady &&
      this.props.client.credentialsReady &&
      this.props.client.profile &&
      !this.props.client.newClientSubmitting
    ) {
      // How did we get here? already have a client, so let's redirect to the
      // signout page to make sure this is intentional
      return <Router.Redirect to="/signout" />
    }
    return (
      <Formik
        initialValues={{
          email: '',
          full_name: '',
          password: '',
          phone_number: {
            country_code: 'US',
            national_number: ''
          }
        }}
        validationSchema={SignupFormSchema}
        onSubmit={(values, actions) => {
          API.METRIC_COUNTER_INC('signup-form-submitted')
          const params = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })
          const referredBy = params.r || params.ref || params.referred_by || undefined
          this.props.submitNewClientRequest(
            {
              ...values,
              referred_by: referredBy
            },
            {
              actions
            }
          )
        }}
        render={this.handleFormRender}
      />
    )
  }
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  client: clientState
})

const mapDispatchToProps = {
  loadCredentials: loadCredentialsRequest,
  submitNewClientRequest
}

export const SignUpForm = Router.withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SignUp)
)
