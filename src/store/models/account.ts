import 'stripe-v3'

export interface Balance {
  balance_cents: number
  promo_cents: number
  withdrawable_cents: number
}

export interface ChargeRequest {
  amount_cents: number
  token: stripe.Token
}

export interface ChargeResponse {
  result: string
  api_response: stripe.paymentIntents.Charge
  message: string
  balance?: Balance
}

export interface ChargeErrorResponse {
  result: string
  api_response: stripe.Error
  message: string
}

export interface FetchConnectAccountInfoResponse {
  client_id: string
  connect_account: ConnectAccountInfo
}

export interface ConnectAccountPrefs {
  enable_automatic_payouts: boolean
  automatic_payout_threshold_cents: number
}

export interface ConnectAccountInfo {
  state: string
  login_link_url?: string
  oauth_url?: string
  preferences: ConnectAccountPrefs
}

export interface ConnectOauth {
  authorization_code: string
  oauth_state: string
}

export interface PostConnectOauthResponse {
  client_id: string
  connect_account: ConnectAccountInfo
}
