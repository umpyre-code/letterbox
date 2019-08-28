import {
  createStyles,
  Divider,
  Grid,
  LinearProgress,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { stateToHTML } from 'draft-js-export-html'
import * as React from 'react'
import { connect } from 'react-redux'
import { ApplicationState } from '../../../store/ApplicationState'
import {
  removeDraftRequest,
  sendDraftRequest,
  updateDraftRequest
} from '../../../store/drafts/actions'
import { Draft } from '../../../store/drafts/types'
import { Balance } from '../../../store/models/account'
import { ClientCredentials, ClientID } from '../../../store/models/client'
import { MessageBody } from '../../../store/models/messages'
import { htmlToMarkdown } from '../../../util/htmlToMarkdown'
import { PaymentInput } from '../../widgets/PaymentInput'
import { Editor } from './Editor'
import { RecipientField } from './RecipientField'
import { AddCreditsButton, DiscardButton, PDAField, PDAToolTip, SendButton } from './Widgets'

const UMPYRE_MESSAGE_SEND_FEE = 0.15

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    deleteIcon: {
      marginLeft: theme.spacing(1)
    },
    discardButton: {
      backgroundColor: '#ccc'
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
  }
  return Math.ceil(amountCents * (1 + UMPYRE_MESSAGE_SEND_FEE))
}

interface Props {
  balance?: Balance
  credentials: ClientCredentials
  draft: Draft
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
  credentials,
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
  const [recipients, setRecipients] = React.useState<ClientID[]>(draft.recipients)
  const [pda, setPda] = React.useState(draft.pda)
  const [messageValue, setMessageValue] = React.useState<number | undefined>(
    Math.trunc(draft.value_cents / 100)
  )
  const classes = useStyles({})

  function handleSend() {
    const messageBody: MessageBody = {
      markdown: htmlToMarkdown(stateToHTML(editorState.getCurrentContent())),
      parent: draft.inReplyTo
    }
    const messageDraft = {
      ...draft,
      message: {
        body: JSON.stringify(messageBody),
        deleted: false,
        from: '',
        nonce: '',
        pda,
        read: false,
        recipient_public_key: '',
        sender_public_key: '',
        sent_at: new Date(),
        to: '',
        value_cents: messageValue * 100
      },
      recipients
    }
    sendDraft(messageDraft)
  }

  function handleDiscard() {
    removeDraft(draft)
  }

  function balanceIsSufficient() {
    const costToSend = calculateMessageCost(messageValue * 100) * recipients.length
    return (
      (messageValue && balance && costToSend <= balance.balance_cents + balance.promo_cents) ||
      messageValue === 0
    )
  }

  function readyToSend() {
    if (
      editorState.getCurrentContent().hasText() &&
      recipients.length > 0 &&
      pda !== '' &&
      balanceIsSufficient()
    ) {
      return !draft.sending
    }
    return false
  }

  function showAddCreditsButton() {
    const costToSend = calculateMessageCost(messageValue * 100) * recipients.length
    if (balance) {
      const creditNeeded = costToSend - (balance.balance_cents + balance.promo_cents)
      if (!balanceIsSufficient()) {
        return <AddCreditsButton cents={creditNeeded} />
      }
    }
    return (
      <SendButton
        classes={classes}
        enabled={readyToSend()}
        handleSend={handleSend}
        cents={costToSend}
      />
    )
  }

  return (
    <Paper className={classes.root}>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item xs={12}>
          <RecipientField
            disabled={draft.sending}
            credentials={credentials}
            initialValues={draft.recipients}
            setRecipients={(value: ClientID[]) => {
              setRecipients(value)
              updateDraft({ ...draft, recipients: value, sendError: undefined })
            }}
          />
        </Grid>
        <Grid item xs>
          <PDAField
            disabled={draft.sending}
            initialValue={draft.pda}
            setPda={(value: string) => {
              setPda(value)
              updateDraft({ ...draft, pda: value, sendError: undefined })
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
                editorContent: JSON.stringify(convertToRaw(updatedEditorState.getCurrentContent())),
                sendError: undefined
              })
            }}
            placeholder="🔐 private message body"
          />
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid container item xs={12} sm justify="space-between" alignItems="flex-end">
          <Grid item container xs spacing={1} justify="flex-start" alignItems="flex-end">
            <Grid item>
              <PaymentInput
                disabled={draft.sending}
                style={{ margin: '0 10px 0 0', padding: '10', width: 150 }}
                placeholder="Message value"
                label="Payment"
                defaultValue={
                  draft.value_cents > 0 ? Math.round(draft.value_cents / 100) : undefined
                }
                onChange={event => {
                  const value = Number(event.target.value)
                  setMessageValue(value)
                  updateDraft({ ...draft, value_cents: value * 100, sendError: undefined })
                }}
              />
            </Grid>
            <Grid item>{showAddCreditsButton()}</Grid>
          </Grid>
          <Grid item>
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
      {draft.sendError && (
        <Grid item xs={12}>
          <Typography>There was an error sending. Please try again.</Typography>
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

const mapStateToProps = ({ accountState, clientState }: ApplicationState) => ({
  balance: accountState.balance,
  credentials: clientState.credentials
})

const ComposeForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(ComposeFormFC)

export default ComposeForm
