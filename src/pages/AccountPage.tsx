import {
  Container,
  createStyles,
  CssBaseline,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import { Profile } from '../components/widgets/profile/Profile'
import { ApplicationState } from '../store'
import { addDraftRequest } from '../store/drafts/actions'
import { ClientProfile } from '../store/models/client'

interface PropsFromState {
  profile: ClientProfile
}

interface PropsFromDispatch {}

type AllProps = PropsFromState & PropsFromDispatch

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    composeButton: {
      bottom: theme.spacing(2),
      margin: '0 auto',
      position: 'fixed',
      right: theme.spacing(2),
      zIndex: 1
    },
    draftContainer: {
      padding: theme.spacing(1)
    },
    headerContainer: {
      padding: theme.spacing(1)
    },
    messageListContainer: {
      padding: theme.spacing(1)
    }
  })
)

const AccountPageFC: React.FC<AllProps> = ({ profile }) => {
  const classes = useStyles()

  return (
    <React.Fragment>
      <CssBaseline />
      <Container className={classes.headerContainer}>
        <Typography variant="h2" component="h2">
          <strong>Umpyre</strong>
        </Typography>
      </Container>
      <Container>
        <Profile profile={profile} />
      </Container>
    </React.Fragment>
  )
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  profile: clientState.profile!
})

const mapDispatchToProps = {
  addDraft: addDraftRequest
}

const AccountPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountPageFC)
export default AccountPage
