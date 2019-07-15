import { Box, Button, TextField, Theme, Tooltip, Typography, withStyles } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import HelpIcon from '@material-ui/icons/HelpOutline'
import SendIcon from '@material-ui/icons/Send'
import {
  BlockquoteButton,
  BoldButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  ItalicButton,
  OrderedListButton,
  UnorderedListButton
} from 'draft-js-buttons'
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin'
import * as React from 'react'

interface SendButtonProps {
  classes: Record<'sendIcon', string>
  enabled: boolean
  handleSend: () => void
}

export const SendButton: React.FC<SendButtonProps> = ({ enabled, classes, handleSend }) => (
  <Tooltip title="Look good? Send it!">
    <Button variant="contained" color="primary" onClick={handleSend} disabled={!enabled}>
      Send
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

interface RecipientFieldProps {
  setRecipient: (value: string) => void
  initialValue: string
}

export const RecipientField: React.FC<RecipientFieldProps> = ({ setRecipient, initialValue }) => (
  <TextField
    id="recipient"
    label="Recipient"
    defaultValue={initialValue}
    placeholder="Who is this message for?"
    fullWidth
    onChange={event => setRecipient(event.target.value)}
  />
)

interface PDAFieldProps {
  setPda: (value: string) => void
  initialValue: string
}

export const PDAField: React.FC<PDAFieldProps> = ({ setPda, initialValue }) => (
  <TextField
    id="pda"
    label="PDA"
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
          The PDA is a short message, like subject. The PDA is not protected by end-to-end
          encryption.
        </Typography>
      </React.Fragment>
    }
  >
    <HelpIcon />
  </HtmlTooltip>
)

export const inlineToolbarPlugin = createInlineToolbarPlugin()
const { InlineToolbar } = inlineToolbarPlugin

export const DraftInlineToolbar = () => (
  <InlineToolbar>
    {(externalProps: any) => (
      <React.Fragment>
        <HeadlineOneButton {...externalProps} />
        <HeadlineTwoButton {...externalProps} />
        <BoldButton {...externalProps} />
        <ItalicButton {...externalProps} />
        <UnorderedListButton {...externalProps} />
        <OrderedListButton {...externalProps} />
        <BlockquoteButton {...externalProps} />
      </React.Fragment>
    )}
  </InlineToolbar>
)
