import {
  Avatar,
  Box,
  createStyles,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import NumberFormat from 'react-number-format'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import { ApplicationState } from '../../store'
import { API } from '../../store/api'
import { ClientProfileHelper, loadingClientProfile } from '../../store/client/types'
import { ClientCredentials } from '../../store/models/client'
import { Message } from '../../store/models/messages'
import MessageBody from './MessageBody'

interface Props {
  message: Message
}

interface PropsFromState {
  credentials: ClientCredentials
}

interface MatchParams {}

interface PropsFromRouter extends Router.RouteComponentProps<MatchParams> {}

type AllProps = Props & PropsFromState & PropsFromRouter

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inline: {
      display: 'inline'
    },
    listItem: { padding: theme.spacing(1) }
  })
)

interface MessageValueProps {
  message: Message
}
const MessageValue: React.FC<MessageValueProps> = ({ message }) => (
  <Typography variant="h5">
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

const MessageListItemFC: React.FunctionComponent<AllProps> = ({
  credentials,
  message,
  history
}) => {
  const [isBodyVisible, setIsBodyVisible] = React.useState(false)
  const [fromProfile, setFromProfile] = React.useState(
    ClientProfileHelper.FROM(loadingClientProfile)
  )
  const classes = useStyles()

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

  function renderBody() {
    if (isBodyVisible) {
      return (
        <ListItem>
          <MessageBody body={message.body} />
        </ListItem>
      )
    } else {
      return null
    }
  }

  function renderAvatar() {
    if (fromProfile.full_name.length > 0) {
      return (
        <ListItemAvatar>
          <Avatar alt={fromProfile.full_name}>{fromProfile.getInitials()}</Avatar>
        </ListItemAvatar>
      )
    } else {
      return (
        <ListItemAvatar>
          <Avatar alt="Loading">??</Avatar>
        </ListItemAvatar>
      )
    }
  }

  return (
    <Box>
      <ListItem
        className={classes.listItem}
        button
        onClick={() => history.push(`/m/${message.hash!}`)}
      >
        {renderAvatar()}
        <ListItemText
          primary={
            <React.Fragment>
              <Typography
                component="span"
                variant="h5"
                className={classes.inline}
                color="textPrimary"
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
                color="textPrimary"
              >
                {fromProfile.full_name}
              </Typography>
            </React.Fragment>
          }
        />
        <MessageValue message={message} />
      </ListItem>
      {renderBody()}
    </Box>
  )
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  credentials: clientState.credentials!
})

export const MessageListItem = Router.withRouter(connect(mapStateToProps)(MessageListItemFC))
