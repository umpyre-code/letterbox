import * as React from 'react'
import { connect } from 'react-redux'
import { FormikProps } from 'formik'
import { getClientRequest } from '../../store/client/actions'
import { Client } from '../../store/client/types'
import { ApplicationState } from '../../store'
import { CountryCode, getCountryCallingCode, AsYouType } from 'libphonenumber-js'
import Button from '@material-ui/core/Button'
import { Formik, Field, Form } from 'formik'
import {
  LinearProgress,
  FormGroup,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@material-ui/core'
import { fieldToTextField, TextField, TextFieldProps, Select } from 'formik-material-ui'
import MuiTextField from '@material-ui/core/TextField'
import { country_codes } from './phonenumber'

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
  client: Client
}

interface PropsFromDispatch {
  getClientRequest: typeof getClientRequest
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

// Combine both state + dispatch props - as well as any props we want to pass - in a union type.
type AllProps = PropsFromDispatch & PropsFromState

class SignUp extends React.Component<AllProps> {
  public getClientRequest(values: Values, props: FormikProps<Values>) {
    this.props.getClientRequest()
  }

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
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            setSubmitting(false)
            alert(JSON.stringify(values, null, 2))
          }, 500)
        }}
        render={({ submitForm, isSubmitting, values, setFieldValue }) => (
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
                          {country_codes.map(value => {
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
              <Grid item>
                {isSubmitting && <LinearProgress />}
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
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

const mapStateToProps = ({ client }: ApplicationState) => ({
  client: client.client
})

const mapDispatchToProps = {
  getClientRequest
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignUp)
