import {
  Box,
  createStyles,
  Grid,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import ReplyIcon from '@material-ui/icons/ReplyOutlined'
import moment from 'moment'
import * as React from 'react'
import { Animated } from 'react-animated-css'
import NumberFormat from 'react-number-format'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { API } from '../../store/api'
import { ApplicationState } from '../../store/ApplicationState'
import { loadingClientProfile } from '../../store/client/types'
import { deleteMessageRequest } from '../../store/messages/actions'
import { ClientCredentials } from '../../store/models/client'
import { MessageBase } from '../../store/models/messages'
import '../../util/animate.css'
import { Emoji } from '../widgets/Emoji'
import { ProfileAvatar } from '../widgets/profile/ProfileAvatar'
import { ProfileTooltip } from '../widgets/profile/ProfileTooltip'

interface Props {
  animateValue: boolean
  message: MessageBase
  isReply?: boolean
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
    animatedBox: {
      color: 'rgba(255, 215, 0, 1)',
      display: 'block',
      position: 'absolute',
      zIndex: 1,
      transform: 'translate(-20%, -50%)',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 215, 0, 0.25)',
      boxShadow: `0 0 0.8em 0.8em rgba(255, 215, 0, 0.25)`
    },
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
  <Typography variant="h5" color="inherit" style={{ paddingLeft: '3px' }}>
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
  animateValue,
  button,
  credentials,
  deleteMessage,
  message,
  history,
  isReply,
  shaded
}) => {
  const [fromProfile, setFromProfile] = React.useState(loadingClientProfile)
  const [toProfile, setToProfile] = React.useState(loadingClientProfile)
  const [showDelete, setShowDelete] = React.useState<boolean>(false)
  const [animationVisible, setAnimationVisible] = React.useState<boolean>(!message.read)
  const classes = useStyles({ shaded })

  React.useEffect(() => {
    async function fetchData() {
      const api = new API(credentials)
      api.fetchClient(message.from).then(res => {
        if (res) {
          setFromProfile(res)
        }
      })
      api.fetchClient(message.to).then(res => {
        if (res) {
          setToProfile(res)
        }
      })
    }
    fetchData()
    if (!message.read) {
      setTimeout(() => setAnimationVisible(false), 250)
    }
  }, [])

  function renderAvatar() {
    if (fromProfile.full_name.length > 0) {
      return (
        <ListItemAvatar>
          <ProfileTooltip profile={fromProfile}>
            <Box>
              <ProfileAvatar profile={fromProfile} />
            </Box>
          </ProfileTooltip>
        </ListItemAvatar>
      )
    }
    return (
      <ListItemAvatar>
        <ProfileAvatar profile={undefined} />
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
        <>
          <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>↓ from</span> {fromProfile.full_name}
        </>
      )
    }
    return (
      <>
        <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>↑ to</span> {toProfile.full_name}
      </>
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
            <>
              <Typography component="span" variant="h5" className={classes.inline} color="inherit">
                {message.pda || <Emoji ariaLabel="letter">💌</Emoji>}
              </Typography>
            </>
          }
          secondary={
            <>
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="inherit"
              >
                {getSecondryComponent()} <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>sent </span>
                {getMessageDate()}
              </Typography>
            </>
          }
        />
        {showDelete && <MessageDelete message={message} deleteMessage={deleteMessage} />}
        {isReply && <ReplyIcon />}
        {message.read && (
          <Tooltip title="Message was read" enterDelay={500}>
            <div>
              <Emoji ariaLabel="message was read">👀</Emoji>
            </div>
          </Tooltip>
        )}
        {!message.read && (
          <Tooltip title="Fresh message" enterDelay={500}>
            <div>
              <Emoji ariaLabel="fresh message">✨</Emoji>
            </div>
          </Tooltip>
        )}
        {!message.read &&
          message.value_cents > 0 &&
          message.to === credentials.client_id &&
          animateValue && (
            <Animated
              animationIn={null}
              animationOut="fadeOutUpBig"
              animationOutDuration={1200}
              isVisible={animationVisible}
            >
              <Box className={classes.animatedBox}>
                <Grid container wrap="nowrap">
                  <Grid item>
                    <Typography>+</Typography>
                  </Grid>
                  <Grid item>
                    <MessageValue message={message} />
                  </Grid>
                </Grid>
              </Box>
            </Animated>
          )}
        <MessageValue message={message} />
      </ListItem>
    </Box>
  )
}

MessageListItemFC.defaultProps = {
  isReply: false
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
