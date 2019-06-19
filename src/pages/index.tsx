import * as React from 'react'
import styled from '../utils/styled'
import { Container, Paper } from '@material-ui/core'
import MessageList from '../components/messages/MessageList'

export default () => (
  <PageContent>
    <Container>
      <h1>Hello 😇</h1>
      <MessageList />
    </Container>
  </PageContent>
)

const PageContent = styled('div')``
