import { Container, Divider, Grid, Typography, Tooltip, Box } from '@material-ui/core'
import { green } from '@material-ui/core/colors'
import Fab from '@material-ui/core/Fab'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Edit from '@material-ui/icons/Edit'
import * as React from 'react'
import { MessageList } from '../components/messages/MessageList'
import Loading from '../components/widgets/Loading'

const LazyComposeForm = React.lazy(() => import('../components/forms/ComposeForm'))

const IndexPage = () => {
  const [showCompose, setShowCompose] = React.useState(false)

  return (
    <Container>
      <Grid container spacing={1} justify="space-between">
        <Grid item xs={3}>
          <Typography variant="h2" component="h2">
            <strong>Umpyre</strong>
          </Typography>
        </Grid>
        <Grid item xs style={{ position: 'relative' }}>
          <Typography style={{ left: '0px', bottom: '0px', position: 'absolute' }}>
            say nice things to nice people
          </Typography>
        </Grid>
        <Grid item xs style={{ position: 'relative' }}>
          <Tooltip title="Compose a new message">
            <Fab
              style={{ right: '0px', position: 'absolute' }}
              color="primary"
              aria-label="Compose"
              onClick={() => setShowCompose(!showCompose)}
            >
              <Edit />
            </Fab>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        {showCompose ? (
          <Grid item xs={12}>
            <React.Suspense fallback={<Loading />}>
              <LazyComposeForm />
            </React.Suspense>
          </Grid>
        ) : null}
        <Grid item xs={12}>
          <MessageList />
        </Grid>
      </Grid>
    </Container>
  )
}

export default IndexPage
