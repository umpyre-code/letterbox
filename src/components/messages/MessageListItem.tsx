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
  Typography
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import moment from 'moment'
import * as React from 'react'
import NumberFormat from 'react-number-format'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { API } from '../../store/api'
import { ApplicationState } from '../../store/ApplicationState'
import { ClientProfileHelper, loadingClientProfile } from '../../store/client/types'
import { deleteMessageRequest } from '../../store/messages/actions'
import { ClientCredentials } from '../../store/models/client'
import { MessageBase } from '../../store/models/messages'
import { ProfileTooltip } from '../widgets/profile/ProfileTooltip'

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

const MessageListItemFC: React.FunctionComponent<AllProps> = ({
  button,
  credentials,
  deleteMessage,
  message,
  history,
  shaded
}) => {
  const received = message.to === credentials.client_id
  const [profile, setProfile] = React.useState(ClientProfileHelper.FROM(loadingClientProfile))
  const [showDelete, setShowDelete] = React.useState<boolean>(false)
  const classes = useStyles({ shaded })

  React.useEffect(() => {
    async function fetchData() {
      const api = new API(credentials)
      const clientId = received ? message.from : message.to
      const res = await api.fetchClient(clientId)
      if (res) {
        setProfile(ClientProfileHelper.FROM(res))
      }
    }
    fetchData()
  }, [])

  function renderAvatar() {
    if (profile.full_name.length > 0) {
      return (
        <ListItemAvatar>
          <ProfileTooltip profile={profile}>
            <Avatar alt={profile.full_name}>{profile.getInitials()}</Avatar>
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

  function getSecondryComponent() {
    if (message.to === credentials.client_id) {
      return (
        <React.Fragment>
          <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>from</span> {profile.full_name}
        </React.Fragment>
      )
    }
    return (
      <React.Fragment>
        <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>to</span> {profile.full_name}
      </React.Fragment>
    )
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
              <ProfileTooltip profile={profile}>
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                  color="inherit"
                >
                  {getSecondryComponent()} <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>sent</span>
                  {getMessageDate()}
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
