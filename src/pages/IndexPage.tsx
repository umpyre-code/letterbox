import {
  Container,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core'
import Fab from '@material-ui/core/Fab'
import Edit from '@material-ui/icons/Edit'
import * as React from 'react'
import { connect } from 'react-redux'
import { MessageList } from '../components/messages/MessageList'
import Loading from '../components/widgets/Loading'
import { Profile } from '../components/widgets/Profile'
import { ApplicationState } from '../store'
import { ClientProfile } from '../store/models/client'

const LazyComposeForm = React.lazy(() => import('../components/forms/compose/ComposeForm'))

interface Props {
  profile: ClientProfile
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    composeButton: {
      bottom: theme.spacing(2),
      position: 'absolute',
      right: theme.spacing(2),
      zIndex: 1000
    }
  })
)

const IndexPageFC: React.FC<Props> = ({ profile }) => {
  const [showCompose, setShowCompose] = React.useState(false)
  const classes = useStyles()

  return (
    <Container>
      <Tooltip title="Compose a new message">
        <Fab
          className={classes.composeButton}
          color="primary"
          aria-label="Compose"
          onClick={() => setShowCompose(!showCompose)}
        >
          <Edit />
        </Fab>
      </Tooltip>
      <Grid container spacing={1} justify="space-between">
        <Grid item xs={7}>
          <Typography variant="h2" component="h2">
            <strong>Umpyre</strong>
          </Typography>
        </Grid>
        <Grid item xs={5}>
          <Profile profile={profile} />
        </Grid>
        <Grid item xs style={{ position: 'relative' }}></Grid>
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

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  profile: clientState.profile!
})

const IndexPage = connect(mapStateToProps)(IndexPageFC)
export default IndexPage
