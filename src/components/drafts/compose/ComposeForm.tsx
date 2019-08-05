import {
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
import * as React from 'react'
import { connect } from 'react-redux'
import {
  removeDraftRequest,
  sendDraftRequest,
  updateDraftRequest
} from '../../../store/drafts/actions'
import { Draft } from '../../../store/drafts/types'
import { MessageBody } from '../../../store/models/messages'
import { htmlToMarkdown } from '../../../util/htmlToMarkdown'
import { PaymentInput } from '../../widgets/PaymentInput'
import { Editor } from './Editor'
import {
  AddCreditsButton,
  DiscardButton,
  PDAField,
  PDAToolTip,
  RecipientField,
  SendButton
} from './Widgets'
import { Balance } from '../../../store/models/account'
import { ApplicationState } from '../../../store'

const UMPYRE_MESSAGE_SEND_FEE = 0.15

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

export function calculateMessageCost(amountCents: number) {
  if (amountCents === 0) {
    return 0
  } else {
    return Math.round(amountCents * (1 - UMPYRE_MESSAGE_SEND_FEE))
  }
}

interface Props {
  draft: Draft
  balance: Balance
}

interface PropsFromDispatch {
  removeDraft: typeof removeDraftRequest
  sendDraft: typeof sendDraftRequest
  updateDraft: typeof updateDraftRequest
}

type AllProps = Props & PropsFromDispatch

// tslint:disable-next-line: max-func-body-length
const ComposeFormFC: React.FC<AllProps> = ({
  balance,
  removeDraft,
  sendDraft,
  updateDraft,
  draft
}) => {
  const [editorState, setEditorState] = React.useState(
    draft.editorContent
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(draft.editorContent)))
      : EditorState.createEmpty()
  )
  const [recipient, setRecipient] = React.useState(draft.recipient)
  const [pda, setPda] = React.useState(draft.pda)
  const [messageValue, setMessageValue] = React.useState<number | undefined>(
    Math.trunc(draft.value_cents / 100)
  )
  const classes = useStyles()

  function handleSend() {
    const messageBody: MessageBody = {
      markdown: htmlToMarkdown(stateToHTML(editorState.getCurrentContent()))
    }
    const message = {
      body: JSON.stringify(messageBody),
      pda,
      sent_at: new Date(),
      to: recipient,
      value_cents: (messageValue ? messageValue : 0) * 100
    }
    sendDraft({ ...draft, message })
  }

  function handleDiscard() {
    removeDraft(draft)
  }

  function balanceIsSufficient() {
    return (
      (messageValue &&
        calculateMessageCost(messageValue * 100) <= balance.balance_cents + balance.promo_cents) ||
      messageValue === 0
    )
  }

  function readyToSend() {
    if (
      editorState.getCurrentContent().hasText() &&
      recipient !== '' &&
      pda !== '' &&
      balanceIsSufficient()
    ) {
      return true
    } else {
      return false
    }
  }

  function showAddCreditsButton() {
    if (!balanceIsSufficient()) {
      return <AddCreditsButton />
    } else {
      return (
        <SendButton
          classes={classes}
          enabled={readyToSend() && !draft.sending}
          handleSend={handleSend}
        />
      )
    }
  }

  return (
    <Paper className={classes.root}>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item xs={2}>
          <RecipientField
            initialValue={draft.recipient}
            setRecipient={(value: string) => {
              setRecipient(value)
              updateDraft({ ...draft, recipient: value })
            }}
          />
        </Grid>
        <Grid item xs>
          <PDAField
            initialValue={draft.pda}
            setPda={(value: string) => {
              setPda(value)
              updateDraft({ ...draft, pda: value })
            }}
          />
        </Grid>
        <Grid item xs="auto">
          <PDAToolTip />
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Editor
            editorState={editorState}
            onChange={(updatedEditorState: EditorState) => {
              setEditorState(updatedEditorState)
              updateDraft({
                ...draft,
                editorContent: JSON.stringify(convertToRaw(updatedEditorState.getCurrentContent()))
              })
            }}
            placeholder="🔐 message body is private"
          />
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12} sm container alignContent="center" justify="flex-start">
          <Grid item xs>
            <PaymentInput
              style={{ margin: '0 10px 0 0', padding: '10', width: 150 }}
              placeholder="Message value"
              label="Payment"
              defaultValue={draft.value_cents / 100}
              onChange={event => {
                const value = Number(event.target.value)
                setMessageValue(value)
                updateDraft({ ...draft, value_cents: value * 100 })
              }}
            />
            {showAddCreditsButton()}
          </Grid>
          <Grid item xs>
            <DiscardButton
              classes={classes}
              enabled={!draft.sending}
              handleDiscard={handleDiscard}
            />
          </Grid>
        </Grid>
      </Grid>
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
  sendDraft: sendDraftRequest,
  updateDraft: updateDraftRequest
}

const mapStateToProps = ({ accountState }: ApplicationState) => ({
  balance: accountState.balance
})

const ComposeForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(ComposeFormFC)

export default ComposeForm
