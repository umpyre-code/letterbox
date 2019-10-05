import {
  createStyles,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Input,
  LinearProgress,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core'
import loadImage from 'blueimp-load-image'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { stateToHTML } from 'draft-js-export-html'
import _ from 'lodash'
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
import { MessageBody, MessageType } from '../../../store/models/messages'
import { htmlToMarkdown } from '../../../util/htmlToMarkdown'
import { PaymentInput } from '../../widgets/PaymentInput'
import { Editor, imagePlugin } from './Editor'
import { RecipientField, ClientWithRal } from './RecipientField'
import {
  AddCreditsButton,
  DiscardButton,
  InsertImage,
  PDAField,
  PDAToolTip,
  SendButton,
  BodyField
} from './Widgets'

const UMPYRE_MESSAGE_SEND_FEE = 0.03

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    deleteIcon: {},
    discardButton: {
      height: 36,
      margin: 0,
      width: 36,
      padding: theme.spacing(1)
    },
    progress: {
      margin: theme.spacing(1, 0, 0, 0)
    },
    sendIcon: {
      marginLeft: theme.spacing(1)
    }
  })
)

const IOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)

function blobToDataURL(blob: Blob, callback: (ArrayBuffer) => void) {
  const reader = new FileReader()
  reader.onload = event => {
    callback(event.target.result)
  }
  reader.readAsDataURL(blob)
}

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
  const [body, setBody] = React.useState(draft.body)
  const [messageValue, setMessageValue] = React.useState<number | undefined>(
    Math.trunc(draft.value_cents / 100)
  )
  const [maxRal, setMaxRal] = React.useState<number | undefined>(undefined)
  const imageInputRef = React.createRef()
  const classes = useStyles({})

  function getMarkdown(): string {
    if (IOS) {
      return body
    }
    return htmlToMarkdown(stateToHTML(editorState.getCurrentContent()))
  }
  function handleSend() {
    const messageBody: MessageBody = {
      type: MessageType.MESSAGE,
      markdown: getMarkdown(),
      parent: draft.inReplyTo,
      pda
    }
    const messageDraft = {
      ...draft,
      message: {
        body: JSON.stringify(messageBody),
        deleted: false,
        from: '',
        nonce: '',
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

  function handleImageUpload(imageFiles: FileList) {
    if (imageFiles && imageFiles.length > 0) {
      _.forEach(imageFiles, file => {
        loadImage(
          file,
          (canvas, data) => {
            if (canvas.type === 'error') {
              console.error('Error loading image ')
            } else {
              const newCanvas = document.createElement('canvas')
              newCanvas.width = canvas.width
              newCanvas.height = canvas.height
              const ctx = newCanvas.getContext('2d')

              // Fill canvas bg with white
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)

              ctx.drawImage(canvas, 0, 0)

              newCanvas.toBlob(
                blob => {
                  blobToDataURL(blob, dataUrl => {
                    const newEditorState = imagePlugin.addImage(editorState, dataUrl)
                    setEditorState(newEditorState)
                  })
                },
                'image/jpeg',
                0.96
              )
            }
          },
          {
            canvas: true,
            orientation: true,
            maxWidth: 2000,
            maxHeight: 2000
          }
        )
      })
    }
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
      (editorState.getCurrentContent().hasText() || (body && body.length > 0)) &&
      recipients.length > 0 &&
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

  function getPaymentPlaceholder(): string {
    if (maxRal && maxRal > 0) {
      return `RAL $${maxRal}`
    }
    return 'Value'
  }

  return (
    <>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item xs={12}>
          <RecipientField
            disabled={draft.sending}
            credentials={credentials}
            initialValues={draft.recipients}
            setRecipients={(clientsWithRal: ClientWithRal[]) => {
              const updatedRecipients = clientsWithRal.map(c => c.client_id)
              const updatedMaxRal = _.chain(clientsWithRal)
                .map('ral')
                .max()
                .value()
              if (updatedMaxRal > 0) {
                setMaxRal(updatedMaxRal)
              } else {
                setMaxRal(undefined)
              }
              setRecipients(updatedRecipients)
              updateDraft({ ...draft, recipients: updatedRecipients, sendError: undefined })
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
          {!IOS && (
            <Editor
              editorState={editorState}
              onChange={(updatedEditorState: EditorState) => {
                setEditorState(updatedEditorState)
                const editorContent = JSON.stringify(
                  convertToRaw(updatedEditorState.getCurrentContent())
                )
                updateDraft({
                  ...draft,
                  editorContent,
                  sendError: undefined
                })
              }}
              placeholder="🔐 private message body"
              images
            />
          )}
          {IOS && (
            <BodyField
              disabled={draft.sending}
              initialValue={draft.body}
              setBody={(value: string) => {
                setBody(value)
                updateDraft({ ...draft, body: value, sendError: undefined })
              }}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid container item spacing={2} justify="space-between" alignItems="flex-end">
          {/* <Grid item container spacing={1} justify="flex-start" alignItems="flex-end"> */}
          <Grid item>
            <PaymentInput
              disabled={draft.sending}
              style={{ margin: '0 0 0 0', padding: '3', width: 110 }}
              placeholder={getPaymentPlaceholder()}
              label="Payment"
              defaultValue={draft.value_cents > 0 ? Math.round(draft.value_cents / 100) : undefined}
              onChange={event => {
                const value = Number(event.target.value)
                setMessageValue(value)
                updateDraft({ ...draft, value_cents: value * 100, sendError: undefined })
              }}
            />
          </Grid>
          <Grid item>{showAddCreditsButton()}</Grid>
          <Grid item>
            <Divider orientation="vertical" style={{ marginLeft: 3, marginRight: 3, height: 36 }} />
          </Grid>
          {!IOS && (
            <Grid item>
              <FormControl>
                <FormControlLabel
                  label={<InsertImage />}
                  control={
                    <Input
                      inputRef={imageInputRef}
                      style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
                      inputProps={{
                        accept: 'image/png, image/jpeg, image/gif'
                      }}
                      aria-describedby="upload-image"
                      type="file"
                      onChange={event => {
                        const target = event.target as HTMLInputElement
                        handleImageUpload(target.files)
                        if (imageInputRef.current) {
                          const element = imageInputRef.current as HTMLInputElement
                          element.value = ''
                        }
                      }}
                    />
                  }
                />
              </FormControl>
            </Grid>
          )}
          {/* <Grid item>
            <AttachFile
              onClick={e => {
                console.log(e)
              }}
            />
          </Grid> */}
          <Grid item xs />
          {/* </Grid> */}
          {/* <Grid item container spacing={1} justify="flex-end" alignItems="flex-end" zeroMinWidth> */}
          <Grid item>
            <DiscardButton
              classes={classes}
              enabled={!draft.sending}
              handleDiscard={handleDiscard}
            />
            {/* </Grid> */}
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
    </>
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
