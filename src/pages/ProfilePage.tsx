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
import * as Router from 'react-router-dom'
import { Profile } from '../components/widgets/profile/Profile'
import { API } from '../store/api'
import { ApplicationState } from '../store/ApplicationState'
import { emptyClientProfile } from '../store/client/types'
import { ClientCredentials, ClientProfile } from '../store/models/client'
import { loadCredentialsRequest } from '../store/client/actions'
import { Logotype } from '../components/widgets/Logotype'
import { BackButton } from '../components/widgets/BackButton'

interface PropsFromState {
  readonly credentials?: ClientCredentials
  readonly myProfile?: ClientProfile
}

interface PropsFromDispatch {
  loadCredentials: typeof loadCredentialsRequest
}

interface MatchParams {
  readonly handle?: string
  readonly clientId?: string
}

type AllProps = PropsFromState & PropsFromDispatch & Router.RouteComponentProps<MatchParams>

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

const ProfilePageFC: React.FC<AllProps> = ({ credentials, loadCredentials, match, myProfile }) => {
  const [profile, setProfile] = React.useState<ClientProfile>(emptyClientProfile)
  const classes = useStyles({})

  React.useEffect(() => {
    loadCredentials()
  }, [])

  React.useEffect(() => {
    async function fetchData() {
      const api = new API(credentials)
      if (
        (myProfile && match.params.handle !== myProfile.handle) ||
        (myProfile && match.params.clientId !== myProfile.handle)
      ) {
        setProfile(myProfile)
      } else if (match.params.handle) {
        const res = await api.fetchClientByHandle(match.params.handle)
        setProfile(res)
      } else if (match.params.clientId) {
        const res = await api.fetchClient(match.params.clientId)
        setProfile(res)
      }
    }
    fetchData()
  }, [match.params, myProfile])

  function isEditable(): boolean {
    return (
      profile !== undefined &&
      profile.client_id !== undefined &&
      credentials !== undefined &&
      credentials.client_id !== undefined &&
      profile.client_id === credentials.client_id
    )
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Container className={classes.headerContainer}>
        <Router.Link to="/">
          <Logotype />
        </Router.Link>
      </Container>
      <Divider />
      <Container className={classes.profileContainer}>
        <BackButton />
        <Profile profile={profile} editable={isEditable()} fullProfile />
      </Container>
    </React.Fragment>
  )
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  credentials: clientState.credentials,
  myProfile: clientState.profile
})

const mapDispatchToProps = {
  loadCredentials: loadCredentialsRequest
}

const ProfilePage = Router.withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ProfilePageFC)
)
export default ProfilePage
