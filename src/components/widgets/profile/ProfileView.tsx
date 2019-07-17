import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
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
import { ClientProfile } from '../../../store/models/client'
import { markdownToHtml } from '../../../util/markdownToHtml'
import Loading from '../Loading'

const useStyles = makeStyles((theme: Theme) => createStyles({}))

interface Props {
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

export const ProfileView: React.FC<Props> = ({ editable, menu, profile, setIsEditing }) => {
  const classes = useStyles()
  const [menuAnchorElement, setMenuAnchorElement] = React.useState<null | HTMLElement>(null)

  const profileMenu = (
    <ProfileMenu
      menuAnchorElement={menuAnchorElement}
      setMenuAnchorElementNull={() => setMenuAnchorElement(null)}
    />
  )

  function getAction() {
    if (editable) {
      return (
        <IconButton aria-label="Edit" onClick={() => setIsEditing(true)}>
          <EditButton color="primary" />
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

  function getHandle() {
    if (profile && profile.handle && profile.handle.length > 0) {
      return <Link to={`/u/${profile.handle}`}>{`/u/${profile.handle}`}</Link>
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
          action={getAction()}
          title={<Typography>{profile.full_name}</Typography>}
          subheader={getHandle()}
        />
      )
    } else {
      return <Loading />
    }
  }

  function getCardBody() {
    if (profile && profile.profile && profile.profile.length > 0) {
      return (
        <React.Fragment>
          <CardContent>
            <Typography component="sub" variant="subtitle1">
              About me
            </Typography>
            <Divider light />
            {/* tslint:disable-next-line: react-no-dangerous-html */}
            <Typography dangerouslySetInnerHTML={{ __html: markdownToHtml(profile.profile!) }} />
          </CardContent>
        </React.Fragment>
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
