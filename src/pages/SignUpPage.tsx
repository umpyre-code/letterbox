import { Container, Paper } from '@material-ui/core'
import * as React from 'react'
import { SignUpForm } from '../components/forms/SignUpForm'

const SignUpPage = () => (
  <Container maxWidth="sm">
    <Paper style={{ padding: 10 }}>
      <h1>Join Umpyre</h1>
      <p>Umpyre is a communication tool that let's you decide what your attention is worth.</p>
      <SignUpForm />
    </Paper>
  </Container>
)

export default SignUpPage
