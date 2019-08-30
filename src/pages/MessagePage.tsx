import {
  Button,
  Container,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Theme
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import ReplyIcon from '@material-ui/icons/Reply'
import _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import ClientInit from '../components/ClientInit'
import { DraftListItem } from '../components/drafts/DraftListItem'
import { DefaultLayout } from '../components/layout/DefaultLayout'
import MessageBodyFc from '../components/messages/MessageBodyFc'
import { MessageListItem } from '../components/messages/MessageListItem'
import { BackToIndexButton } from '../components/widgets/BackToIndexButton'
import { ApplicationState } from '../store/ApplicationState'
import { addDraftRequest } from '../store/drafts/actions'
import { Draft } from '../store/drafts/types'
import {
  deleteMessageRequest,
  loadMessagesRequest,
  messageReadRequest
} from '../store/messages/actions'
import { Balance } from '../store/models/account'
import { ClientCredentials, ClientProfile } from '../store/models/client'
import { DecryptedMessage } from '../store/models/messages'

interface PropsFromState {
  balance?: Balance
  credentials?: ClientCredentials
  drafts: Draft[]
  loadedMessages: DecryptedMessage[]
  profile?: ClientProfile
}

interface PropsFromDispatch {
  addDraft: typeof addDraftRequest
  deleteMessage: typeof deleteMessageRequest
  loadMessages: typeof loadMessagesRequest
  messageRead: typeof messageReadRequest
}

interface MatchParams {
  readonly messageHash: string
}

type AllProps = PropsFromState & PropsFromDispatch & Router.RouteComponentProps<MatchParams>

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    bodyContainer: {
      padding: theme.spacing(1)
    },
    buttonContainer: {
      padding: theme.spacing(1)
    },
    headerContainer: {
      padding: theme.spacing(1)
    }
  })
)

const MessagePageFC: React.FC<AllProps> = ({
  addDraft,
  balance,
  credentials,
  deleteMessage,
  drafts,
  history,
  loadedMessages,
  loadMessages,
  match,
  messageRead,
  profile
}) => {
  const classes = useStyles({})
  const { messageHash } = match.params
  const [draftsMap, setDraftsMap] = React.useState<{}>({})
  React.useEffect(() => {
    setDraftsMap(
      _.chain(drafts)
        .filter(draft => draft.inReplyTo !== undefined)
        .keyBy('inReplyTo')
        .value()
    )
  }, [drafts])

  React.useEffect(() => {
    loadMessages(messageHash)
    messageRead(messageHash)
  }, [messageHash, credentials])

  function messageBodies() {
    return loadedMessages.map((message, index) => (
      <React.Fragment>
        <Container className={classes.bodyContainer} key={message.hash}>
          <Paper>
            <MessageListItem
              message={message}
              shaded={false}
              button={false}
              isReply={message.body.parent && message.body.parent.length > 0}
            />
            <Divider />
            <MessageBodyFc body={message.body} />
            <Divider />
            <Container className={classes.buttonContainer}>
              <Grid container justify="space-between">
                <Grid item>
                  {index === loadedMessages.length - 1 && (
                    <Button
                      disabled={message.hash in draftsMap}
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        addDraft({
                          recipients: [
                            message.from === profile.client_id ? message.to : message.from
                          ],
                          pda: message.pda,
                          inReplyTo: message.hash
                        })
                      }}
                    >
                      <ReplyIcon />
                      Reply
                    </Button>
                  )}
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      deleteMessage(message.hash)
                      history.push('/')
                    }}
                  >
                    <DeleteIcon />
                    Delete
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </Paper>
          {message.hash in draftsMap && (
            <Container className={classes.bodyContainer} key={draftsMap[message.hash].id}>
              <DraftListItem draft={draftsMap[message.hash]} />
            </Container>
          )}
        </Container>
      </React.Fragment>
    ))
  }

  return (
    <ClientInit>
      <DefaultLayout balance={balance} profile={profile}>
        <Container className={classes.bodyContainer}>
          <BackToIndexButton />
          {messageBodies()}
        </Container>
      </DefaultLayout>
    </ClientInit>
  )
}

const mapStateToProps = ({
  accountState,
  clientState,
  draftsState,
  messagesState
}: ApplicationState) => ({
  balance: accountState.balance,
  credentials: clientState.credentials,
  profile: clientState.profile,
  loadedMessages: messagesState.loadedMessages,
  drafts: draftsState.drafts
})

const mapDispatchToProps = {
  addDraft: addDraftRequest,
  deleteMessage: deleteMessageRequest,
  loadMessages: loadMessagesRequest,
  messageRead: messageReadRequest
}

const MessagePage = Router.withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MessagePageFC)
)
export default MessagePage
