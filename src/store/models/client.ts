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
}

export interface ClientProfile {
  client_id: string
  full_name: string
  box_public_key: string
  signing_public_key: string
  handle?: string
  profile?: string
  joined: number
}
