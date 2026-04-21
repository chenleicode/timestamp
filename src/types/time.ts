export type TimestampUnit = 'seconds' | 'milliseconds'

export type TimezoneMode =
  | 'beijing'
  | 'tokyo'
  | 'seoul'
  | 'singapore'
  | 'london'
  | 'new-york'
  | 'los-angeles'
  | 'sydney'
  | 'utc'

export interface DateTimeParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export interface ConversionResult {
  seconds: string
  milliseconds: string
}
