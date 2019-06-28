import { Box, Button, TextField, Theme, Tooltip, Typography, withStyles } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import HelpIcon from '@material-ui/icons/HelpOutline'
import SendIcon from '@material-ui/icons/Send'
import * as React from 'react'

interface SendButtonProps {
  classes: Record<'sendIcon', string>
  handleSend: () => void
}

export const SendButton: React.FC<SendButtonProps> = ({ classes, handleSend }) => (
  <Tooltip title="Does everything look good? Send it!">
    <Button variant="contained" color="primary" onClick={handleSend}>
      Send
      <SendIcon className={classes.sendIcon} />
    </Button>
  </Tooltip>
)

interface DiscardButtonProps {
  classes: Record<'deleteIcon' | 'discardButton', string>
  handleDiscard: () => void
}

export const DiscardButton: React.FC<DiscardButtonProps> = ({ classes, handleDiscard }) => (
  <Box position="relative">
    <Tooltip title="Discard this draft forever">
      <Button variant="contained" className={classes.discardButton} onClick={handleDiscard}>
        Discard
        <DeleteIcon className={classes.deleteIcon} />
      </Button>
    </Tooltip>
  </Box>
)

interface RecipientFieldProps {
  setRecipient: React.Dispatch<React.SetStateAction<string>>
}

export const RecipientField: React.FC<RecipientFieldProps> = ({ setRecipient }) => (
  <TextField
    id="recipient"
    label="Recipient"
    placeholder="Who is this message for?"
    fullWidth
    onChange={event => setRecipient(event.target.value)}
  />
)

interface PDAFieldProps {
  setPda: React.Dispatch<React.SetStateAction<string>>
}

export const PDAField: React.FC<PDAFieldProps> = ({ setPda }) => (
  <TextField
    id="pda"
    label="PDA"
    placeholder="Public display of affection"
    fullWidth
    onChange={event => setPda(event.target.value)}
  />
)

const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#fdfdfd',
    border: '1px solid #dadde9',
    color: 'rgba(0, 0, 0, 0.7)',
    maxWidth: 250
  }
}))(Tooltip)

export const PDAToolTip = () => (
  <HtmlTooltip
    title={
      <React.Fragment>
        <Typography color="inherit">
          <strong>Public Display of Affection</strong>
        </Typography>
        <Typography>
          The PDA is a short message, like subject. The PDA is not protected by end-to-end
          encryption.
        </Typography>
      </React.Fragment>
    }
  >
    <HelpIcon />
  </HtmlTooltip>
)
