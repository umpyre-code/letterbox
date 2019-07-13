export type ClientID = string

export interface ClientCredentials {
  client_id: ClientID
  token: string
}

export interface PhoneNumber {
  country_code?: string
  national_number?: string
}

export interface NewClient {
  full_name: string
  email: string
  password_hash: string
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
}
