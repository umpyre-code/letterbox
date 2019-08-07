import { Container, CssBaseline, Link, Paper, Typography } from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import { storageIsAvailable } from '../db/storageIsAvailable'
import { ApplicationState } from '../store'
import { initializeClientRequest } from '../store/client/actions'
import Loading from './widgets/Loading'

interface Props {
  clientReady: boolean
  credentialsReady: boolean
  loading: boolean
}

interface PropsFromDispatch {
  initializeClient: typeof initializeClientRequest
}

// Global initialization variable
let globalClientIsInitialized = false

// Global storage state
let globalStorageIsAvailable = false

type AllProps = Props & PropsFromDispatch

const NoStorageAvailable: React.FC = () => (
  <React.Fragment>
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
              your browser's IndexedDB API
            </Link>
            ) for storing data. If you're using an older browser, or trying to use Umpyre in private
            browsing mode, it will not work.
          </Typography>
        </Container>
      </Paper>
    </Container>
  </React.Fragment>
)

const ClientInitFC: React.FC<AllProps> = ({
  children,
  clientReady,
  credentialsReady,
  initializeClient,
  loading
}) => {
  const [storageAvailable, setStorageAvailable] = React.useState<boolean>(globalStorageIsAvailable)
  // console.log(globalClientIsInitialized)

  React.useEffect(() => {
    if (!globalClientIsInitialized) {
      async function init() {
        const available = await storageIsAvailable()
        setStorageAvailable(available)
        globalStorageIsAvailable = available
      }
      init()
    }
    globalClientIsInitialized = true
  }, [])

  React.useEffect(() => {
    if (globalClientIsInitialized && !clientReady) {
      initializeClient()
    }
  }, [storageIsAvailable])

  if (!globalClientIsInitialized) {
    return <Loading centerOnPage />
  } else if (!loading && !storageAvailable) {
    return <NoStorageAvailable />
  } else if (!clientReady && !credentialsReady) {
    return <Loading centerOnPage />
  } else {
    return <React.Fragment>{children}</React.Fragment>
  }
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  clientReady: clientState.clientReady,
  credentialsReady: clientState.credentialsReady,
  loading: clientState.loading
})

const mapDispatchToProps = {
  initializeClient: initializeClientRequest
}

const ClientInit = connect(
  mapStateToProps,
  mapDispatchToProps
)(ClientInitFC)
export default ClientInit
