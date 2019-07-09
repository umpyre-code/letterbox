import axios, { AxiosInstance } from 'axios'
import { ClientCredentials, ClientID, ClientProfile, NewClient } from './models/client'
import { APIMessage, Message, MessagesResponse } from './models/messages'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://api.staging.umpyre.io'

function fromApiMessage(message: APIMessage): Message {
  return {
    ...message,
    received_at: new Date(message.received_at!.seconds * 1000 + message.received_at!.nanos / 1e6),
    sent_at: new Date(message.sent_at.seconds * 1000 + message.sent_at.nanos / 1e6)
  }
}

function fromApiMessages(response: MessagesResponse): Message[] {
  return response.messages.map((message: APIMessage) => fromApiMessage(message))
}

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

  public static async FETCH_MESSAGES(credentials: ClientCredentials): Promise<Message[]> {
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

  public async fetchMessages(): Promise<Message[]> {
    // The received_at field is actually an object that looks like this:
    // received_at: {
    //   nanos: number
    //   seconds: number,
    // }
    // Here we convert it into a local representation which has a simplified date.
    return this.client.get('/messages').then(response => fromApiMessages(response.data))
  }

  public async sendMessage(message: APIMessage): Promise<Message> {
    return this.client.post('/messages', message).then(response => fromApiMessage(response.data))
  }
}
