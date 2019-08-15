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
import { ApplicationState } from '../store'
import { API } from '../store/api'
import { emptyClientProfile } from '../store/client/types'
import { addDraftRequest } from '../store/drafts/actions'
import { ClientCredentials, ClientProfile } from '../store/models/client'

interface PropsFromState {
  readonly credentials?: ClientCredentials
  readonly myProfile?: ClientProfile
}

interface MatchParams {
  readonly handle?: string
  readonly client_id?: string
}

type AllProps = PropsFromState & Router.RouteComponentProps<MatchParams>

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

const ProfilePageFC: React.FC<AllProps> = ({ credentials, match, myProfile }) => {
  const [profile, setProfile] = React.useState<ClientProfile>(emptyClientProfile)
  const classes = useStyles({})

  React.useEffect(() => {
    async function fetchData() {
      const api = new API(credentials)
      if (
        (myProfile && match.params.handle !== myProfile.handle) ||
        (myProfile && match.params.client_id !== myProfile.handle)
      ) {
        setProfile(myProfile)
      } else if (match.params.handle) {
        const res = await api.fetchClientByHandle(match.params.handle)
        setProfile(res)
      } else if (match.params.client_id) {
        const res = await api.fetchClient(match.params.client_id)
        setProfile(res)
      }
    }
    fetchData()
  }, [match.params])

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
        <Typography variant="h2" component="h2">
          <strong>
            <Router.Link to="/">Umpyre</Router.Link>
          </strong>
        </Typography>
      </Container>
      <Divider />
      <Container className={classes.profileContainer}>
        <Profile profile={profile} editable={isEditable()} fullProfile />
      </Container>
    </React.Fragment>
  )
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  credentials: clientState.credentials!,
  myProfile: clientState.profile!
})

const mapDispatchToProps = {
  addDraft: addDraftRequest
}

const ProfilePage = Router.withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ProfilePageFC)
)
export default ProfilePage
