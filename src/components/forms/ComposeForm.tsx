import {
  Button,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Paper,
  TextField,
  Theme,
  Tooltip,
  Typography,
  withStyles
} from '@material-ui/core'
import HelpIcon from '@material-ui/icons/HelpOutline'
import SendIcon from '@material-ui/icons/Send'
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
import createInlineToolbarPlugin, { Separator } from 'draft-js-inline-toolbar-plugin'
import 'draft-js-inline-toolbar-plugin/lib/plugin.css'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import createMarkdownPlugin from 'draft-js-markdown-plugin'
import Editor from 'draft-js-plugins-editor'
import createPrismPlugin from 'draft-js-prism-plugin'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import * as React from 'react'
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
    backgroundColor: '#f5f5f9',
    border: '1px solid #dadde9',
    color: 'rgba(0, 0, 0, 0.95)',
    maxWidth: 250
  }
}))(Tooltip)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1)
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
  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item xs={10}>
          <TextField
            id="recipient"
            label="Recipient"
            placeholder="Who is this message for?"
            fullWidth
          />
        </Grid>
        <Grid item xs={2}>
          {' '}
          <Button variant="contained" color="primary" className={classes.button}>
            Send
            <SendIcon className={classes.sendIcon} />
          </Button>
        </Grid>
        <Grid item xs={10}>
          <TextField id="pda" label="PDA" placeholder="Public display of affection" fullWidth />
        </Grid>
        <Grid item xs={2}>
          <HtmlTooltip
            title={
              <React.Fragment>
                <Typography color="inherit">
                  <strong>Public Display of Affection</strong>
                </Typography>
                <Typography>
                  The PDA is what the recipient sees before opening the message. It's similar to a
                  subject line. However, the PDA is not protected by end-to-end encryption.
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
          <Editor
            editorState={editorState}
            plugins={editorPlugins}
            onChange={(updatedEditorState: EditorState) => {
              setEditorState(updatedEditorState)
              // console.log(htmlToMarkdown(stateToHTML(updatedEditorState.getCurrentContent())))
            }}
            placeholder="Say something nice :) Everything in the message body is private."
          />
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
