import { ThemeProvider } from '@material-ui/styles'
import * as React from 'react'
import { connect } from 'react-redux'
import 'typeface-lato'
import { ApplicationState } from '../../store'
import { initializeClientRequest } from '../../store/client/actions'
import { initializeKeysRequest } from '../../store/keys/actions'
import { initializeMessagesRequest } from '../../store/messages/actions'
import { secureMathRandom } from '../../util/secureMathRandom'
import { theme } from '../theme'
import Loading from '../widgets/Loading'

interface PropsFromDispatch {
  initializeKeysRequest: typeof initializeKeysRequest
  initializeClientRequest: typeof initializeClientRequest
  initializeMessagesRequest: typeof initializeMessagesRequest
}

interface PropsFromState {
  ready: boolean
}

type AllProps = PropsFromDispatch & PropsFromState

class RootFC extends React.Component<AllProps> {
  public render() {
    if (this.props.ready) {
      return <ThemeProvider theme={theme}>{this.props.children}</ThemeProvider>
    } else {
      return <Loading />
    }
  }

  public componentWillMount() {
    this.props.initializeKeysRequest()
    this.props.initializeClientRequest()
    this.props.initializeMessagesRequest()

    // Reload the page every ~24h
    const sway = secureMathRandom() * 3600 - 1800
    setTimeout(() => window.location.reload(true), 1000 * (24 * 3600 + sway))
  }
}

const mapStateToProps = ({ clientState, keysState }: ApplicationState) => ({
  ready: keysState.ready && clientState.ready
})

const mapDispatchToProps = {
  initializeClientRequest,
  initializeKeysRequest,
  initializeMessagesRequest
}

export const Root = connect(
  mapStateToProps,
  mapDispatchToProps
)(RootFC)
