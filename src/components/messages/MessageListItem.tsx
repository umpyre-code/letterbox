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
import { ApplicationState } from '../../store'
import { API } from '../../store/api'
import { ClientProfileHelper, loadingClientProfile } from '../../store/client/types'
import { deleteMessageRequest } from '../../store/messages/actions'
import { ClientCredentials } from '../../store/models/client'
import { Message } from '../../store/models/messages'
import { TypographyProps } from '@material-ui/core/Typography'

interface Props {
  message: Message
  shaded: boolean
  button: boolean
}

interface PropsFromState {
  credentials: ClientCredentials
}

interface PropsFromDispatch {
  deleteMessage: typeof deleteMessageRequest
}

type AllProps = Props & PropsFromState & PropsFromDispatch & Router.RouteComponentProps<{}>

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    deleteButton: {
      '& .messageDeleteButton': {
        display: 'none'
      },
      '&:hover .messageDeleteButton': {
        display: 'inline'
      },
      height: 48,
      margin: theme.spacing(1),
      width: 48
    },
    inline: {
      display: 'inline'
    },
    listItem: { padding: theme.spacing(1) }
  })
)

interface MessageValueProps {
  message: Message
  textColour: TypographyProps['color']
}

const MessageValue: React.FC<MessageValueProps> = ({ message, textColour }) => (
  <Typography variant="h5" color={textColour}>
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
  message: Message
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
        deleteMessage(message.hash!)
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
  const [fromProfile, setFromProfile] = React.useState(
    ClientProfileHelper.FROM(loadingClientProfile)
  )
  const classes = useStyles({})

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
          <Avatar alt={fromProfile.full_name}>{fromProfile.getInitials()}</Avatar>
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

  const textColour = shaded ? 'textSecondary' : 'textPrimary'

  return (
    <Box>
      <ListItem
        button
        className={classes.listItem}
        onClick={() => {
          if (button) {
            history.push(`/m/${message.hash!}`)
          }
        }}
      >
        {renderAvatar()}
        <ListItemText
          primary={
            <React.Fragment>
              <Typography
                component="span"
                variant="h5"
                className={classes.inline}
                color={textColour}
              >
                {message.pda}
              </Typography>
            </React.Fragment>
          }
          secondary={
            <React.Fragment>
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color={textColour}
              >
                <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>from</span> {fromProfile.full_name}{' '}
                <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>sent</span> {getMessageDate()}
              </Typography>
            </React.Fragment>
          }
        />
        <MessageDelete message={message} deleteMessage={deleteMessage} />
        <MessageValue message={message} textColour={textColour} />
      </ListItem>
    </Box>
  )
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  credentials: clientState.credentials!
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
