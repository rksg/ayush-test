import { defineMessage, MessageDescriptor } from 'react-intl'

export enum ExpirationType {
  SPECIFIED_DATE = 'SPECIFIED_DATE',
  MINUTES_AFTER_TIME = 'MINUTES_AFTER_TIME',
  HOURS_AFTER_TIME = 'HOURS_AFTER_TIME',
  DAYS_AFTER_TIME = 'DAYS_AFTER_TIME',
  WEEKS_AFTER_TIME = 'WEEKS_AFTER_TIME',
  MONTHS_AFTER_TIME = 'MONTHS_AFTER_TIME',
  QUARTERS_AFTER_TIME = 'QUARTERS_AFTER_TIME',
  YEARS_AFTER_TIME = 'YEARS_AFTER_TIME',
  END_OF_HOUR = 'END_OF_HOUR',
  END_OF_DAY = 'END_OF_DAY',
  END_OF_WEEK = 'END_OF_WEEK',
  END_OF_MONTH = 'END_OF_MONTH',
  END_OF_QUARTER = 'END_OF_QUARTER',
  END_OF_HALF = 'END_OF_HALF',
  END_OF_YEAR = 'END_OF_YEAR'
}

export class ExpirationDateEntity {
  expirationType: ExpirationType | null // null means Never expires

  expirationOffset?: number // If 'expirationType' is not SPECIFIED_DATE then this field is the offset amount

  expirationDate?: string // If 'expirationType' is SPECIFIED_DATE then this field is the related date in format YYYY-MM-DD.

  constructor () {
    this.expirationType = null
  }
}

export enum ExpirationMode {
  NEVER,
  BY_DATE,
  AFTER_DATE
}

export const ExpirationModeLabel: Record<ExpirationMode, MessageDescriptor> = {
  [ExpirationMode.NEVER]: defineMessage({ defaultMessage: 'Never expires' }),
  [ExpirationMode.BY_DATE]: defineMessage({ defaultMessage: 'By date' }),
  [ExpirationMode.AFTER_DATE]: defineMessage({ defaultMessage: 'After...' })
}
