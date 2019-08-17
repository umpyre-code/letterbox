import { Button } from '@material-ui/core'
import ArrowBack from '@material-ui/icons/ArrowBack'
import * as React from 'react'
import * as Router from 'react-router-dom'

type Props = Router.RouteComponentProps<{}>

const BackButtonFC: React.FC<Props> = ({ history }) => (
  <Button
    onClick={() => {
      if (history.length > 0) {
        history.goBack()
      } else {
        history.push('/')
      }
    }}
  >
    <ArrowBack /> Back
  </Button>
)

export const BackButton = Router.withRouter(BackButtonFC)
