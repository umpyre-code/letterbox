import {
  Avatar,
  Box,
  createStyles,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
  Tooltip,
  withStyles
} from '@material-ui/core'
import { TypographyProps } from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/Delete'
import moment from 'moment'
import * as React from 'react'
import NumberFormat from 'react-number-format'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { ApplicationState } from '../../store/ApplicationState'
import { API } from '../../store/api'
import { ClientProfileHelper, loadingClientProfile } from '../../store/client/types'
import { deleteMessageRequest } from '../../store/messages/actions'
import { ClientCredentials, ClientProfile } from '../../store/models/client'
import { MessageBase } from '../../store/models/messages'
import { Profile } from '../widgets/profile/Profile'
import { ProfileView } from '../widgets/profile/ProfileView'

interface Props {
  message: MessageBase
  shaded: boolean
  button: boolean
}

interface PropsFromState {
  credentials?: ClientCredentials
}

interface PropsFromDispatch {
  deleteMessage: typeof deleteMessageRequest
}

type AllProps = Props & PropsFromState & PropsFromDispatch & Router.RouteComponentProps<{}>

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    deleteButton: {
      height: 48,
      margin: theme.spacing(1),
      width: 48
    },
    inline: {
      display: 'inline'
    },
    listItem: {
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.03)'
      },
      padding: theme.spacing(1)
    },
    listItemShaded: {
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        color: 'rgba(0, 0, 0, 1)'
      },
      color: 'rgba(0, 0, 0, 0.5)',
      padding: theme.spacing(1)
    },
    profileTooltip: {
      margin: 0,
      padding: 0
    }
  })
)

interface MessageValueProps {
  message: MessageBase
}

const MessageValue: React.FC<MessageValueProps> = ({ message }) => (
  <Typography variant="h5" color="inherit">
    <NumberFormat
      allowNegative={false}
      decimalScale={0}
      value={Math.trunc(message.value_cents / 100)}
      thousandSeparator
      prefix="$"
      displayType="text"
    />
  </Typography>
)

interface MessageDeleteProps {
  message: MessageBase
  deleteMessage: typeof deleteMessageRequest
}

const MessageDelete: React.FC<MessageDeleteProps> = ({ deleteMessage, message }) => {
  const classes = useStyles({})

  return (
    <IconButton
      className={classes.deleteButton}
      aria-label="delete"
      onClick={event => {
        event.stopPropagation()
        deleteMessage(message.hash)
      }}
    >
      <DeleteIcon className="messageDeleteButton" />
    </IconButton>
  )
}

const ProfileTooltipStyled = withStyles(theme => ({
  tooltip: {
    margin: 0,
    padding: 0,
    boxShadow: theme.shadows[3],
    color: 'rgba(0, 0, 0, 0.87)',
    border: '0px'
  }
}))(Tooltip)

interface ProfileTooltipProps {
  profile: ClientProfile
  children: React.ReactElement
}

const ProfileTooltip: React.FunctionComponent<ProfileTooltipProps> = ({ children, profile }) => (
  <ProfileTooltipStyled
    title={<ProfileView setIsEditing={() => {}} fullProfile={true} profile={profile} />}
    enterDelay={750}
    leaveDelay={200}
  >
    {children}
  </ProfileTooltipStyled>
)

const MessageListItemFC: React.FunctionComponent<AllProps> = ({
  button,
  credentials,
  deleteMessage,
  message,
  history,
  shaded
}) => {
  const [fromProfile, setFromProfile] = React.useState(
    ClientProfileHelper.FROM(loadingClientProfile)
  )
  const [showDelete, setShowDelete] = React.useState<boolean>(false)
  const classes = useStyles({ shaded })

  React.useEffect(() => {
    async function fetchData() {
      const api = new API(credentials)
      const res = await api.fetchClient(message.from)
      if (res) {
        setFromProfile(ClientProfileHelper.FROM(res))
      }
    }
    fetchData()
  }, [])

  function renderAvatar() {
    if (fromProfile.full_name.length > 0) {
      return (
        <ListItemAvatar>
          <ProfileTooltip profile={fromProfile}>
            <Avatar alt={fromProfile.full_name}>{fromProfile.getInitials()}</Avatar>
          </ProfileTooltip>
        </ListItemAvatar>
      )
    }
    return (
      <ListItemAvatar>
        <Avatar alt="Loading">??</Avatar>
      </ListItemAvatar>
    )
  }

  function getMessageDate() {
    const now = moment()
    const then = moment(message.received_at)
    const hoursSince = now.diff(then, 'hours')
    if (hoursSince > 168) {
      return then.format('ddd, MMM M YYYY')
    }
    if (hoursSince > 24) {
      return then.format('ddd, hA')
    }
    return then.format('h:mm A')
  }

  function getListItemClass() {
    if (shaded) {
      return classes.listItemShaded
    }
    return classes.listItem
  }

  return (
    <Box>
      <ListItem
        button
        className={getListItemClass()}
        onMouseEnter={() => {
          setShowDelete(true)
        }}
        onMouseLeave={() => {
          setShowDelete(false)
        }}
        onClick={() => {
          if (button) {
            history.push(`/m/${message.hash}`)
          }
        }}
      >
        {renderAvatar()}
        <ListItemText
          primary={
            <React.Fragment>
              <Typography component="span" variant="h5" className={classes.inline} color="inherit">
                {message.pda}
              </Typography>
            </React.Fragment>
          }
          secondary={
            <React.Fragment>
              <ProfileTooltip profile={fromProfile}>
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                  color="inherit"
                >
                  <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>from</span> {fromProfile.full_name}{' '}
                  <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>sent</span> {getMessageDate()}
                </Typography>
              </ProfileTooltip>
            </React.Fragment>
          }
        />
        {showDelete && <MessageDelete message={message} deleteMessage={deleteMessage} />}
        <MessageValue message={message} />
      </ListItem>
    </Box>
  )
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  credentials: clientState.credentials
})

const mapDispatchToProps = {
  deleteMessage: deleteMessageRequest
}

export const MessageListItem = Router.withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MessageListItemFC)
)
