import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import * as jwt from 'jsonwebtoken'
import { Sketch } from './messages/types'
import {
  Balance,
  ChargeRequest,
  ChargeResponse,
  ConnectAccountInfo,
  ConnectAccountPrefs,
  ConnectOauth,
  PostConnectOauthResponse,
  SettlePaymentResponse,
  Transaction
} from './models/account'
import {
  AuthHandshakeRequest,
  AuthHandshakeResponse,
  AuthVerifyRequest,
  AuthVerifyResponse,
  ClientCredentials,
  ClientID,
  ClientPrefs,
  ClientProfile,
  ClientSearchResult,
  NewClient,
  VerifyPhoneResult
} from './models/client'
import { APIMessage, MessageHash } from './models/messages'
import { Stats } from './models/stats'

export const API_ENDPOINT = process.env.API_ENDPOINT || 'invalid API endpoint'
export const PUBLIC_URL = process.env.PUBLIC_URL || 'invalid public URL'

export class API {
  public static async METRIC_COUNTER_INC(metric: string) {
    return axios.post(`${API_ENDPOINT}/metrics/counter/${metric}/inc`)
  }

  public static async METRIC_COUNTER_REASON_INC(metric: string, reason: string) {
    const reasonEncoded = encodeURIComponent(reason)
    return axios.post(`${API_ENDPOINT}/metrics/counter/${metric}/${reasonEncoded}/inc`)
  }

  public static async SUBMIT_NEW_CLIENT(newClient: NewClient): Promise<ClientCredentials> {
    return axios.post(`${API_ENDPOINT}/client`, newClient).then(response => response.data)
  }

  public static async AUTH_HANDSHAKE(
    request: AuthHandshakeRequest
  ): Promise<AuthHandshakeResponse> {
    return axios
      .post(`${API_ENDPOINT}/client/auth/handshake`, request)
      .then(response => response.data)
  }

  public static async AUTH_VERIFY(request: AuthVerifyRequest): Promise<AuthVerifyResponse> {
    return axios.post(`${API_ENDPOINT}/client/auth/verify`, request).then(response => response.data)
  }

  public static async FETCH_CLIENT_PUBLIC(clientId: ClientID): Promise<ClientProfile> {
    return axios.get(`${API_ENDPOINT}/client/${clientId}`).then(response => response.data)
  }

  public static async FETCH_CLIENT(
    credentials: ClientCredentials,
    clientId: ClientID
  ): Promise<ClientProfile> {
    const api = new API(credentials)
    return api.fetchClient(clientId)
  }

  public static async FETCH_CLIENT_BY_HANDLE(
    credentials: ClientCredentials,
    handle: string
  ): Promise<ClientProfile> {
    const api = new API(credentials)
    return api.fetchClientByHandle(handle)
  }

  public static async FETCH_MESSAGES(
    credentials: ClientCredentials,
    sketch: Sketch
  ): Promise<APIMessage[]> {
    const api = new API(credentials)
    return api.fetchMessages(sketch)
  }

  public static async GET_STATS(): Promise<Stats> {
    return axios.get(`${API_ENDPOINT}/stats`).then(response => response.data)
  }

  private client: AxiosInstance

  constructor(credentials?: ClientCredentials) {
    if (credentials) {
      const { claims } = credentials.jwt
      delete claims.iat
      delete claims.exp
      delete claims.nbf
      const token = jwt.sign(credentials.jwt.claims, Buffer.from(credentials.jwt.secret), {
        expiresIn: '5m',
        notBefore: 0
      })
      this.client = axios.create({
        baseURL: API_ENDPOINT,
        headers: { 'X-UMPYRE-TOKEN': token }
      })
    } else {
      this.client = axios.create({
        baseURL: API_ENDPOINT
      })
    }
    axiosRetry(this.client, {
      retries: 5,
      retryDelay: retryCount => {
        return (retryCount + 1) ** 3 * 1000
      }
    })
  }

  public async fetchClient(clientId: ClientID): Promise<ClientProfile> {
    return this.client.get(`/client/${clientId}`).then(response => response.data)
  }

  public async fetchClientByHandle(handle: string): Promise<ClientProfile> {
    return this.client.get(`/handle/${handle}`).then(response => response.data)
  }

  public async fetchMessages(sketch: Sketch): Promise<APIMessage[]> {
    // The received_at field is actually an object that looks like this:
    // received_at: {
    //   nanos: number
    //   seconds: number,
    // }
    // Here we convert it into a local representation which has a simplified date.
    return this.client
      .get('/messages', { params: { sketch: sketch.sketch, salt: sketch.salt } })
      .then(response => response.data)
  }

  public async sendMessages(messages: APIMessage[]): Promise<APIMessage[]> {
    return this.client.post('/messages', messages).then(response => response.data)
  }

  public async updateClientProfile(clientProfile: ClientProfile): Promise<ClientProfile> {
    return this.client
      .put(`/client/${clientProfile.client_id}`, clientProfile)
      .then(response => response.data)
  }

  public async fetchBalance(): Promise<Balance> {
    return this.client.get('/account/balance').then(response => response.data)
  }

  public async fetchConnectAccount(): Promise<ConnectAccountInfo> {
    return this.client.get('/account/connect').then(response => response.data)
  }

  public async charge(charge: ChargeRequest): Promise<ChargeResponse> {
    return this.client.post('/account/charge', charge).then(response => response.data)
  }

  public async postOauth(oauth: ConnectOauth): Promise<PostConnectOauthResponse> {
    return this.client.post('/account/oauth', oauth).then(response => response.data)
  }

  public async updateConnectPrefs(prefs: ConnectAccountPrefs): Promise<ConnectAccountInfo> {
    return this.client.post('/account/connect/prefs', prefs).then(response => response.data)
  }

  public async settlePayment(hash: MessageHash): Promise<SettlePaymentResponse> {
    return this.client.put(`/messages/${hash}/settle`).then(response => response.data)
  }

  public async searchClient(prefix: string): Promise<ClientSearchResult[]> {
    return this.client.post(`/client/search/${prefix}`).then(response => response.data)
  }

  public async verifyPhone(code: number): Promise<VerifyPhoneResult> {
    return this.client.post(`/client/verify_phone/${code}`).then(response => response.data)
  }

  public async sendVerificationCode(): Promise<{}> {
    return this.client.post(`/client/verify_phone`).then(response => response.data)
  }

  public async uploadAvatar(clientId: ClientID, data: Blob): Promise<{}> {
    return this.client.post(`/img/avatar/${clientId}`, data, {
      headers: { 'Content-Type': 'image/jpeg' }
    })
  }

  public async getClientPrefs(): Promise<ClientPrefs> {
    return this.client.get(`/client/self/prefs`).then(response => response.data)
  }

  public async putClientPrefs(prefs: ClientPrefs): Promise<ClientPrefs> {
    return this.client.put(`/client/self/prefs`, prefs).then(response => response.data)
  }

  public async getReferrals(): Promise<ClientProfile[]> {
    return this.client.get(`/referrals`).then(response => response.data)
  }

  public async getTransactions(limit: number): Promise<Transaction[]> {
    return this.client
      .get('/account/transactions', { params: { limit } })
      .then(response => response.data)
  }
}
