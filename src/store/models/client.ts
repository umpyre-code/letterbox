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
  public_key?: string
}

export interface ClientProfile {
  client_id: string
  full_name: string
  public_key: string
}
