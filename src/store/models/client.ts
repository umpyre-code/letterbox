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
  secret?: ArrayBuffer
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
  referred_by?: string
}

export interface MicroClientProfile {
  client_id: ClientID
  full_name: string
  handle?: string
  avatar_version?: number
}

export interface ClientProfile extends MicroClientProfile {
  box_public_key: string
  signing_public_key: string
  profile?: string
  joined: number
  phone_sms_verified: boolean
  ral: number
}

export interface ClientSearchResult extends MicroClientProfile {
  suggest: string[]
}

export interface VerifyPhoneResult {
  result: string
  client?: ClientProfile
}

export interface AuthHandshakeRequest {
  email: string
  a_pub: string
}

export interface AuthHandshakeResponse {
  b_pub: string
  salt: string
}

export interface AuthVerifyRequest {
  a_pub: string
  client_proof: string
  email: string
}

export interface AuthVerifyResponse extends ClientCredentials {
  server_proof: string
}

export enum EmailNotificationPrefs {
  NEVER = 'never',
  RAL = 'ral',
  ALWAYS = 'always'
}

export interface ClientPrefs {
  email_notifications: EmailNotificationPrefs
  include_in_leaderboard: boolean
}
