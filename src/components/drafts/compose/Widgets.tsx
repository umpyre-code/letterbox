import {
  Box,
  Button,
  createStyles,
  IconButton,
  makeStyles,
  TextField,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import DeleteIcon from '@material-ui/icons/Delete'
import HelpIcon from '@material-ui/icons/Help'
import SendIcon from '@material-ui/icons/Send'
import * as React from 'react'
import { Link, LinkProps } from 'react-router-dom'

interface AddCreditsButtonProps {
  cents: number
}

const AdapterLink = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, 'innerRef'>>(
  (props, ref) => <Link innerRef={ref} {...props} />
)

export const AddCreditsButton: React.FC<AddCreditsButtonProps> = ({ cents }) => (
  <Tooltip title="Your balance is insufficient, you need to add credits first.">
    <Button
      variant="contained"
      color="secondary"
      component={AdapterLink}
      to={`/addcredits?amountCents=${cents}`}
    >
      Add Credits ${(cents / 100).toFixed(2)}
    </Button>
  </Tooltip>
)

interface SendButtonProps {
  classes: Record<'sendIcon', string>
  enabled: boolean
  handleSend: () => void
  cents: number
}

export const SendButton: React.FC<SendButtonProps> = ({ cents, enabled, classes, handleSend }) => (
  <Tooltip title="Look good? Send it!">
    <>
      <Button variant="contained" color="primary" onClick={handleSend} disabled={!enabled}>
        Send ${(cents / 100).toFixed(2)}
        <SendIcon className={classes.sendIcon} />
      </Button>
    </>
  </Tooltip>
)

interface DiscardButtonProps {
  classes: Record<'deleteIcon' | 'discardButton', string>
  enabled: boolean
  handleDiscard: () => void
}

export const DiscardButton: React.FC<DiscardButtonProps> = ({
  enabled,
  classes,
  handleDiscard
}) => (
  <Tooltip title="Discard this draft">
    <IconButton className={classes.discardButton} onClick={handleDiscard} disabled={!enabled}>
      <DeleteIcon className={classes.deleteIcon} />
    </IconButton>
  </Tooltip>
)

interface PDAFieldProps {
  disabled: boolean
  setPda: (value: string) => void
  initialValue: string
}

export const PDAField: React.FC<PDAFieldProps> = ({ disabled, setPda, initialValue }) => (
  <TextField
    id="pda"
    disabled={disabled}
    defaultValue={initialValue}
    placeholder="Public display of affection"
    fullWidth
    onChange={event => setPda(event.target.value)}
  />
)

export const PDAToolTip = () => (
  <Tooltip
    title={
      <>
        <Typography>
          <strong>Public Display of Affection</strong>
        </Typography>
        <br />
        <Typography>
          The PDA is a short message, like a subject line. The recipient can view the PDA before the
          message is read.
        </Typography>
      </>
    }
  >
    <HelpIcon />
  </Tooltip>
)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    attachFileButton: {
      height: 36,
      margin: 0,
      width: 36,
      padding: theme.spacing(1)
    }
  })
)

interface AttachFileProps {
  onClick: (event) => void
}

export const AttachFile: React.FC<AttachFileProps> = ({ onClick }) => {
  const classes = useStyles({})

  return (
    <Tooltip title="Attach file" enterDelay={250}>
      <IconButton className={classes.attachFileButton} aria-label="attach file" onClick={onClick}>
        <AttachFileIcon />
      </IconButton>
    </Tooltip>
  )
}

export const InsertImage: React.FC<{}> = () => {
  const classes = useStyles({})

  return (
    <Tooltip title="Insert image at cursor" enterDelay={250}>
      <div className={classes.attachFileButton}>
        <AddAPhotoIcon />
      </div>
    </Tooltip>
  )
}
