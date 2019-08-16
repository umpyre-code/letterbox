import { RouterState } from 'connected-react-router'
import { AccountState } from './account/types'
import { ClientState } from './client/types'
import { DraftsState } from './drafts/types'
import { KeysState } from './keyPairs/types'
import { MessagesState } from './messages/types'

export interface ApplicationState {
  accountState: AccountState
  clientState: ClientState
  draftsState: DraftsState
  keysState: KeysState
  messagesState: MessagesState
  router: RouterState
}
