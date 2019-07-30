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
import * as React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { ClientProfileHelper } from '../../../store/client/types'
import { Balance, ClientProfile } from '../../../store/models/client'
import { markdownToHtml } from '../../../util/markdownToHtml'
import Loading from '../Loading'

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
    handleText: {
      color: 'rgba(0, 0, 0, 0.54)'
    },
    profileContainer: {
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
      ].join(','),
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
    const amount = Math.floor(100 * (balance.balance_cents + balance.promo_cents))
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
            <Grid
              container
              style={{ padding: 0 }}
              spacing={0}
              justify="space-between"
              alignItems="center"
            >
              <Grid item zeroMinWidth>
                <Typography>{profile.full_name}</Typography>
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
