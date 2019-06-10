import * as React from 'react'
import styled from '../utils/styled'
import SignUp from '../components/forms/SignUp'
import { Container, Paper, Grid } from '@material-ui/core'

export default () => (
  <PageContent>
    <Container maxWidth="sm">
      <Paper style={{ padding: 10 }}>
        <h1>Join Umpyre</h1>
        <p>
          Umpyre is a communication tool that let's you decide how much your attention is worth.
        </p>
        <SignUp />
      </Paper>
    </Container>
  </PageContent>
)

const PageContent = styled('div')``
