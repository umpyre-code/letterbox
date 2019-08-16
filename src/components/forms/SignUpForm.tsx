import {
  FormControl,
  FormGroup,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  SnackbarContent
} from '@material-ui/core'
import Button from '@material-ui/core/Button'
import MuiTextField from '@material-ui/core/TextField'
import { Field, Form, Formik } from 'formik'
import { fieldToTextField, Select, TextField, TextFieldProps } from 'formik-material-ui'
import { AsYouType } from 'libphonenumber-js'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import * as Yup from 'yup'
import zxcvbn from 'zxcvbn'
import { ApplicationState } from '../../store/ApplicationState'
import { loadCredentialsRequest, submitNewClientRequest } from '../../store/client/actions'
import { ClientState } from '../../store/client/types'
import { CountryCodes } from './CountryCodes'

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

  private handleFormRender = ({ submitForm, isSubmitting, isValid, values, setFieldValue }) => (
    <Form>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <FormControl fullWidth>
            <Field name="email" type="email" label="Email" component={TextField} />
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl fullWidth>
            <Field type="password" label="Password" name="password" component={TextField} />
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl fullWidth>
            <Field type="text" label="Your Name" name="full_name" component={TextField} />
          </FormControl>
        </Grid>
        <Grid item>
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
                <Grid item xs>
                  <Field
                    type="text"
                    name="phone_number.national_number"
                    label="Phone Number"
                    component={PhoneNumberTextField}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </FormGroup>
          </FormControl>
        </Grid>
        {this.props.client.signUpFormErrors && (
          <Grid item>
            <SnackbarContent
              message={
                <h3>
                  <span style={{ fontSize: '1.5rem', padding: '5px' }}>😳</span>{' '}
                  {this.props.client.signUpFormErrors}
                </h3>
              }
            />
          </Grid>
        )}
        {isSubmitting && (
          <Grid item>
            <LinearProgress />
          </Grid>
        )}
        <Grid item>
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
        <Grid item>
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
          this.props.submitNewClientRequest(values, {
            actions
          })
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
