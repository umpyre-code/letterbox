import green from '@material-ui/core/colors/green'
import purple from '@material-ui/core/colors/purple'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import * as React from 'react'
import { connect } from 'react-redux'
import 'typeface-lato'
import { ApplicationState } from '../../store'
import { initializeClientRequest } from '../../store/client/actions'
import { initializeKeysRequest } from '../../store/keys/actions'
import { fetchMessagesRequest } from '../../store/messages/actions'
import styled from '../../utils/styled'
import Loading from '../widgets/Loading'

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

class RootFC extends React.Component<AllProps> {
  public render() {
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

  public componentWillMount() {
    this.fetchMessagesLoop(this.props)
    this.props.initializeKeysRequest()
    this.props.initializeClientRequest()
  }

  private fetchMessagesLoop(props: AllProps) {
    props.fetchMessagesRequest()
    setTimeout(() => this.fetchMessagesLoop(props), 3000)
  }
}

const mapStateToProps = ({ clientState, keysState }: ApplicationState) => ({
  ready: keysState.ready && clientState.ready
})

const mapDispatchToProps = {
  fetchMessagesRequest,
  initializeClientRequest,
  initializeKeysRequest
}

export const Root = connect(
  mapStateToProps,
  mapDispatchToProps
)(RootFC)

const Wrapper = styled('div')`
  font-family: Lato, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  font-weight: 400;
`
