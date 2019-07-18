import { ThemeProvider } from '@material-ui/styles'
import * as React from 'react'
import { connect } from 'react-redux'
import 'typeface-lato'
import { ApplicationState } from '../../store'
import { initializeClientRequest } from '../../store/client/actions'
import { secureMathRandom } from '../../util/secureMathRandom'
import { theme } from '../theme'
import Loading from '../widgets/Loading'

interface PropsFromDispatch {
  initializeClientRequest: typeof initializeClientRequest
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
      return <Loading centerOnPage={true} />
    }
  }

  public componentWillMount() {
    this.props.initializeClientRequest()

    // Reload the page every ~24h +/- 2h
    const sway = 4 * secureMathRandom() * 3600 - 2 * 3600
    const reloadAfter = Math.round(24 * 3600 + sway)
    setTimeout(() => window.location.reload(true), 1000 * reloadAfter)
  }
}

const mapStateToProps = ({ clientState, keysState }: ApplicationState) => ({
  ready: keysState.ready && clientState.ready
})

const mapDispatchToProps = {
  initializeClientRequest
}

const Root = connect(
  mapStateToProps,
  mapDispatchToProps
)(RootFC)

export default Root
