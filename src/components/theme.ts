import green from '@material-ui/core/colors/green'
import purple from '@material-ui/core/colors/purple'
import { createMuiTheme } from '@material-ui/core/styles'

export const theme = createMuiTheme({
  palette: {
    primary: purple,
    secondary: green
  },
  typography: {
    fontFamily: [
      'Lato Regular',
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
