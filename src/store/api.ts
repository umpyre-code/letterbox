import axios, { AxiosInstance } from 'axios'
import { ClientCredentials, NewClient, ClientProfile, ClientID } from './models/client'
import { Message, MessageList } from './models/messages'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://api.staging.umpyre.io'

export class API {
  public static async SUBMIT_NEW_CLIENT(newClient: NewClient): Promise<ClientCredentials> {
    return axios.post(API_ENDPOINT + '/client', newClient).then(response => response.data)
  }

  public static async FETCH_CLIENT(
    credentials: ClientCredentials,
    clientId: ClientID
  ): Promise<ClientProfile> {
    const api = new API(credentials)
    return api.fetchClient(clientId)
  }

  public static async FETCH_MESSAGES(credentials: ClientCredentials): Promise<MessageList> {
    const api = new API(credentials)
    return api.fetchMessages()
  }

  private client: AxiosInstance

  constructor(credentials: ClientCredentials) {
    const API_KEY = credentials.token
    this.client = axios.create({ baseURL: API_ENDPOINT, headers: { 'X-UMPYRE-APIKEY': API_KEY } })
  }

  public async fetchClient(clientId: ClientID): Promise<ClientProfile> {
    return this.client.get(`/client/${clientId}`).then(response => response.data)
  }

  public async fetchMessages(): Promise<MessageList> {
    return this.client.get('/messages').then(response => response.data)
  }

  public async sendMessage(message: Message): Promise<Message> {
    return this.client.post('/messages', message).then(response => response.data)
  }
}
