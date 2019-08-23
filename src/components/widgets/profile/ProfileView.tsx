import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  createStyles,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core'
import EditButton from '@material-ui/icons/Edit'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import SendIcon from '@material-ui/icons/Send'
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { ClientProfileHelper } from '../../../store/client/types'
import { addDraftRequest } from '../../../store/drafts/actions'
import { Balance } from '../../../store/models/account'
import { ClientProfile } from '../../../store/models/client'
import { markdownToHtml } from '../../../util/markdownToHtml'
import Loading from '../Loading'

// Set up moment duration format
momentDurationFormatSetup(moment)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actionContainer: {
      padding: theme.spacing(1)
    },
    addCreditsButton: {
      '& .plusButton': { display: 'none', fontSize: '1rem', color: theme.palette.primary.main },
      // '&:hover': {
      // color: '#f00'
      // },
      '&:hover .plusButton': {
        display: 'inline'
      },
      fontSize: '1.2rem',
      lineHeight: 1,
      margin: theme.spacing(0),
      minWidth: 0,
      padding: theme.spacing(1)
    },
    card: { padding: theme.spacing(1) },
    cardHeader: { padding: theme.spacing(1) },
    handleText: {
      color: 'rgba(0, 0, 0, 0.54)'
    },
    profileContainer: {
      padding: theme.spacing(0, 1, 0, 1)
    },
    profileTypography: {
      '& a:link': {
        textDecoration: 'underline'
      },
      fontFamily: [
        'Aleo',
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
    },
    sendIcon: {
      marginLeft: theme.spacing(1)
    }
  })
)

interface Props {
  balance?: Balance
  editable?: boolean
  fullProfile?: boolean
  menu?: boolean
  profile?: ClientProfile
  setIsEditing: (arg0: boolean) => void
}

interface ProfileMenuProps {
  profile?: ClientProfile
  menuAnchorElement: null | HTMLElement
  setMenuAnchorElementNull: () => void
}

function getProfileUrl(profile: ClientProfile) {
  if (profile.handle && profile.handle !== '') {
    return `/c/${profile.handle}`
  }
  return `/u/${profile.client_id}`
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  menuAnchorElement,
  profile,
  setMenuAnchorElementNull
}) => {
  const ProfileLink = React.forwardRef<
    HTMLAnchorElement,
    Omit<Router.LinkProps, 'innerRef' | 'to'>
  >((props, ref) => <Router.Link innerRef={ref} to={getProfileUrl(profile)} {...props} />)
  const AccountLink = React.forwardRef<
    HTMLAnchorElement,
    Omit<Router.LinkProps, 'innerRef' | 'to'>
  >((props, ref) => <Router.Link innerRef={ref} to="/account" {...props} />)
  const SignoutLink = React.forwardRef<
    HTMLAnchorElement,
    Omit<Router.LinkProps, 'innerRef' | 'to'>
  >((props, ref) => <Router.Link innerRef={ref} to="/signout" {...props} />)

  function handleMenuClose() {
    setMenuAnchorElementNull()
  }

  return (
    <Menu
      id="account-menu"
      anchorEl={menuAnchorElement}
      keepMounted
      open={Boolean(menuAnchorElement)}
      onClose={handleMenuClose}
    >
      <MenuItem button component={ProfileLink}>
        My Public Profile
      </MenuItem>
      <MenuItem button component={AccountLink}>
        My Account
      </MenuItem>
      <MenuItem button component={SignoutLink}>
        Sign out
      </MenuItem>
    </Menu>
  )
}

interface HandleProps {
  profile?: ClientProfile
}

export const Handle: React.FC<HandleProps> = ({ profile }) => {
  const classes = useStyles({})

  function getDateJoined() {
    const secondsSince = Date.now() / 1000 - profile.joined
    if (secondsSince < 300) {
      return 'joined just now'
    }
    return `joined ${(moment.duration(secondsSince, 'seconds') as any).format(
      'y [years], w [weeks], d [days], h [hours], m [minutes], s [seconds]',
      {
        largest: 1
      }
    )} ago`
  }

  if (profile && profile.handle && profile.handle.length > 0) {
    return (
      <Typography className={classes.handleText} variant="subtitle2">
        <Router.Link to={getProfileUrl(profile)}>{profile.handle}</Router.Link>&nbsp;
        {getDateJoined()}
      </Typography>
    )
  }
  return (
    <Typography className={classes.handleText} variant="subtitle2">
      {getDateJoined()}
    </Typography>
  )
}

interface ActionPropsFromDispatch {
  addDraft: typeof addDraftRequest
}

interface ActionValueProps {
  profile: ClientProfile
  editable?: boolean
  menu?: boolean
  setIsEditing: (arg0: boolean) => void
  setMenuAnchorElement: (arg0: any) => void
}

type ActionProps = ActionValueProps & ActionPropsFromDispatch & Router.RouteComponentProps<{}>

const ActionFC: React.FC<ActionProps> = ({
  addDraft,
  editable,
  history,
  menu,
  profile,
  setIsEditing,
  setMenuAnchorElement
}) => {
  const classes = useStyles({})

  if (editable) {
    return (
      <IconButton aria-label="Edit" onClick={() => setIsEditing(true)}>
        <EditButton color="secondary" />
      </IconButton>
    )
  }
  if (menu) {
    return (
      <IconButton
        aria-label="Settings"
        onClick={event => setMenuAnchorElement(event.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
    )
  }
  return (
    <Button
      variant="contained"
      color="primary"
      aria-label="Send message"
      onClick={() => {
        addDraft({ recipients: [profile.client_id] })
        history.push('/')
      }}
    >
      Message Me <SendIcon className={classes.sendIcon} />
    </Button>
  )
}

const mapDispatchToProps = {
  addDraft: addDraftRequest
}

const Action = Router.withRouter(
  connect(
    undefined,
    mapDispatchToProps
  )(ActionFC)
)

const AddCreditsLink = React.forwardRef<
  HTMLAnchorElement,
  Omit<Router.LinkProps, 'innerRef' | 'to'>
>((props, ref) => <Router.Link innerRef={ref} to="/addcredits" {...props} />)

interface BalanceProps {
  balance?: Balance
}

export const BalanceButton: React.FC<BalanceProps> = ({ balance }) => {
  const classes = useStyles({})

  if (balance !== undefined) {
    const amount = Math.floor((balance.balance_cents + balance.promo_cents) / 100)
    return (
      <Tooltip title="Add credits" enterDelay={500}>
        <Button className={classes.addCreditsButton} size="small" component={AddCreditsLink}>
          <span className="plusButton">+&nbsp;</span>${amount}
        </Button>
      </Tooltip>
    )
  }
  return null
}

export const ProfileView: React.FC<Props> = ({
  balance,
  editable,
  fullProfile,
  menu,
  profile,
  setIsEditing
}) => {
  const classes = useStyles({})
  const [menuAnchorElement, setMenuAnchorElement] = React.useState<null | HTMLElement>(null)

  const profileMenu = (
    <ProfileMenu
      menuAnchorElement={menuAnchorElement}
      setMenuAnchorElementNull={() => setMenuAnchorElement(null)}
      profile={profile}
    />
  )

  function getCardHeader() {
    if (profile) {
      const clientProfileHelper = ClientProfileHelper.FROM(profile)
      return (
        <CardHeader
          className={classes.cardHeader}
          avatar={
            <Router.Link to={getProfileUrl(profile)}>
              <Avatar alt={clientProfileHelper.full_name}>
                {clientProfileHelper.getInitials()}
              </Avatar>
            </Router.Link>
          }
          action={
            <Container className={classes.actionContainer}>
              <Action
                profile={profile}
                editable={editable}
                menu={menu}
                setIsEditing={setIsEditing}
                setMenuAnchorElement={setMenuAnchorElement}
              />
            </Container>
          }
          title={
            <Grid
              container
              style={{ padding: 0 }}
              spacing={0}
              justify="space-between"
              alignItems="center"
            >
              <Grid item zeroMinWidth>
                <Typography>
                  <Router.Link to={getProfileUrl(profile)}>{profile.full_name}</Router.Link>
                </Typography>
              </Grid>
              <Grid item zeroMinWidth>
                <BalanceButton balance={balance} />
              </Grid>
            </Grid>
          }
          subheader={<Handle profile={profile} />}
        />
      )
    }
    return <Loading />
  }

  function getProfileContent() {
    if (fullProfile && profile && profile.profile && profile.profile.length > 0) {
      return (
        <CardContent>
          <Typography component="sub" variant="subtitle1">
            About me
          </Typography>
          <Divider light />
          <Container className={classes.profileContainer}>
            <Typography
              className={classes.profileTypography}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(profile.profile) }}
            />
          </Container>
        </CardContent>
      )
    }
    return null
  }

  function getCardBody() {
    return <React.Fragment>{getProfileContent()}</React.Fragment>
  }

  return (
    <Card className={classes.card}>
      {getCardHeader()}
      {getCardBody()}
      {menu && profileMenu}
    </Card>
  )
}
