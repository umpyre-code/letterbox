import { Container, Divider, Grid, Typography, Tooltip } from '@material-ui/core'
import { green } from '@material-ui/core/colors'
import Fab from '@material-ui/core/Fab'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Edit from '@material-ui/icons/Edit'
import * as React from 'react'
import { MessageList } from '../components/messages/MessageList'
import Loading from '../components/widgets/Loading'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1)
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
  const classes = useStyles()

  return (
    <Container>
      <Tooltip title="Compose a new message">
        <Fab
          color="primary"
          aria-label="Compose"
          className={classes.fab}
          onClick={() => setShowCompose(!showCompose)}
        >
          <Edit />
        </Fab>
      </Tooltip>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item xs={3}>
          <Typography variant="h2" component="h2">
            <strong>Umpyre</strong>
          </Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography>say nice things to nice people</Typography>
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
