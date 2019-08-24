import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import * as jwt from 'jsonwebtoken'
import qs from 'qs'
import {
  Balance,
  ChargeRequest,
  ChargeResponse,
  ConnectAccountInfo,
  ConnectAccountPrefs,
  ConnectOauth,
  PostConnectOauthResponse,
  SettlePaymentResponse
} from './models/account'
import {
  AuthHandshakeRequest,
  AuthHandshakeResponse,
  AuthVerifyRequest,
  AuthVerifyResponse,
  ClientCredentials,
  ClientID,
  ClientProfile,
  ClientSearchResult,
  NewClient,
  VerifyPhoneResult
} from './models/client'
import { APIMessage, MessageHash } from './models/messages'

const API_ENDPOINT = process.env.API_ENDPOINT || 'https://api.staging.umpyre.io'

export class API {
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
    sketch: string
  ): Promise<APIMessage[]> {
    const api = new API(credentials)
    return api.fetchMessages(sketch)
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
      retries: 10,
      retryDelay: retryCount => {
        return (retryCount + 1) ** 1.5 * 1000
      }
    })
  }

  public async fetchClient(clientId: ClientID): Promise<ClientProfile> {
    return this.client.get(`/client/${clientId}`).then(response => response.data)
  }

  public async fetchClientByHandle(handle: string): Promise<ClientProfile> {
    return this.client.get(`/handle/${handle}`).then(response => response.data)
  }

  public async fetchMessages(sketch: string): Promise<APIMessage[]> {
    // The received_at field is actually an object that looks like this:
    // received_at: {
    //   nanos: number
    //   seconds: number,
    // }
    // Here we convert it into a local representation which has a simplified date.
    const params = new URLSearchParams()
    params.append('sketch', sketch)
    return this.client.get('/messages', { params }).then(response => response.data)
  }

  public async sendMessages(messages: APIMessage[]): Promise<APIMessage[]> {
    return this.client.post('/messages', messages).then(response => response.data)
  }

  public async updateClientProfile(clientProfile: ClientProfile): Promise<ClientProfile> {
    return this.client
      .put(`/client/${clientProfile.client_id}`, clientProfile)
      .then(response => response.data)
  }

  public async updateClientRal(clientId: ClientID, ral: number): Promise<ClientProfile> {
    return this.client
      .put(`/client/${clientId}/ral`, qs.stringify({ ral }))
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
}
