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
import { ApplicationState } from 'store'
import { submitNewClientRequest } from '../../store/client/actions'
import { ClientState } from '../../store/client/types'
import { KeysState } from '../../store/keys/types'
import { CountryCodes } from './CountryCodes'

// This doesn't work unless we use the old-style of import. I gave up trying to
// figure out why.
// tslint:disable-next-line
const sodium = require('libsodium-wrappers')

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

async function hashPassword(password: string) {
  await sodium.ready
  return sodium.to_base64(
    sodium.crypto_generichash(64, password),
    sodium.base64_variants.ORIGINAL_NO_PADDING
  )
}

type AllProps = PropsFromDispatch & PropsFromState

class SignUp extends React.Component<AllProps> {
  public render() {
    return (
      <Formik
        initialValues={{
          email: '',
          password: '',
          full_name: '',
          phone_number: {
            national_number: '',
            country_code: 'US'
          }
        }}
        validate={values => {
          const errors: Partial<Values> = {}
          if (!values.email) {
            errors.email = 'Required'
          } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
            errors.email = 'Invalid email address'
          }
          if (!values.full_name) {
            errors.full_name = 'Required'
          }
          if (!values.password) {
            errors.password = 'Required'
          }
          if (!values.phone_number.national_number) {
            errors.phone_number = { national_number: 'Required' }
          }
          return errors
        }}
        onSubmit={(values, actions) => {
          hashPassword(values.password).then(password_hash => {
            // Don't send the plain text password to the server.
            // Mix in the public key, password hash.
            let new_client = {
              ...values,
              public_key: this.props.keys.current_key.public_key,
              password_hash: password_hash
            }
            // Remove the plain text password before sending this obj to the server.
            delete new_client.password
            this.props.submitNewClientRequest(new_client, {
              actions: actions
            })
          })
        }}
        render={({ submitForm, isSubmitting, isValid, values, setFieldValue }) => (
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
              {this.props.client.errors && (
                <Grid item>
                  <SnackbarContent
                    message={
                      <h3>
                        <span style={{ fontSize: '1.5rem', padding: '5px' }}>😳</span>{' '}
                        {this.props.client.errors}
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
        )}
      />
    )
  }
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
