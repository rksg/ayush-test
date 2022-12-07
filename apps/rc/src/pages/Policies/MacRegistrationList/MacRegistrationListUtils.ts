import moment from 'moment-timezone'

import { getIntl } from '@acx-ui/utils'

export function macAddressRegExp (value: string) {
  const { $t } = getIntl()
  const HYPHEN_2_GROUPS = new RegExp(/^([0-9A-F]{6})-([0-9A-F]{6})$/)
  const COLON_6_GROUPS = new RegExp(/^([0-9A-F]{2}:){5}([0-9A-F]{2})$/)
  const HYPHEN_6_GROUPS = new RegExp(/^([0-9A-F]{2}-){5}([0-9A-F]{2})$/)
  const DOTS_3_GROUPS = new RegExp(/^([0-9A-F]{4}[.]){2}([0-9A-F]{4})$/)
  const NO_DELIMITER = new RegExp(/^[0-9A-F]{12}$/)
  if (value && !(HYPHEN_2_GROUPS.test(value) ||
    COLON_6_GROUPS.test(value) ||
    HYPHEN_6_GROUPS.test(value) ||
    DOTS_3_GROUPS.test(value) ||
    NO_DELIMITER.test(value))) {
    return Promise.reject($t({ defaultMessage: 'Invalid MAC address format' }))
  }
  return Promise.resolve()
}

export function dateValidationRegExp (value: string) {
  const { $t } = getIntl()
  const today = new Date()
  if(value && new Date(value) < today) {
    return Promise.reject($t({ defaultMessage: 'The expiration date must be in the future' }))
  }
  return Promise.resolve()
}

export const expirationTimeUnits: Record<string, string> = {
  HOURS_AFTER_TIME: 'Hours' ,
  DAYS_AFTER_TIME: 'Days',
  WEEKS_AFTER_TIME: 'Weeks',
  MONTHS_AFTER_TIME: 'Months',
  YEARS_AFTER_TIME: 'Years'
}

export const toTimeString = (value?: string) => {
  return value ? moment(value).utc().format('MM/DD/YYYY') : ''
}

