export interface AmountByDate {
  amount_cents: number
  year: number
  month: number
  day: number
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
  clients_by_date: CountByDate[]
}
