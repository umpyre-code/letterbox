import { Box, Button, TextField, Theme, Tooltip, Typography, withStyles } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import HelpIcon from '@material-ui/icons/HelpOutline'
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
      color="primary"
      component={AdapterLink}
      to={`/addcredits?amountCents=${cents}`}
    >
      Add Credits for ${(cents / 100).toFixed(2)}
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
    <Button variant="contained" color="primary" onClick={handleSend} disabled={!enabled}>
      Send for ${(cents / 100).toFixed(2)}
      <SendIcon className={classes.sendIcon} />
    </Button>
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
  <Box position="relative">
    <Tooltip title="Discard this draft">
      <Button
        variant="contained"
        className={classes.discardButton}
        onClick={handleDiscard}
        disabled={!enabled}
      >
        Discard
        <DeleteIcon className={classes.deleteIcon} />
      </Button>
    </Tooltip>
  </Box>
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
          The PDA is a short message, like a subject line. The PDA is not protected by end-to-end
          encryption, and the recipient can view the PDA before the message is read.
        </Typography>
      </React.Fragment>
    }
  >
    <HelpIcon />
  </HtmlTooltip>
)
