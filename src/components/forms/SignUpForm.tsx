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
import * as Yup from 'yup'
import { ApplicationState } from '../../store'
import { submitNewClientRequest } from '../../store/client/actions'
import { ClientState } from '../../store/client/types'
import { KeysState } from '../../store/keyPairs/types'
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
  keys: KeysState
}

interface PropsFromDispatch {
  submitNewClientRequest: typeof submitNewClientRequest
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

type AllProps = PropsFromDispatch & PropsFromState

const SignupFormSchema = Yup.object().shape({
  email: Yup.string()
    .email("That doesn't look right")
    .required('We need a way to occasionally reach you'),
  full_name: Yup.string()
    .max(100, 'Keep it under 100 characters')
    .required('How shall we address you?'),
  password: Yup.string().required('Make it unique'),
  phone_number: Yup.object().shape({
    country_code: Yup.string().required(),
    national_number: Yup.string().required("We need to know you're not a robot")
  })
})

class SignUp extends React.Component<AllProps> {
  public render() {
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
          const newClient = {
            ...values
          }
          delete newClient.password
          this.props.submitNewClientRequest(newClient, {
            actions
          })
        }}
        render={this.handleFormRender}
      />
    )
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
            <FormGroup row={true}>
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
        <Grid item>
          {isSubmitting && <LinearProgress />}
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
      </Grid>
    </Form>
  )
}

const mapStateToProps = ({ clientState, keysState }: ApplicationState) => ({
  client: clientState,
  keys: keysState
})

const mapDispatchToProps = {
  submitNewClientRequest
}

export const SignUpForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignUp)
