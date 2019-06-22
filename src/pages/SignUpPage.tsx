import { Container, Paper } from '@material-ui/core'
import * as React from 'react'
import { SignUpForm } from '../components/forms/SignUpForm'
import styled from '../utils/styled'

const SignUpPage = () => (
  <PageContent>
    <Container maxWidth="sm">
      <Paper style={{ padding: 10 }}>
        <h1>Join Umpyre</h1>
        <p>Umpyre is a communication tool that let's you decide what your attention is worth.</p>
        <SignUpForm />
      </Paper>
    </Container>
  </PageContent>
)

export default SignUpPage

const PageContent = styled('div')``
