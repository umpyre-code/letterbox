import { Container, CssBaseline, Link, Paper, Typography } from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import { storageIsAvailable } from '../db/storageIsAvailable'
import { ApplicationState } from '../store/ApplicationState'
import { loadCredentialsRequest } from '../store/client/actions'
import Loading from './widgets/Loading'

interface Props {
  clientLoading: boolean
  clientReady: boolean
  credentialsLoading: boolean
  credentialsReady: boolean
}

interface PropsFromDispatch {
  loadCredentials: typeof loadCredentialsRequest
}

// Global initialization variable
let globalClientIsInitialized = false

// Global storage state
let globalStorageIsAvailable = false

type AllProps = Props & PropsFromDispatch

const NoStorageAvailable: React.FC = () => (
  <>
    <CssBaseline />
    <Container>
      <Paper style={{ margin: 20 }}>
        <Container style={{ padding: 20 }}>
          <Typography variant="h5">There was a problem initializing local storage.</Typography>
        </Container>
        <Container style={{ padding: 20 }}>
          <Typography variant="body1">
            Umpyre uses local storage (
            <Link href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API">
              your browser&apos;s IndexedDB API
            </Link>
            ) for storing data. If you&apos;re using an older browser, or trying to use Umpyre in
            private browsing mode, it will not work.
          </Typography>
        </Container>
      </Paper>
    </Container>
  </>
)

const ClientInitFC: React.FC<AllProps> = ({
  children,
  clientLoading,
  clientReady,
  credentialsLoading,
  credentialsReady,
  loadCredentials
}) => {
  const [storageAvailable, setStorageAvailable] = React.useState<boolean>(globalStorageIsAvailable)

  async function init() {
    const available = await storageIsAvailable()
    setStorageAvailable(available)
    globalStorageIsAvailable = available
  }

  React.useEffect(() => {
    if (!globalClientIsInitialized) {
      init()
    }
    globalClientIsInitialized = true
  }, [])

  React.useEffect(() => {
    if (globalClientIsInitialized && !clientReady) {
      loadCredentials()
    }
  }, [storageIsAvailable])

  if (!globalClientIsInitialized) {
    return <Loading centerOnPage />
  }
  if (!credentialsLoading && !clientLoading && !storageAvailable) {
    return <NoStorageAvailable />
  }
  if (!clientReady && !credentialsReady) {
    return <Loading centerOnPage />
  }
  return <>{children}</>
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  clientLoading: clientState.clientLoading,
  clientReady: clientState.clientReady,
  credentialsLoading: clientState.credentialsLoading,
  credentialsReady: clientState.credentialsReady
})

const mapDispatchToProps = {
  loadCredentials: loadCredentialsRequest
}

const ClientInit = connect(
  mapStateToProps,
  mapDispatchToProps
)(ClientInitFC)
export default ClientInit
