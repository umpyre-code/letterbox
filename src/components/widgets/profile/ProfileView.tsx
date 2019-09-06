import {
  Button,
  Container,
  createStyles,
  Divider,
  Grid,
  IconButton,
  Link,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core'
import { LinkBaseProps } from '@material-ui/core/Link'
import EditButton from '@material-ui/icons/Edit'
import HelpIcon from '@material-ui/icons/Help'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import SendIcon from '@material-ui/icons/Send'
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { addDraftRequest } from '../../../store/drafts/actions'
import { Balance } from '../../../store/models/account'
import { ClientCredentials, ClientProfile } from '../../../store/models/client'
import { markdownToHtml } from '../../../util/markdownToHtml'
import Loading from '../Loading'
import { Badge, MiniBadge } from './Badge'
import { ImageUpload } from './ImageUpload'
import { ProfileAvatar } from './ProfileAvatar'

// Set up moment duration format
momentDurationFormatSetup(moment)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addCreditsButton: {
      '& .plusButton': {
        display: 'inline',
        visibility: 'hidden',
        fontSize: '1rem',
        color: theme.palette.primary.main
      },
      '&:hover .plusButton': {
        visibility: 'visible'
      },
      fontSize: '1.2rem',
      lineHeight: 1,
      margin: theme.spacing(0),
      minWidth: 0,
      padding: theme.spacing(1)
    },
    rootGrid: { padding: theme.spacing(1) },
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
  credentials?: ClientCredentials
  editable?: boolean
  fullProfile?: boolean
  menu?: boolean
  profile?: ClientProfile
  setIsEditing: (arg0: boolean) => void
  avatarChanged?: () => void
  tooltip?: boolean
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
  const AboutLink = React.forwardRef<HTMLAnchorElement, Omit<Router.LinkProps, 'innerRef' | 'to'>>(
    (props, ref) => <Router.Link innerRef={ref} to="/about" {...props} />
  )
  const BlogLink = React.forwardRef<HTMLAnchorElement, Omit<LinkBaseProps, 'innerRef' | 'to'>>(
    (props, ref) => (
      <Link innerRef={ref} href="https://blog.umpyre.com" target="_blank" {...props} />
    )
  )

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
      <MenuItem button component={AboutLink}>
        About Umpyre
      </MenuItem>
      <MenuItem button component={BlogLink}>
        Umpyre Blog
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
      <Typography noWrap className={classes.handleText} variant="subtitle2">
        <Router.Link to={getProfileUrl(profile)}>{profile.handle}</Router.Link>&nbsp;
        {getDateJoined()}
      </Typography>
    )
  }
  return (
    <Typography className={classes.handleText} variant="subtitle2" noWrap>
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
  tooltip: boolean
}

type ActionProps = ActionValueProps & ActionPropsFromDispatch & Router.RouteComponentProps<{}>

const ActionFC: React.FC<ActionProps> = ({
  addDraft,
  editable,
  history,
  menu,
  profile,
  setIsEditing,
  setMenuAnchorElement,
  tooltip
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
  if (!tooltip) {
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
        Message <SendIcon className={classes.sendIcon} />
      </Button>
    )
  }
  return null
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

interface RalProps {
  profile?: ClientProfile
}

export const Ral: React.FC<RalProps> = ({ profile }) => {
  return (
    <MiniBadge>
      <Typography>
        RAL: ${profile.ral}
        <Tooltip
          enterDelay={500}
          leaveDelay={100}
          title={
            <React.Fragment>
              <Typography>
                <em>Reading at level</em>, or RAL, is the estimated reading level for this person.
              </Typography>
              <br />
              <Typography>
                To reach someone, we recommend pricing your message at or above this level.
              </Typography>
            </React.Fragment>
          }
        >
          <HelpIcon style={{ padding: 4, verticalAlign: 'top' }}>what&apos;s RAL</HelpIcon>
        </Tooltip>
      </Typography>
    </MiniBadge>
  )
}

export const ProfileView: React.FC<Props> = ({
  avatarChanged,
  balance,
  credentials,
  editable,
  fullProfile,
  menu,
  profile,
  setIsEditing,
  tooltip
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
      return (
        <React.Fragment>
          <Grid item style={{ padding: '5px' }}>
            {!editable && (
              <Router.Link to={getProfileUrl(profile)}>
                <ProfileAvatar profile={profile} size={fullProfile ? 'medium' : 'small'} />
              </Router.Link>
            )}
            {editable && (
              <ImageUpload
                profile={profile}
                credentials={credentials}
                uploadSuccess={() => {
                  if (avatarChanged) {
                    avatarChanged()
                  }
                }}
              />
            )}
          </Grid>

          <Grid
            item
            container
            direction="column"
            alignItems="flex-start"
            justify="flex-start"
            style={{ maxWidth: '100%' }}
            xs
            zeroMinWidth
          >
            <Grid item zeroMinWidth xs>
              <Typography noWrap variant={fullProfile ? 'h4' : 'subtitle1'}>
                <Router.Link to={getProfileUrl(profile)}>{profile.full_name}</Router.Link>
              </Typography>
              <Handle profile={profile} />
            </Grid>
          </Grid>
          {balance && (
            <Grid item>
              <BalanceButton balance={balance} />
            </Grid>
          )}
          <Grid item>
            <Action
              profile={profile}
              editable={editable}
              menu={menu}
              setIsEditing={setIsEditing}
              setMenuAnchorElement={setMenuAnchorElement}
              tooltip={tooltip}
            />
          </Grid>
          {fullProfile && (
            <Grid
              item
              container
              justify="flex-end"
              alignItems="flex-end"
              spacing={1}
              zeroMinWidth
              xs={12}
              style={{ marginTop: '-50px' }}
            >
              <Grid item zeroMinWidth>
                <Ral profile={profile} />
              </Grid>
              {editable && (
                <Grid item zeroMinWidth>
                  <Badge profile={profile} />
                </Grid>
              )}
            </Grid>
          )}
        </React.Fragment>
      )
    }
    return <Loading />
  }

  function getProfileContent() {
    if (fullProfile && profile && profile.profile && profile.profile.length > 0) {
      return (
        <Grid item>
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
        </Grid>
      )
    }
    return null
  }

  function getCardBody() {
    return <React.Fragment>{getProfileContent()}</React.Fragment>
  }

  return (
    <Paper>
      <Grid container className={classes.rootGrid}>
        <Grid item xs={12} container spacing={1}>
          {getCardHeader()}
          {menu && profileMenu}
        </Grid>
        <Grid item xs={12}>
          {getCardBody()}
        </Grid>
      </Grid>
    </Paper>
  )
}

ProfileView.defaultProps = {
  tooltip: false
}
