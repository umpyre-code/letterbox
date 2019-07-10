import { Container, Divider, Paper, Typography } from '@material-ui/core'
import * as React from 'react'
import { SignUpForm } from '../components/forms/SignUpForm'

const SignUpPage = () => (
  <Container maxWidth="sm">
    <Paper style={{ padding: 10 }}>
      <Typography component="h2" variant="h2">
        Join Umpyre
      </Typography>
      <Typography>
        Umpyre is a communication tool that let's you decide what your attention is worth.
      </Typography>
      <Divider />
      <SignUpForm />
    </Paper>
  </Container>
)

export default SignUpPage
