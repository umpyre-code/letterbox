import * as React from 'react'
import styled from '../utils/styled'
import { Container, Paper } from '@material-ui/core'

export default () => (
  <PageContent>
    <Container>
      <Paper style={{ padding: 10 }}>
        <h1>Welcome fren 😇</h1>
      </Paper>
    </Container>
  </PageContent>
)

const PageContent = styled('div')``
