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
import { DraftList } from '../components/drafts/DraftList'
import { MessageList } from '../components/messages/MessageList'
import { Profile } from '../components/widgets/Profile'
import { ApplicationState } from '../store'
import { addDraftRequest } from '../store/drafts/actions'
import { ClientProfile } from '../store/models/client'

interface PropsFromState {
  profile: ClientProfile
}

interface PropsFromDispatch {
  addDraft: typeof addDraftRequest
}

type AllProps = PropsFromState & PropsFromDispatch

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

const IndexPageFC: React.FC<AllProps> = ({ profile, addDraft }) => {
  const classes = useStyles()

  return (
    <Container>
      <Tooltip title="Compose a new message">
        <Fab
          className={classes.composeButton}
          color="primary"
          aria-label="Compose"
          onClick={addDraft}
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
        <Grid item xs={12}>
          <DraftList />
        </Grid>
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

const mapDispatchToProps = {
  addDraft: addDraftRequest
}

const IndexPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(IndexPageFC)
export default IndexPage
