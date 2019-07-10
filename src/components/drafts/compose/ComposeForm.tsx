import {
  Box,
  createStyles,
  Divider,
  Grid,
  LinearProgress,
  makeStyles,
  Paper,
  Theme
} from '@material-ui/core'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { stateToHTML } from 'draft-js-export-html'
import 'draft-js-inline-toolbar-plugin/lib/plugin.css'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import createMarkdownPlugin from 'draft-js-markdown-plugin'
import Editor from 'draft-js-plugins-editor'
import createPrismPlugin from 'draft-js-prism-plugin'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import * as React from 'react'
import { connect } from 'react-redux'
import { removeDraftRequest, updateDraftRequest } from '../../../store/drafts/actions'
import { Draft } from '../../../store/drafts/types'
import { sendMessageRequest } from '../../../store/messages/actions'
import { htmlToMarkdown } from '../../../util/htmlToMarkdown'
import { MessageBodyModel } from '../../messages/MessageBody'
import './Draft.css'
import {
  DiscardButton,
  DraftInlineToolbar,
  inlineToolbarPlugin,
  PDAField,
  PDAToolTip,
  RecipientField,
  SendButton
} from './Widgets'

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
    progress: {
      margin: theme.spacing(1, 0, 0, 0)
    },
    root: {
      padding: theme.spacing(1, 1),
      width: '100%'
    },

    sendIcon: {
      marginLeft: theme.spacing(1)
    }
  })
)

interface Props {
  draft: Draft
}

interface PropsFromDispatch {
  removeDraft: typeof removeDraftRequest
  sendMessage: typeof sendMessageRequest
  updateDraft: typeof updateDraftRequest
}

type AllProps = Props & PropsFromDispatch

const ComposeFormFC: React.FC<AllProps> = ({ removeDraft, sendMessage, updateDraft, draft }) => {
  const [editorState, setEditorState] = React.useState(
    draft.editorContent
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(draft.editorContent)))
      : EditorState.createEmpty()
  )
  const [recipient, setRecipient] = React.useState(draft.recipient)
  const [pda, setPda] = React.useState(draft.pda)
  const classes = useStyles()

  function handleSend() {
    const messageBody: MessageBodyModel = {
      markdown: htmlToMarkdown(stateToHTML(editorState.getCurrentContent()))
    }
    const message = {
      body: JSON.stringify(messageBody),
      pda,
      sent_at: new Date(),
      to: recipient
    }
    updateDraft({ ...draft, sending: true })
    sendMessage({ message, draft })
  }

  function handleDiscard() {
    removeDraft(draft)
  }

  return (
    <Paper className={classes.root}>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item xs={5}>
          <RecipientField
            initialValue={draft.recipient}
            setRecipient={(value: string) => {
              setRecipient(value)
              updateDraft({ ...draft, recipient: value })
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <PDAField
            initialValue={draft.pda}
            setPda={(value: string) => {
              setPda(value)
              updateDraft({ ...draft, pda: value })
            }}
          />
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
                updateDraft({
                  ...draft,
                  editorContent: JSON.stringify(
                    convertToRaw(updatedEditorState.getCurrentContent())
                  )
                })
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
            <SendButton classes={classes} enabled={!draft.sending} handleSend={handleSend} />
          </Grid>
          <Grid item xs={4}>
            <DiscardButton
              classes={classes}
              enabled={!draft.sending}
              handleDiscard={handleDiscard}
            />
          </Grid>
        </Grid>
      </Grid>
      <DraftInlineToolbar />
      {draft.sending && (
        <Grid item xs={12}>
          <LinearProgress className={classes.progress} />
        </Grid>
      )}
    </Paper>
  )
}

const mapDispatchToProps = {
  removeDraft: removeDraftRequest,
  sendMessage: sendMessageRequest,
  updateDraft: updateDraftRequest
}

const mapStateToProps = () => ({})

const ComposeForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(ComposeFormFC)

export default ComposeForm
