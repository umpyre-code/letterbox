export type ClientID = string

export interface JwtClaims {
  exp: number
  iat: number
  iss: string
  jti: string
  nbf: number
  sub: string
}

export interface Jwt {
  token: string
  secret: string
  claims?: JwtClaims
}

export interface ClientCredentials {
  client_id: ClientID
  jwt: Jwt
}

export interface PhoneNumber {
  country_code?: string
  national_number?: string
}

export interface NewClient {
  full_name: string
  email: string
  password?: string
  password_verifier?: string
  password_salt?: string
  phone_number: PhoneNumber
  box_public_key?: string
  signing_public_key?: string
  phone_sms_verified: boolean
}

export interface ClientProfile {
  client_id: ClientID
  full_name: string
  box_public_key: string
  signing_public_key: string
  handle?: string
  profile?: string
  joined: number
  phone_sms_verified: boolean
}

export interface ClientSearchResult {
  client_id: ClientID
  full_name: string
  handle: string
  suggest: string[]
}

export interface VerifyPhoneResult {
  result: string
  client?: ClientProfile
}
