import { Box, createStyles, Divider, Grid, makeStyles, Paper, Theme } from '@material-ui/core'
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
import { connect } from 'react-redux'
import { sendMessageRequest } from '../../../store/messages/actions'
import { htmlToMarkdown } from '../../../util/htmlToMarkdown'
import './Draft.css'
import { DiscardButton, PDAField, PDAToolTip, RecipientField, SendButton } from './Widgets'

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

interface Props {
  sendMessage: typeof sendMessageRequest
}

const ComposeFormFC: React.FC<Props> = ({ sendMessage }) => {
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
    sendMessage(message)
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
          <PDAToolTip />
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
              placeholder="🔐 the message body is private"
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
        {(externalProps: any) => (
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

const mapDispatchToProps = {
  sendMessage: sendMessageRequest
}

const mapStateToProps = () => ({})

const ComposeForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(ComposeFormFC)

export default ComposeForm
