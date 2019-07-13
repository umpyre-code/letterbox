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
import { connect } from 'react-redux'
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

type AllProps = Props & PropsFromState

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inline: {
      display: 'inline'
    }
  })
)

const MessageListItemFC: React.FunctionComponent<AllProps> = ({ credentials, message }) => {
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
      <ListItem button onClick={() => setIsBodyVisible(!isBodyVisible)}>
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
      </ListItem>
      {renderBody()}
    </Box>
  )
}

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  credentials: clientState.credentials!
})

export const MessageListItem = connect(mapStateToProps)(MessageListItemFC)
