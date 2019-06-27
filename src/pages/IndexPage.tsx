import { Container, Divider, Grid, Typography } from '@material-ui/core'
import { green } from '@material-ui/core/colors'
import Fab from '@material-ui/core/Fab'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Edit from '@material-ui/icons/Edit'
import * as React from 'react'
import MessageList from '../components/messages/MessageList'
import Loading from '../components/widgets/Loading'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      bottom: theme.spacing(2),
      position: 'absolute',
      right: theme.spacing(2)
    },
    fabGreen: {
      '&:hover': {
        backgroundColor: green[600]
      },
      backgroundColor: green[500],
      color: theme.palette.common.white
    }
  })
)

const LazyComposeForm = React.lazy(() => import('../components/forms/ComposeForm'))

const IndexPage = () => {
  const [showCompose, setShowCompose] = React.useState(false)

  return (
    <Container>
      <Fab
        color="primary"
        aria-label="Compose"
        className={useStyles().fab}
        onClick={() => setShowCompose(!showCompose)}
      >
        <Edit />
      </Fab>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h2" component="h2">
            <strong>Umpyre</strong>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <MessageList />
        </Grid>
        {showCompose ? (
          <Grid item xs={12}>
            <React.Suspense fallback={<Loading />}>
              <LazyComposeForm />
            </React.Suspense>
          </Grid>
        ) : null}
      </Grid>
    </Container>
  )
}

export default IndexPage
