import { ThemeProvider } from '@material-ui/styles'
import * as React from 'react'
import { secureMathRandom } from '../../util/secureMathRandom'
import { theme } from '../theme'

class Root extends React.Component {
  public componentDidMount() {
    // Reload the page every ~24h +/- 2h. This is a hack to make sure clients
    // don't end up on an ancient version of the app.
    const sway = 4 * secureMathRandom() * 3600 - 2 * 3600
    const reloadAfter = Math.round(24 * 3600 + sway)
    setTimeout(() => window.location.reload(true), 1000 * reloadAfter)
  }

  public render() {
    return <ThemeProvider theme={theme}>{this.props.children}</ThemeProvider>
  }
}

export default Root
