import { ClientProfile } from './client'

export interface AmountByDate {
  amount_cents: number
  year: number
  month: number
  day: number
}

export interface AmountByClient {
  amount_cents: number
  client_id: string
  profile?: ClientProfile
}

export interface CountByDate {
  count: number
  year: number
  month: number
  day: number
}

export interface Stats {
  message_read_amount: AmountByDate[]
  message_sent_amount: AmountByDate[]
  most_well_read: AmountByClient[]
  most_generous: AmountByClient[]
  clients_by_date: CountByDate[]
  clients_by_ral: AmountByClient[]
}
