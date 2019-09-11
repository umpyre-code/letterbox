import { ThemeProvider } from '@material-ui/styles'
import * as React from 'react'
import { theme } from '../theme'

const Root: React.FC = props => <ThemeProvider theme={theme}>{props.children}</ThemeProvider>

export default Root
