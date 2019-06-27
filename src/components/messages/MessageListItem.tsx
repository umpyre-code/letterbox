import {
  Avatar,
  createStyles,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { Message } from '../../store/messages/types'

interface Props {
  message: Message
}

type AllProps = Props

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inline: {
      display: 'inline'
    }
  })
)

export const MessageListItem: React.FunctionComponent<AllProps> = ({ message }) => {
  const [isBodyVisible, setIsBodyVisible] = React.useState(false)
  const classes = useStyles()

  return (
    <Paper>
      <ListItem button onClick={() => setIsBodyVisible(!isBodyVisible)}>
        <ListItemAvatar>
          <Avatar alt="Alice Pleasance Liddell">AL</Avatar>
        </ListItemAvatar>
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
                from {message.from}
              </Typography>
            </React.Fragment>
          }
        />
      </ListItem>
    </Paper>
  )
}
