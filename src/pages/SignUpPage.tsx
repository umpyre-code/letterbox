import { Box, Container, Divider, Paper, Typography } from '@material-ui/core'
import * as React from 'react'
import { SignUpForm } from '../components/forms/SignUpForm'

const SignUpPage = () => (
  <Container maxWidth="sm">
    <Paper style={{ padding: 10 }}>
      <Box style={{ padding: '5px 0px 5px 0px' }}>
        <Typography component="h2" variant="h2">
          Join Umpyre
        </Typography>
      </Box>
      <Box style={{ padding: '5px 0px 5px 0px' }}>
        <Typography>Umpyre is a better way to communicate online.</Typography>
      </Box>
      <Divider />
      <SignUpForm />
    </Paper>
  </Container>
)

export default SignUpPage
