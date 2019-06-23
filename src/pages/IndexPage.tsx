import { Container, Typography } from '@material-ui/core'
import { green } from '@material-ui/core/colors'
import Fab from '@material-ui/core/Fab'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Edit from '@material-ui/icons/Edit'
import * as React from 'react'
import MessageList from '../components/messages/MessageList'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      bottom: theme.spacing(2),
      position: 'absolute',
      right: theme.spacing(2)
    },
    fabGreen: {
      '&:hover': {
        backgroundColor: green[600]
      },
      backgroundColor: green[500],
      color: theme.palette.common.white
    }
  })
)

const LazyComposeForm = React.lazy(() => import('../components/forms/ComposeForm'))

const IndexPage = () => {
  const [showCompose, setShowCompose] = React.useState(false)

  return (
    <Container>
      <Fab
        color="primary"
        aria-label="Compose"
        className={useStyles().fab}
        onClick={() => setShowCompose(!showCompose)}
      >
        <Edit />
      </Fab>
      <Container>
        <Typography variant="h1" component="h1">
          Hello 😇
        </Typography>
        <MessageList />
      </Container>
      {showCompose ? (
        <Container>
          <LazyComposeForm />
        </Container>
      ) : null}
    </Container>
  )
}

export default IndexPage
