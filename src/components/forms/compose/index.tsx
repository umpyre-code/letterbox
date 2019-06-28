import {
  Box,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Theme,
  Tooltip,
  Typography,
  withStyles
} from '@material-ui/core'
import HelpIcon from '@material-ui/icons/HelpOutline'
import { EditorState } from 'draft-js'
import {
  BlockquoteButton,
  BoldButton,
  CodeBlockButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineThreeButton,
  HeadlineTwoButton,
  ItalicButton,
  OrderedListButton,
  UnderlineButton,
  UnorderedListButton
} from 'draft-js-buttons'
import { stateToHTML } from 'draft-js-export-html'
import createInlineToolbarPlugin, { Separator } from 'draft-js-inline-toolbar-plugin'
import 'draft-js-inline-toolbar-plugin/lib/plugin.css'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import createMarkdownPlugin from 'draft-js-markdown-plugin'
import Editor from 'draft-js-plugins-editor'
import createPrismPlugin from 'draft-js-prism-plugin'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import * as React from 'react'
import { htmlToMarkdown } from '../../../util/htmlToMarkdown'
import { DiscardButton, PDAField, RecipientField, SendButton } from './Widgets'
import './Draft.css'

const inlineToolbarPlugin = createInlineToolbarPlugin()
const { InlineToolbar } = inlineToolbarPlugin

const editorPlugins = [
  inlineToolbarPlugin,
  createPrismPlugin({
    prism: Prism
  }),
  createMarkdownPlugin(),
  createLinkifyPlugin()
]

const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#fdfdfd',
    border: '1px solid #dadde9',
    color: 'rgba(0, 0, 0, 0.7)',
    maxWidth: 250
  }
}))(Tooltip)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    deleteIcon: {
      marginLeft: theme.spacing(1)
    },
    discardButton: {
      backgroundColor: '#ccc',
      position: 'absolute',
      right: theme.spacing(0)
    },
    root: {
      padding: theme.spacing(1, 1)
    },
    sendIcon: {
      marginLeft: theme.spacing(1)
    }
  })
)

const ComposeForm = () => {
  const [editorState, setEditorState] = React.useState(EditorState.createEmpty())
  const [recipient, setRecipient] = React.useState('')
  const [pda, setPda] = React.useState('')
  const classes = useStyles()

  function handleSend() {
    const message = {
      body: htmlToMarkdown(stateToHTML(editorState.getCurrentContent())),
      pda,
      to: recipient
    }
    console.log(message)
  }

  function handleDiscard() {
    console.log('discard button clicked')
  }

  return (
    <Paper className={classes.root}>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item xs={5}>
          <RecipientField setRecipient={setRecipient} />
        </Grid>
        <Grid item xs={6}>
          <PDAField setPda={setPda} />
        </Grid>
        <Grid item xs={1}>
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
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Box>
            <Editor
              editorState={editorState}
              plugins={editorPlugins}
              onChange={(updatedEditorState: EditorState) => {
                setEditorState(updatedEditorState)
              }}
              placeholder="🔐 message body is private"
              spellCheck={true}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12} sm container alignItems="flex-start" justify="flex-start">
          <Grid item xs={8}>
            <SendButton classes={classes} handleSend={handleSend} />
          </Grid>
          <Grid item xs={4}>
            <DiscardButton classes={classes} handleDiscard={handleDiscard} />
          </Grid>
        </Grid>
      </Grid>
      <InlineToolbar>
        {// may be use React.Fragment instead of div to improve perfomance after React 16
        externalProps => (
          <React.Fragment>
            <HeadlineOneButton {...externalProps} />
            <HeadlineTwoButton {...externalProps} />
            <HeadlineThreeButton {...externalProps} />
            <Separator {...externalProps} />
            <BoldButton {...externalProps} />
            <ItalicButton {...externalProps} />
            <UnderlineButton {...externalProps} />
            <Separator {...externalProps} />
            <CodeButton {...externalProps} />
            <UnorderedListButton {...externalProps} />
            <OrderedListButton {...externalProps} />
            <BlockquoteButton {...externalProps} />
            <CodeBlockButton {...externalProps} />
          </React.Fragment>
        )}
      </InlineToolbar>
    </Paper>
  )
}

export default ComposeForm
