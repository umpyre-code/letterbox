import {
  Container,
  createStyles,
  CssBaseline,
  Divider,
  Grid,
  makeStyles,
  Theme
} from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { BackToIndexButton } from '../components/widgets/BackToIndexButton'
import { Logotype } from '../components/widgets/Logotype'
import { Profile } from '../components/widgets/profile/Profile'
import { API } from '../store/api'
import { ApplicationState } from '../store/ApplicationState'
import { loadCredentialsRequest } from '../store/client/actions'
import { emptyClientProfile } from '../store/client/types'
import { Balance } from '../store/models/account'
import { ClientCredentials, ClientProfile } from '../store/models/client'
import { DefaultLayout } from '../components/layout/DefaultLayout'

interface PropsFromState {
  readonly balance?: Balance
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

const ProfilePageFC: React.FC<AllProps> = ({
  balance,
  credentials,
  loadCredentials,
  match,
  myProfile
}) => {
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
      <DefaultLayout profile={myProfile} balance={balance}>
        <Container className={classes.profileContainer}>
          <BackToIndexButton />
          <Profile profile={profile} editable={isEditable()} fullProfile />
        </Container>
      </DefaultLayout>
    </React.Fragment>
  )
}

const mapStateToProps = ({ accountState, clientState }: ApplicationState) => ({
  balance: accountState.balance,
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
