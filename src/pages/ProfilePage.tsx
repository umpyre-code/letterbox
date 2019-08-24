import { Container, createStyles, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { DefaultLayout } from '../components/layout/DefaultLayout'
import { BackToIndexButton } from '../components/widgets/BackToIndexButton'
import { Profile } from '../components/widgets/profile/Profile'
import { API } from '../store/api'
import { ApplicationState } from '../store/ApplicationState'
import { loadCredentialsRequest } from '../store/client/actions'
import { emptyClientProfile } from '../store/client/types'
import { Balance } from '../store/models/account'
import { ClientCredentials, ClientProfile } from '../store/models/client'
import Loading from '../components/widgets/Loading'

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
  const [loaded, setLoaded] = React.useState<boolean>(false)
  const [isEditable, setIsEditable] = React.useState<boolean>(false)
  const [profile, setProfile] = React.useState<ClientProfile>(emptyClientProfile)
  const classes = useStyles({})

  React.useEffect(() => {
    loadCredentials()
  }, [])

  React.useEffect(() => {
    async function fetchData() {
      const api = new API(credentials)
      if (
        myProfile &&
        (match.params.handle === myProfile.handle || match.params.clientId === myProfile.client_id)
      ) {
        setIsEditable(true)
        setProfile(myProfile)
      } else if (match.params.handle) {
        const res = await api.fetchClientByHandle(match.params.handle)
        setProfile(res)
      } else if (match.params.clientId) {
        const res = await api.fetchClient(match.params.clientId)
        setProfile(res)
      }
      setLoaded(true)
    }
    fetchData()
  }, [match.params, myProfile])

  return (
    <React.Fragment>
      <DefaultLayout profile={myProfile} balance={balance}>
        <Container className={classes.profileContainer}>
          <BackToIndexButton />
          {loaded && <Profile profile={profile} editable={isEditable} fullProfile />}
          {!loaded && <Loading />}
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
