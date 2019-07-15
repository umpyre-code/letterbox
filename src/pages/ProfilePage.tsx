import {
  Container,
  createStyles,
  CssBaseline,
  Divider,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import { Profile } from '../components/widgets/profile/Profile'
import { ApplicationState } from '../store'
import { addDraftRequest } from '../store/drafts/actions'
import { ClientProfile } from '../store/models/client'

interface PropsFromState {
  profile: ClientProfile
}

interface PropsFromDispatch {}

type AllProps = PropsFromState & PropsFromDispatch

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headerContainer: {
      padding: theme.spacing(1)
    },
    profileContainer: {
      padding: theme.spacing(1)
    }
  })
)

const ProfilePageFC: React.FC<AllProps> = ({ profile }) => {
  const classes = useStyles()

  return (
    <React.Fragment>
      <CssBaseline />
      <Container className={classes.headerContainer}>
        <Typography variant="h2" component="h2">
          <strong>Umpyre</strong>
        </Typography>
      </Container>
      <Divider />
      <Container className={classes.profileContainer}>
        <Profile profile={profile} editButton full />
      </Container>
    </React.Fragment>
  )
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  profile: clientState.profile!
})

const mapDispatchToProps = {
  addDraft: addDraftRequest
}

const ProfilePage = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfilePageFC)
export default ProfilePage
