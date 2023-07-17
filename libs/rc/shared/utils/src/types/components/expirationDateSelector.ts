export enum ExpirationType {
  SPECIFIED_DATE = 'SPECIFIED_DATE',
  MINUTES_AFTER_TIME = 'MINUTES_AFTER_TIME',
  HOURS_AFTER_TIME = 'HOURS_AFTER_TIME',
  DAYS_AFTER_TIME = 'DAYS_AFTER_TIME',
  WEEKS_AFTER_TIME = 'WEEKS_AFTER_TIME',
  MONTHS_AFTER_TIME = 'MONTHS_AFTER_TIME',
  YEARS_AFTER_TIME = 'YEARS_AFTER_TIME'
}

export enum ExpirationMode {
  NEVER = 'NEVER',
  BY_DATE = 'BY_DATE',
  AFTER_TIME = 'AFTER_TIME'
}

export class ExpirationDateEntity {
  mode: ExpirationMode
  type?: ExpirationType // undefined means Never expires
  offset?: number // If 'expirationType' is not SPECIFIED_DATE then this field is the offset amount
  date?: string // If 'expirationType' is SPECIFIED_DATE then this field is the related date in format YYYY-MM-DD.

  constructor () {
    this.mode = ExpirationMode.NEVER
  }

  setToNever () {
    this.mode = ExpirationMode.NEVER
    this.type = undefined
    this.offset = undefined
    this.date = undefined
  }

  setToByDate (date: string) {
    this.mode = ExpirationMode.BY_DATE
    this.type = ExpirationType.SPECIFIED_DATE
    this.offset = undefined
    this.date = date
  }

  setToAfterTime (type: ExpirationType, offset: number) {
    this.mode = ExpirationMode.AFTER_TIME
    this.type = type
    this.offset = offset
    this.date = undefined
  }
}
