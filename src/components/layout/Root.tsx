import { ThemeProvider } from '@material-ui/styles'
import * as React from 'react'
import { connect } from 'react-redux'
import { ApplicationState } from '../../store'
import { secureMathRandom } from '../../util/secureMathRandom'
import { theme } from '../theme'

interface PropsFromDispatch {}

interface PropsFromState {
  ready: boolean
}

type AllProps = PropsFromDispatch & PropsFromState

class RootFC extends React.Component<AllProps> {
  public render() {
    return <ThemeProvider theme={theme}>{this.props.children}</ThemeProvider>
  }

  public componentWillMount() {
    // Reload the page every ~24h +/- 2h. This is a hack to make sure clients
    // don't end up on an ancient version of the app.
    const sway = 4 * secureMathRandom() * 3600 - 2 * 3600
    const reloadAfter = Math.round(24 * 3600 + sway)
    setTimeout(() => window.location.reload(true), 1000 * reloadAfter)
  }
}

const mapStateToProps = ({ clientState, keysState }: ApplicationState) => ({
  ready: clientState.ready
})

const mapDispatchToProps = {}

const Root = connect(
  mapStateToProps,
  mapDispatchToProps
)(RootFC)

export default Root
