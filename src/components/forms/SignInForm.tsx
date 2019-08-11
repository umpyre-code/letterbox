import { FormControl, Grid, LinearProgress, SnackbarContent } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import { Field, Form, Formik } from 'formik'
import { TextField } from 'formik-material-ui'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import * as Yup from 'yup'
import { ApplicationState } from '../../store'
import { submitNewClientRequest } from '../../store/client/actions'
import { ClientState } from '../../store/client/types'
import { initializeKeysRequest } from '../../store/keyPairs/actions'
import { KeysState } from '../../store/keyPairs/types'

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
  initializeKeysRequest: typeof initializeKeysRequest
}

interface PropsFromRouter extends Router.RouteComponentProps<{}> {}

type AllProps = PropsFromDispatch & PropsFromState & PropsFromRouter

const SignupFormSchema = Yup.object().shape({
  email: Yup.string()
    .email("That doesn't look right")
    .required('We need a way to occasionally reach you'),
  password: Yup.string().required('We need this')
})

class SignIn extends React.Component<AllProps> {
  public render() {
    return (
      <Formik
        initialValues={{
          email: '',
          password: ''
        }}
        validationSchema={SignupFormSchema}
        onSubmit={(values, actions) => {
          const newClient = {
            ...values
          }
          delete newClient.password
          // this.props.submitNewClientRequest(newClient, {
          //   actions
          // })
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
        {this.props.client.signInFormErrors && (
          <Grid item>
            <SnackbarContent
              message={
                <h3>
                  <span style={{ fontSize: '1.5rem', padding: '5px' }}>😳</span>{' '}
                  {this.props.client.signInFormErrors}
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
            Sign In 👍
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            disabled={isSubmitting}
            onClick={() => {
              this.props.history.push('/signup')
            }}
            fullWidth
          >
            I don't have an account
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

const mapDispatchToProps = {}

export const SignInForm = Router.withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SignIn)
)
