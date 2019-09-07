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
import { DefaultLayout } from '../components/layout/DefaultLayout'
import MessageBodyFc from '../components/messages/MessageBodyFc'
import { MessageListItem } from '../components/messages/MessageListItem'
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

const LazyComposeForm = React.lazy(() => import('../components/drafts/compose/ComposeForm'))

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
    },
    messagesPaper: {
      overflow: 'auto'
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
  const messageRef = React.createRef<HTMLDivElement>()
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
  }, [messageHash, credentials])

  React.useEffect(() => {
    // mark any unread messages as read
    _.filter(loadedMessages, message => !message.read).forEach(message => {
      messageRead(message.hash)
    })
  }, [loadedMessages.length])

  React.useEffect(() => {
    // scroll to message
    if (messageRef.current) {
      messageRef.current.scrollIntoView()
    }
  }, [messageRef, messageHash])

  function messageBodies() {
    return loadedMessages.map((message, index) => (
      <React.Fragment key={message.hash}>
        <Container className={classes.bodyContainer} ref={messageRef}>
          <MessageListItem
            message={message}
            shaded={false}
            button={false}
            isReply={message.body.parent && message.body.parent.length > 0}
          />
          <Divider />
          <MessageBodyFc body={message.body} />
          {index === loadedMessages.length - 1 && (
            <React.Fragment>
              <Divider />
              <Container className={classes.buttonContainer}>
                <Grid container justify="space-between">
                  <Grid item>
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
            </React.Fragment>
          )}
          {message.hash in draftsMap && (
            <React.Fragment>
              <Divider />
              <Container className={classes.bodyContainer} key={draftsMap[message.hash].id}>
                <LazyComposeForm draft={draftsMap[message.hash]} />
              </Container>
            </React.Fragment>
          )}
        </Container>
      </React.Fragment>
    ))
  }

  return (
    <ClientInit>
      <DefaultLayout balance={balance} profile={profile}>
        <Container className={classes.bodyContainer}>
          <Paper className={classes.messagesPaper}>{messageBodies()}</Paper>
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
