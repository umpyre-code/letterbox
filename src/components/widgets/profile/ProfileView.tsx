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
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'
import * as React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { ClientProfileHelper } from '../../../store/client/types'
import { Balance } from '../../../store/models/account'
import { ClientProfile } from '../../../store/models/client'
import { markdownToHtml } from '../../../util/markdownToHtml'
import Loading from '../Loading'

// Set up moment duration format
momentDurationFormatSetup(moment)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    cardHeader: { padding: theme.spacing(1) },
    handleText: {
      color: 'rgba(0, 0, 0, 0.54)'
    },
    profileContainer: {
      padding: theme.spacing(0, 1, 0, 1)
    },
    profileTypography: {
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
  menuAnchorElement: null | HTMLElement
  setMenuAnchorElementNull: () => void
}

function getProfileUrl(profile: ClientProfile) {
  if (profile.handle && profile.handle !== '') {
    return `/c/${profile.handle}`
  } else {
    return `/u/${profile.client_id}`
  }
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  menuAnchorElement,
  setMenuAnchorElementNull
}) => {
  function handleMenuClose() {
    setMenuAnchorElementNull()
  }

  return (
    <Menu
      id="simple-menu"
      anchorEl={menuAnchorElement}
      keepMounted
      open={Boolean(menuAnchorElement)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>
        <Link to="/profile">My Public Profile</Link>
      </MenuItem>
      <MenuItem onClick={handleMenuClose}>
        <Link to="/account">My Account</Link>
      </MenuItem>
      <MenuItem onClick={handleMenuClose}>
        <Link to="/signout">Sign out</Link>
      </MenuItem>
    </Menu>
  )
}

interface HandleProps {
  profile?: ClientProfile
}

export const Handle: React.FC<HandleProps> = ({ profile }) => {
  const classes = useStyles()

  function getDateJoined() {
    const secondsSince = Date.now() / 1000 - profile!.joined
    return `joined ${moment
      .duration(secondsSince, 'seconds')
      .format('y [years], w [weeks], d [days], h [hours], m [minutes], s [seconds]', {
        largest: 1
      })} ago`
  }

  if (profile && profile.handle && profile.handle.length > 0) {
    return (
      <Typography className={classes.handleText} variant="subtitle2">
        <Link to={getProfileUrl(profile)}>{profile.handle}</Link>&nbsp;{getDateJoined()}
      </Typography>
    )
  } else {
    return (
      <Typography className={classes.handleText} variant="subtitle2">
        {getDateJoined()}
      </Typography>
    )
  }
}

interface ActionProps {
  editable?: boolean
  menu?: boolean
  setIsEditing: (arg0: boolean) => void
  setMenuAnchorElement: (arg0: any) => void
}

export const Action: React.FC<ActionProps> = ({
  editable,
  menu,
  setIsEditing,
  setMenuAnchorElement
}) => {
  if (editable) {
    return (
      <IconButton aria-label="Edit" onClick={() => setIsEditing(true)}>
        <EditButton color="secondary" />
      </IconButton>
    )
  } else if (menu) {
    return (
      <IconButton
        aria-label="Settings"
        onClick={event => setMenuAnchorElement(event.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
    )
  } else {
    return null
  }
}

const AdapterLink = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
  <Link innerRef={ref as any} {...props} />
))

const CollisionLink = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, 'innerRef' | 'to'>>(
  (props, ref) => <Link innerRef={ref as any} to="/addcredits" {...props} />
)

interface BalanceProps {
  balance?: Balance
}

export const BalanceButton: React.FC<BalanceProps> = ({ balance }) => {
  const classes = useStyles()

  if (balance !== undefined) {
    const amount = Math.floor((balance.balance_cents + balance.promo_cents) / 100)
    return (
      <Tooltip title="Add credits" enterDelay={500}>
        <Button className={classes.addCreditsButton} size="small" component={CollisionLink}>
          <span className="plusButton">+&nbsp;</span>${amount}
        </Button>
      </Tooltip>
    )
  } else {
    return null
  }
}

export const ProfileView: React.FC<Props> = ({
  balance,
  editable,
  fullProfile,
  menu,
  profile,
  setIsEditing
}) => {
  const classes = useStyles()
  const [menuAnchorElement, setMenuAnchorElement] = React.useState<null | HTMLElement>(null)

  const profileMenu = (
    <ProfileMenu
      menuAnchorElement={menuAnchorElement}
      setMenuAnchorElementNull={() => setMenuAnchorElement(null)}
    />
  )

  function getCardHeader() {
    if (profile) {
      const clientProfileHelper = ClientProfileHelper.FROM(profile)
      return (
        <CardHeader
          className={classes.cardHeader}
          avatar={
            <Link to={getProfileUrl(profile)}>
              <Avatar alt={clientProfileHelper.full_name}>
                {clientProfileHelper.getInitials()}
              </Avatar>
            </Link>
          }
          action={
            <Action
              editable={editable}
              menu={menu}
              setIsEditing={setIsEditing}
              setMenuAnchorElement={setMenuAnchorElement}
            />
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
                  <Link to={getProfileUrl(profile)}>{profile.full_name}</Link>
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
    } else {
      return <Loading />
    }
  }

  function getCardBody() {
    return <React.Fragment>{getProfileContent()}</React.Fragment>
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
            {/* tslint:disable-next-line: react-no-dangerous-html */}
            <Typography
              className={classes.profileTypography}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(profile.profile!) }}
            />
          </Container>
        </CardContent>
      )
    } else {
      return null
    }
  }

  return (
    <Card>
      {getCardHeader()}
      {getCardBody()}
      {menu && profileMenu}
    </Card>
  )
}
