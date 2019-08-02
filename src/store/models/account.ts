import 'stripe-v3'

export interface Balance {
  balance_cents: number
  promo_cents: number
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
