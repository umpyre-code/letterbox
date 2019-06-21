import * as React from 'react'
import styled from '../../utils/styled'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core/styles'
import purple from '@material-ui/core/colors/purple'
import green from '@material-ui/core/colors/green'
import 'typeface-lato'
import { connect } from 'react-redux'
import { ApplicationState } from '../../store'
import { initializeKeysRequest } from '../../store/keys/actions'
import { initializeClientRequest } from '../../store/client/actions'
import Loading from '../widgets/Loading'
import { fetchMessagesRequest } from '../../store/messages/actions'

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
  fetchMessagesRequest: typeof fetchMessagesRequest
}

interface PropsFromState {
  ready: boolean
}

type AllProps = PropsFromDispatch & PropsFromState

export class Root extends React.Component<AllProps> {
  componentWillMount() {
    this.fetchMessagesLoop(this.props)
    this.props.initializeClientRequest()
    this.props.initializeKeysRequest()
  }

  fetchMessagesLoop(props: AllProps) {
    console.log('fetch it the messages')
    props.fetchMessagesRequest()
    setTimeout(() => this.fetchMessagesLoop(props), 1000)
  }

  render() {
    if (this.props.ready) {
      return (
        <Wrapper>
          <ThemeProvider theme={theme}>{this.props.children}</ThemeProvider>
        </Wrapper>
      )
    } else {
      return <Loading />
    }
  }
}

const mapStateToProps = ({ clientState, keysState }: ApplicationState) => ({
  ready: keysState.ready && clientState.ready
})

const mapDispatchToProps = {
  initializeKeysRequest,
  initializeClientRequest,
  fetchMessagesRequest
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
