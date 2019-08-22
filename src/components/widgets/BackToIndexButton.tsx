import { Button } from '@material-ui/core'
import ArrowBack from '@material-ui/icons/ArrowBack'
import * as React from 'react'
import * as Router from 'react-router-dom'

type Props = Router.RouteComponentProps<{}>

const BackToIndexButtonFC: React.FC<Props> = ({ history }) => (
  <Button
    onClick={() => {
      history.push('/')
    }}
  >
    <ArrowBack /> Back
  </Button>
)

export const BackToIndexButton = Router.withRouter(BackToIndexButtonFC)
