import * as React from 'react'
import styled from '../../utils/styled'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core/styles'
import purple from '@material-ui/core/colors/purple'
import green from '@material-ui/core/colors/green'
import 'typeface-lato'
import 'typeface-space-mono'
import { connect } from 'react-redux'
import { rootSaga, ConnectedReduxProps, ApplicationState } from '../../store'
import { initializeKeysRequest } from '../../store/keys/actions'
import { initializeClientRequest } from '../../store/client/actions'

const theme = createMuiTheme({
  palette: {
    primary: purple,
    secondary: green
  },
  typography: {
    fontFamily: [
      'Lato',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(',')
  }
})

interface PropsFromDispatch {
  initializeKeysRequest: typeof initializeKeysRequest
  initializeClientRequest: typeof initializeClientRequest
}

interface PropsFromState {
  ready: boolean
}

type AllProps = PropsFromDispatch & PropsFromState & ConnectedReduxProps

export class Root extends React.Component<AllProps> {
  componentWillMount() {
    this.props.initializeClientRequest()
    this.props.initializeKeysRequest()
  }

  render() {
    const { children } = this.props
    if (this.props.ready) {
      return (
        <Wrapper>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </Wrapper>
      )
    } else {
      return (
        <LoadingWrapper>
          <h1>loading it up...</h1>
        </LoadingWrapper>
      )
    }
  }
}

const mapStateToProps = ({ client, keys }: ApplicationState) => ({
  ready: keys.ready && client.ready
})

const mapDispatchToProps = {
  initializeKeysRequest,
  initializeClientRequest
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Root)

const Wrapper = styled('div')`
  font-family: Lato, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  font-weight: 400;
`

const LoadingWrapper = styled('div')`
  font-family: 'Space Mono', SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  font-weight: 400;
`
