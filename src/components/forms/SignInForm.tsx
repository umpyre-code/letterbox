import { FormControl, Grid, LinearProgress, SnackbarContent } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import { Field, Form, Formik } from 'formik'
import { TextField } from 'formik-material-ui'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import * as Yup from 'yup'
import { ApplicationState } from '../../store/ApplicationState'
import { authRequest } from '../../store/client/actions'
import { ClientState } from '../../store/client/types'
import { KeysState } from '../../store/keys/types'
import { Emoji } from '../widgets/Emoji'

interface PropsFromState {
  client: ClientState
  keys: KeysState
}

interface PropsFromDispatch {
  authRequest: typeof authRequest
}

type AllProps = PropsFromDispatch & PropsFromState & Router.RouteComponentProps<{}>

const SigninFormSchema = Yup.object().shape({
  email: Yup.string()
    .email("That doesn't look right")
    .required('Please tell us who you are'),
  password: Yup.string().required('Please tell us what you know')
})

class SignIn extends React.Component<AllProps> {
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
        {this.props.client.authError && (
          <Grid item>
            <SnackbarContent
              message={
                <h3>
                  <Emoji ariaLabel="error">😳</Emoji>&nbsp;Those credentials don&apos;t look right!
                  Try again :)
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
            I don&apos;t have an account
          </Button>
        </Grid>
      </Grid>
    </Form>
  )

  public render(): React.ReactNode {
    return (
      <Formik
        initialValues={{
          email: '',
          password: ''
        }}
        validationSchema={SigninFormSchema}
        onSubmit={(values, actions) => {
          this.props.authRequest(values, {
            actions
          })
        }}
        render={this.handleFormRender}
      />
    )
  }
}

const mapStateToProps = ({ clientState, keysState }: ApplicationState) => ({
  client: clientState,
  keys: keysState
})

const mapDispatchToProps = {
  authRequest
}

export const SignInForm = Router.withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SignIn)
)
