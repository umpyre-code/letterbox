import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Container,
  createStyles,
  Divider,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
  Typography
} from '@material-ui/core'
import EditButton from '@material-ui/icons/Edit'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { ClientProfileHelper } from '../../../store/client/types'
import { Balance, ClientProfile } from '../../../store/models/client'
import { markdownToHtml } from '../../../util/markdownToHtml'
import Loading from '../Loading'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    handleText: {
      color: 'rgba(0, 0, 0, 0.54)'
    },
    profileContainer: {
      padding: theme.spacing(0, 1, 0, 1)
    }
  })
)

interface Props {
  balance?: Balance
  editable?: boolean
  menu?: boolean
  profile?: ClientProfile
  setIsEditing: (arg0: boolean) => void
}

interface ProfileMenuProps {
  menuAnchorElement: null | HTMLElement
  setMenuAnchorElementNull: () => void
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
        <Link to="/logout">Logout</Link>
      </MenuItem>
    </Menu>
  )
}

interface HandleProps {
  profile?: ClientProfile
}

export const Handle: React.FC<HandleProps> = ({ profile }) => {
  const classes = useStyles()
  if (profile && profile.handle && profile.handle.length > 0) {
    return (
      <Link to={`/c/${profile.handle}`}>
        <Typography className={classes.handleText} variant="subtitle2">
          {profile.handle}
        </Typography>
      </Link>
    )
  } else {
    return null
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

export const ProfileView: React.FC<Props> = ({
  balance,
  editable,
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

  function getBalance() {
    if (balance !== undefined) {
      const amount = Math.floor(100 * (balance.balance_cents + balance.promo_cents))
      return <Typography>${amount}</Typography>
    } else {
      return null
    }
  }

  function getCardHeader() {
    if (profile) {
      const clientProfileHelper = ClientProfileHelper.FROM(profile)
      return (
        <CardHeader
          avatar={
            <Avatar alt={clientProfileHelper.full_name}>{clientProfileHelper.getInitials()}</Avatar>
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
            <Typography>
              {profile.full_name} {getBalance()}
            </Typography>
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
    if (profile && profile.profile && profile.profile.length > 0) {
      return (
        <CardContent>
          <Typography component="sub" variant="subtitle1">
            About me
          </Typography>
          <Divider light />
          <Container className={classes.profileContainer}>
            {/* tslint:disable-next-line: react-no-dangerous-html */}
            <Typography dangerouslySetInnerHTML={{ __html: markdownToHtml(profile.profile!) }} />
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
